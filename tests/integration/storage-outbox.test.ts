import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, beforeEach, test } from "node:test";

import {
  drainStorageDeletionJobs,
  enqueueStorageDeletion,
} from "../../src/lib/storage/cleanup";
import { LocalStorageAdapter } from "../../src/lib/storage/local";
import { buildStorageKey } from "../../src/lib/storage/types";
import { testDb, resetTestData } from "./helpers/db";
import { FakeStorage } from "./helpers/storage";

beforeEach(async () => {
  await resetTestData();
});

after(async () => {
  await testDb.$disconnect();
});

test("buildStorageKey inclui UUID e mantém o nome sanitizado", () => {
  const key = buildStorageKey(
    "user-1",
    "process-1",
    "contrato social.pdf"
  );

  assert.match(
    key,
    /^uploads\/user-1\/process-1\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-contrato_social\.pdf$/
  );
});

test("dois uploads com o mesmo nome geram chaves diferentes", () => {
  const first = buildStorageKey("user-1", "process-1", "peticao.pdf");
  const second = buildStorageKey("user-1", "process-1", "peticao.pdf");

  assert.notEqual(first, second);
  assert.ok(first.endsWith("-peticao.pdf"));
  assert.ok(second.endsWith("-peticao.pdf"));
});

test("enqueueStorageDeletion reabre um job já processado", async () => {
  const key = `uploads/test/${randomUUID()}.pdf`;

  await testDb.storageDeletionJob.create({
    data: {
      key,
      processedAt: new Date(),
      attempts: 4,
      lastError: "falha anterior",
    },
  });

  await enqueueStorageDeletion(testDb, [key]);

  const job = await testDb.storageDeletionJob.findUnique({ where: { key } });
  assert.ok(job);
  assert.equal(job.processedAt, null);
  assert.equal(job.attempts, 0);
  assert.equal(job.lastError, null);
});

test("drain remove o arquivo, é idempotente e reabre job para nova exclusão", async () => {
  const storageDir = await mkdtemp(path.join(tmpdir(), "crm-storage-"));
  const storage = new LocalStorageAdapter(storageDir);
  const key = `uploads/test/${randomUUID()}-contrato.pdf`;
  const filePath = path.join(storageDir, key);

  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, "conteúdo inicial");

    await enqueueStorageDeletion(testDb, [key]);
    const firstDrain = await drainStorageDeletionJobs(10, {
      storage,
      db: testDb,
    });

    assert.equal(firstDrain.processed, 1);
    await assert.rejects(readFile(filePath), /ENOENT/);

    // Apagar um arquivo que já não existe não é erro.
    await storage.delete(key);

    // O mesmo key volta a ser usado; o job precisa ser reaberto.
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, "conteúdo novo");
    await enqueueStorageDeletion(testDb, [key]);

    const reopened = await testDb.storageDeletionJob.findUnique({
      where: { key },
    });
    assert.ok(reopened);
    assert.equal(reopened.processedAt, null);
    assert.equal(reopened.attempts, 0);

    const secondDrain = await drainStorageDeletionJobs(10, {
      storage,
      db: testDb,
    });
    assert.equal(secondDrain.processed, 1);
    await assert.rejects(readFile(filePath), /ENOENT/);
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});

test("falha no drain mantém o job pendente para retry", async () => {
  const key = `uploads/test/${randomUUID()}.pdf`;
  const storage = new FakeStorage();
  storage.failDeletes = true;

  await enqueueStorageDeletion(testDb, [key]);

  const result = await drainStorageDeletionJobs(10, {
    storage,
    maxAttempts: 10,
    db: testDb,
  });

  assert.equal(result.failed, 1);
  assert.equal(result.processed, 0);

  const job = await testDb.storageDeletionJob.findUnique({ where: { key } });
  assert.ok(job);
  assert.equal(job.processedAt, null);
  assert.equal(job.attempts, 1);
});

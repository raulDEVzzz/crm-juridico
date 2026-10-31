import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, beforeEach, test } from "node:test";

import { uploadDocumentForUser } from "../../src/lib/services/documents";
import { deleteProcessForUser } from "../../src/lib/services/processes";
import { LocalStorageAdapter } from "../../src/lib/storage/local";
import {
  createClient,
  createDocument,
  createProcess,
  createUser,
  resetTestData,
  testDb,
} from "./helpers/db";

const TEST_IP = "203.0.113.7";

beforeEach(async () => {
  await resetTestData();
});

after(async () => {
  await testDb.$disconnect();
});

function isLockUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const prismaError = error as Error & {
    code?: string;
    meta?: { code?: string };
  };

  return (
    prismaError.code === "55P03" ||
    prismaError.meta?.code === "55P03" ||
    /could not obtain lock/i.test(error.message)
  );
}

async function waitForProcessLock(processId: string) {
  const deadline = Date.now() + 5000;

  while (Date.now() < deadline) {
    try {
      await testDb.$transaction(async (tx) => {
        await tx.$queryRaw`
          SELECT id
          FROM processes
          WHERE id = ${processId}
          FOR UPDATE NOWAIT
        `;
      });
    } catch (error) {
      if (isLockUnavailable(error)) return;
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error("timeout esperando o lock do processo");
}

test("upload concorrente à exclusão falha sem documento nem arquivo órfão", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const existing = await createDocument({
    userId: user.id,
    clientId: client.id,
    processId: process.id,
  });

  const storageDir = await mkdtemp(path.join(tmpdir(), "crm-upload-race-"));
  const storage = new LocalStorageAdapter(storageDir);

  let releaseDocument!: () => void;
  const documentGate = new Promise<void>((resolve) => {
    releaseDocument = resolve;
  });
  let documentLocked!: () => void;
  const documentLockedPromise = new Promise<void>((resolve) => {
    documentLocked = resolve;
  });

  // Segura a linha do documento para a exclusão parar depois de já ter
  // travado o processo. Assim o upload concorrente é forçado a esperar.
  const blocker = testDb.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id
      FROM documents
      WHERE id = ${existing.id}
      FOR UPDATE
    `;
    documentLocked();
    await documentGate;
  });

  let deletion: ReturnType<typeof deleteProcessForUser> | undefined;
  let upload: ReturnType<typeof uploadDocumentForUser> | undefined;

  try {
    await documentLockedPromise;

    deletion = deleteProcessForUser(testDb, user.id, process.id, { ip: TEST_IP });
    await waitForProcessLock(process.id);

    upload = uploadDocumentForUser(testDb, storage, {
      userId: user.id,
      processId: process.id,
      fileName: "peticao.pdf",
      category: null,
      body: Buffer.from("%PDF-1.4 conteudo de teste"),
      contentType: "application/pdf",
    });

    const settledBeforeRelease = await Promise.race([
      upload.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 300)),
    ]);

    assert.equal(
      settledBeforeRelease,
      false,
      "upload não pode concluir enquanto a exclusão segura o processo"
    );

    releaseDocument();
    await blocker;

    assert.ok(deletion);
    const deletionResult = await deletion;
    assert.equal(deletionResult.status, "deleted");

    assert.ok(upload);
    const uploadResult = await upload;
    assert.equal(uploadResult.status, "not_found");
    assert.equal(
      await testDb.document.count({ where: { processId: process.id } }),
      0
    );

    await assert.rejects(
      readFile(path.join(storageDir, uploadResult.storageKey)),
      /ENOENT/
    );
  } finally {
    releaseDocument();
    await blocker.catch(() => undefined);
    if (deletion) await deletion.catch(() => undefined);
    if (upload) await upload.catch(() => undefined);
    await rm(storageDir, { recursive: true, force: true });
  }
});

test("upload concluído antes da exclusão enfileira a chave no outbox", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const storageDir = await mkdtemp(path.join(tmpdir(), "crm-upload-first-"));
  const storage = new LocalStorageAdapter(storageDir);

  try {
    const upload = await uploadDocumentForUser(testDb, storage, {
      userId: user.id,
      processId: process.id,
      fileName: "contrato.pdf",
      category: null,
      body: Buffer.from("%PDF-1.4 contrato"),
      contentType: "application/pdf",
    });

    assert.equal(upload.status, "created");
    assert.equal(
      (await readFile(path.join(storageDir, upload.storageKey))).toString(),
      "%PDF-1.4 contrato"
    );

    const deletion = await deleteProcessForUser(testDb, user.id, process.id, { ip: TEST_IP });

    assert.equal(deletion.status, "deleted");
    if (deletion.status !== "deleted") {
      assert.fail("a exclusão deveria ter concluído");
    }

    assert.deepEqual(deletion.storageKeys, [upload.storageKey]);
    assert.equal(
      await testDb.document.count({ where: { processId: process.id } }),
      0
    );

    const job = await testDb.storageDeletionJob.findUnique({
      where: { key: upload.storageKey },
    });

    assert.ok(job, "a chave do upload deve estar no outbox");
    assert.equal(job.processedAt, null);
    assert.equal(job.attempts, 0);
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});

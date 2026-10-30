import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, beforeEach, test } from "node:test";

import {
  MAX_ATTEMPTS,
  drainStorageDeletionJobs,
  enqueueStorageDeletion,
  purgeCompletedStorageJobs,
} from "../../src/lib/storage/cleanup";
import { resetTestData, testDb } from "./helpers/db";
import { FakeStorage } from "./helpers/storage";

beforeEach(async () => {
  await resetTestData();
});

after(async () => {
  await testDb.$disconnect();
});

test("drain avança de 1 a 10 falhas e só vira dead-letter na décima", async () => {
  const storage = new FakeStorage();
  storage.failDeletes = true;
  const key = `uploads/test/${randomUUID()}.pdf`;
  await enqueueStorageDeletion(testDb, [key]);

  const originalConsoleError = console.error;
  const logged: string[] = [];
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };

  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const result = await drainStorageDeletionJobs(10, {
        storage,
        db: testDb,
      });

      assert.equal(result.failed, 1, `falha na tentativa ${attempt}`);
      assert.equal(result.processed, 0);
      assert.equal(
        result.deadLetterCount,
        attempt >= MAX_ATTEMPTS ? 1 : 0,
        `deadLetterCount na tentativa ${attempt}`
      );

      const job = await testDb.storageDeletionJob.findUnique({ where: { key } });
      assert.ok(job);
      assert.equal(job.attempts, attempt);
      assert.ok(job.lastAttemptAt instanceof Date);
    }

    const afterDeadLetter = await drainStorageDeletionJobs(10, {
      storage,
      db: testDb,
    });

    assert.deepEqual(afterDeadLetter, {
      processed: 0,
      failed: 0,
      deadLetterCount: 1,
    });

    assert.equal(
      logged.filter((line) => line.includes("[STORAGE_CLEANUP_ALERT]")).length,
      1,
      "deve alertar uma única vez na quinta falha"
    );
    assert.equal(
      logged.filter((line) => line.includes("[STORAGE_CLEANUP_EXHAUSTED]"))
        .length,
      1,
      "deve registrar o esgotamento na décima falha"
    );
  } finally {
    console.error = originalConsoleError;
  }
});

test("purga dead-letter só com attempts >= MAX_ATTEMPTS e após a retenção", async () => {
  const now = new Date("2026-10-30T12:00:00.000Z");
  const old = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const recent = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const completedOld = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  await testDb.storageDeletionJob.createMany({
    data: [
      {
        key: "dead-old",
        attempts: MAX_ATTEMPTS,
        lastAttemptAt: old,
      },
      {
        key: "dead-recent",
        attempts: MAX_ATTEMPTS,
        lastAttemptAt: recent,
      },
      {
        key: "retry-old",
        attempts: MAX_ATTEMPTS - 1,
        lastAttemptAt: old,
      },
      {
        key: "completed-old",
        attempts: 1,
        processedAt: completedOld,
        lastAttemptAt: completedOld,
      },
      {
        key: "completed-recent",
        attempts: 1,
        processedAt: recent,
        lastAttemptAt: recent,
      },
    ],
  });

  const purged = await purgeCompletedStorageJobs(24, 24 * 7, {
    db: testDb,
    now,
  });

  assert.equal(purged, 2);

  const remaining = await testDb.storageDeletionJob.findMany({
    orderBy: { key: "asc" },
    select: { key: true },
  });

  assert.deepEqual(
    remaining.map((job) => job.key),
    ["completed-recent", "dead-recent", "retry-old"]
  );
});

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { after, before, test } from "node:test";

import { resetTestData, testDb } from "./helpers/db";

const SEED_PASSWORD = "test-seed-password";

function runSeed() {
  const testUrl = process.env.DATABASE_URL_TEST;
  const databaseUrl = process.env.DATABASE_URL;

  assert.ok(testUrl, "DATABASE_URL_TEST não está definida.");
  assert.ok(databaseUrl, "DATABASE_URL não está definida no processo de teste.");
  assert.match(testUrl, /test/i, "DATABASE_URL_TEST precisa apontar para um banco de teste.");
  assert.equal(
    databaseUrl,
    testUrl,
    "o seed só pode rodar quando DATABASE_URL aponta para DATABASE_URL_TEST."
  );

  const result = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
    env: {
      ...process.env,
      DATABASE_URL: testUrl,
      DATABASE_URL_TEST: testUrl,
      NODE_ENV: "test",
      SEED_DEMO_PASSWORD: SEED_PASSWORD,
    },
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  assert.equal(
    result.status,
    0,
    `seed falhou:\n${result.stdout ?? ""}\n${result.stderr ?? ""}`
  );
}

async function seedCounts() {
  const [timeline, events, documents] = await Promise.all([
    testDb.processTimeline.count(),
    testDb.event.count(),
    testDb.document.count(),
  ]);

  return { timeline, events, documents };
}

before(async () => {
  await resetTestData();
  runSeed();
});

after(async () => {
  await testDb.$disconnect();
});

test("segunda execução do seed não duplica andamentos nem eventos", async () => {
  const firstRun = await seedCounts();

  runSeed();

  const secondRun = await seedCounts();

  assert.deepEqual(secondRun, firstRun);
  assert.equal(secondRun.timeline, 2);
  assert.equal(secondRun.events, 3);
});

test("seed não mantém documento apontando para arquivo inexistente", async () => {
  assert.equal(
    await testDb.document.count({ where: { id: "seed-doc-1" } }),
    0
  );
});

import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import {
  AUDIT_RETENTION_DAYS,
  purgeExpiredAuditLogs,
} from "../../src/lib/audit";
import { createUser, resetTestData, testDb } from "./helpers/db";

const DAY_MS = 24 * 60 * 60 * 1000;

beforeEach(async () => {
  await resetTestData();
});

after(async () => {
  await testDb.$disconnect();
});

test("remove apenas registros de auditoria mais antigos que 730 dias", async () => {
  const user = await createUser();
  const now = new Date("2026-10-30T12:00:00.000Z");
  const base = {
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    ip: "203.0.113.7",
  };

  await testDb.auditLog.createMany({
    data: [
      {
        ...base,
        entityId: "expirado",
        createdAt: new Date(now.getTime() - (AUDIT_RETENTION_DAYS + 1) * DAY_MS),
      },
      {
        ...base,
        entityId: "limite",
        createdAt: new Date(now.getTime() - AUDIT_RETENTION_DAYS * DAY_MS),
      },
      {
        ...base,
        entityId: "recente",
        createdAt: new Date(now.getTime() - 30 * DAY_MS),
      },
    ],
  });

  const removed = await purgeExpiredAuditLogs(testDb, now);

  assert.equal(AUDIT_RETENTION_DAYS, 730);
  assert.equal(removed, 1);
  assert.equal(await testDb.auditLog.count(), 2);

  const remaining = await testDb.auditLog.findMany({
    select: { entityId: true },
  });

  assert.deepEqual(
    remaining.map((log) => log.entityId).sort(),
    ["limite", "recente"]
  );
});

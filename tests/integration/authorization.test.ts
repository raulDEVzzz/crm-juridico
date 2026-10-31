import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import {
  deleteEventForUser,
  getEventByIdForUser,
  updateEventStatusForUser,
} from "../../src/lib/services/events";
import {
  createClient,
  createEvent,
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

test("um usuário não consegue ler nem alterar evento de outro", async () => {
  const owner = await createUser();
  const intruder = await createUser();
  const client = await createClient(owner.id);
  const process = await createProcess(client.id);
  const event = await createEvent({
    userId: owner.id,
    processId: process.id,
    title: "Evento privado",
  });

  assert.equal(
    await getEventByIdForUser(testDb, intruder.id, event.id),
    null
  );
  assert.equal(
    await updateEventStatusForUser(testDb, intruder.id, event.id, "CONCLUIDO"),
    false
  );
  assert.equal(
    await deleteEventForUser(testDb, intruder.id, event.id, { ip: TEST_IP }),
    false
  );

  const untouched = await testDb.event.findUnique({ where: { id: event.id } });
  assert.ok(untouched);
  assert.equal(untouched.status, "PENDENTE");
});

test("dono consegue alterar status e excluir o próprio evento", async () => {
  const owner = await createUser();
  const event = await createEvent({ userId: owner.id, processId: null });

  assert.ok(await getEventByIdForUser(testDb, owner.id, event.id));
  assert.equal(
    await updateEventStatusForUser(testDb, owner.id, event.id, "CONCLUIDO"),
    true
  );
  assert.equal(
    (await testDb.event.findUnique({ where: { id: event.id } }))?.status,
    "CONCLUIDO"
  );
  assert.equal(
    await deleteEventForUser(testDb, owner.id, event.id, { ip: TEST_IP }),
    true
  );
  assert.equal(await testDb.event.findUnique({ where: { id: event.id } }), null);
});

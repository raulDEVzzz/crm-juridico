import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import { findDuplicateProcessNumberForUser } from "../../src/lib/services/processes";
import {
  createClient,
  createProcess,
  createUser,
  resetTestData,
  testDb,
} from "./helpers/db";

const CNJ = "0001234-71.2024.8.26.0100";

beforeEach(async () => {
  await resetTestData();
});

after(async () => {
  await testDb.$disconnect();
});

test("encontra o mesmo CNJ em outro cliente do mesmo usuário", async () => {
  const owner = await createUser();
  const firstClient = await createClient(owner.id, { name: "Cliente A" });
  await createClient(owner.id, { name: "Cliente B" });
  await createProcess(firstClient.id, { processNumber: CNJ });

  const duplicate = await findDuplicateProcessNumberForUser(
    testDb,
    owner.id,
    CNJ
  );

  assert.ok(duplicate);
  assert.equal(duplicate.clientId, firstClient.id);
  assert.equal(duplicate.clientName, "Cliente A");
});

test("não considera processo de outro usuário", async () => {
  const owner = await createUser();
  const otherUser = await createUser();
  const otherClient = await createClient(otherUser.id, { name: "Outro" });
  await createProcess(otherClient.id, { processNumber: CNJ });

  const duplicate = await findDuplicateProcessNumberForUser(
    testDb,
    owner.id,
    CNJ
  );

  assert.equal(duplicate, null);
});

test("ignora o próprio processo na edição", async () => {
  const owner = await createUser();
  const client = await createClient(owner.id);
  const process = await createProcess(client.id, { processNumber: CNJ });

  assert.ok(
    await findDuplicateProcessNumberForUser(testDb, owner.id, CNJ)
  );
  assert.equal(
    await findDuplicateProcessNumberForUser(testDb, owner.id, CNJ, {
      excludeProcessId: process.id,
    }),
    null
  );
});

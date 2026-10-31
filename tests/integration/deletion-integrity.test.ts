import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, beforeEach, test } from "node:test";

import {
  deleteClientForUser,
  getClientByIdForUser,
} from "../../src/lib/services/clients";
import {
  createDocumentForUser,
  deleteDocumentForUser,
  getDocumentForUser,
} from "../../src/lib/services/documents";
import {
  deleteProcessForUser,
  getProcessByIdForUser,
  updateProcessForUser,
} from "../../src/lib/services/processes";
import {
  createClient,
  createDocument,
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

test("falha no enqueue faz rollback da exclusão do processo", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const document = await createDocument({
    userId: user.id,
    clientId: client.id,
    processId: process.id,
  });

  await assert.rejects(
    deleteProcessForUser(testDb, user.id, process.id, {
      ip: TEST_IP,
      enqueue: async () => {
        throw new Error("enqueue indisponível");
      },
    }),
    /enqueue indisponível/
  );

  assert.ok(await testDb.process.findUnique({ where: { id: process.id } }));
  assert.ok(await testDb.document.findUnique({ where: { id: document.id } }));
  assert.equal(
    await testDb.storageDeletionJob.count({
      where: { key: document.fileUrl },
    }),
    0
  );
  assert.equal(
    await testDb.auditLog.count({ where: { entityId: process.id } }),
    0,
    "auditoria deve ser revertida junto com a exclusão"
  );
});

test("exclusão bem-sucedida persiste o job de storage na mesma transação", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const document = await createDocument({
    userId: user.id,
    clientId: client.id,
    processId: process.id,
  });

  const result = await deleteProcessForUser(testDb, user.id, process.id, { ip: TEST_IP });

  assert.equal(result.status, "deleted");
  assert.equal(await testDb.process.findUnique({ where: { id: process.id } }), null);
  assert.equal(
    await testDb.document.findUnique({ where: { id: document.id } }),
    null
  );

  const job = await testDb.storageDeletionJob.findUnique({
    where: { key: document.fileUrl },
  });
  assert.ok(job);
  assert.equal(job.processedAt, null);
});

test("mover processo A para B mantém documento ao excluir A e remove ao excluir B", async () => {
  const user = await createUser();
  const clientA = await createClient(user.id, { name: "Cliente A" });
  const clientB = await createClient(user.id, { name: "Cliente B" });
  const process = await createProcess(clientA.id);
  const document = await createDocument({
    userId: user.id,
    clientId: clientA.id,
    processId: process.id,
  });

  const moved = await updateProcessForUser(testDb, user.id, process.id, {
    clientId: clientB.id,
    processNumber: process.processNumber,
    court: process.court,
    area: process.area,
    status: process.status,
    value: null,
    notes: null,
  });

  assert.equal(moved.status, "updated");
  assert.equal(
    (await testDb.document.findUnique({ where: { id: document.id } }))?.clientId,
    clientB.id
  );

  const deleteA = await deleteClientForUser(testDb, user.id, clientA.id, { ip: TEST_IP });
  assert.equal(deleteA.status, "deleted");
  assert.ok(
    await testDb.document.findUnique({ where: { id: document.id } }),
    "documento não pode ser apagado ao excluir o cliente antigo"
  );

  const deleteB = await deleteClientForUser(testDb, user.id, clientB.id, { ip: TEST_IP });
  assert.equal(deleteB.status, "deleted");
  assert.equal(
    await testDb.document.findUnique({ where: { id: document.id } }),
    null
  );
});

test("PRAZO pendente bloqueia processo; concluído permite exclusão em cascata", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const pendingDeadline = await createEvent({
    userId: user.id,
    processId: process.id,
    type: "PRAZO",
    status: "PENDENTE",
    title: "Prazo fatal",
  });
  const otherProcessEvent = await createEvent({
    userId: user.id,
    processId: process.id,
    type: "AUDIENCIA",
    status: "PENDENTE",
    title: "Audiência",
  });
  const standaloneEvent = await createEvent({
    userId: user.id,
    processId: null,
    type: "PRAZO",
    status: "PENDENTE",
    title: "Prazo avulso",
  });

  const blocked = await deleteProcessForUser(testDb, user.id, process.id, { ip: TEST_IP });
  assert.deepEqual(blocked, { status: "blocked", pendingDeadlines: 1 });
  assert.ok(await testDb.process.findUnique({ where: { id: process.id } }));
  assert.ok(
    await testDb.event.findUnique({ where: { id: pendingDeadline.id } })
  );

  await testDb.event.update({
    where: { id: pendingDeadline.id },
    data: { status: "CONCLUIDO" },
  });

  const deleted = await deleteProcessForUser(testDb, user.id, process.id, { ip: TEST_IP });
  assert.equal(deleted.status, "deleted");
  assert.equal(await testDb.process.findUnique({ where: { id: process.id } }), null);
  assert.equal(
    await testDb.event.findUnique({ where: { id: pendingDeadline.id } }),
    null
  );
  assert.equal(
    await testDb.event.findUnique({ where: { id: otherProcessEvent.id } }),
    null
  );
  assert.ok(
    await testDb.event.findUnique({ where: { id: standaloneEvent.id } }),
    "evento avulso deve continuar existindo"
  );
});

test("PRAZO pendente bloqueia cliente e conta prazos dos processos vinculados", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const pendingDeadline = await createEvent({
    userId: user.id,
    processId: process.id,
    type: "PRAZO",
    status: "PENDENTE",
    title: "Prazo do cliente",
  });
  const standaloneEvent = await createEvent({
    userId: user.id,
    processId: null,
    type: "PRAZO",
    status: "PENDENTE",
    title: "Prazo avulso do cliente",
  });

  const blocked = await deleteClientForUser(testDb, user.id, client.id, { ip: TEST_IP });
  assert.deepEqual(blocked, { status: "blocked", pendingDeadlines: 1 });
  assert.ok(await testDb.client.findUnique({ where: { id: client.id } }));

  await testDb.event.update({
    where: { id: pendingDeadline.id },
    data: { status: "CONCLUIDO" },
  });

  const deleted = await deleteClientForUser(testDb, user.id, client.id, { ip: TEST_IP });
  assert.equal(deleted.status, "deleted");
  assert.equal(await testDb.client.findUnique({ where: { id: client.id } }), null);
  assert.equal(await testDb.process.findUnique({ where: { id: process.id } }), null);
  assert.equal(
    await testDb.event.findUnique({ where: { id: pendingDeadline.id } }),
    null
  );
  assert.ok(
    await testDb.event.findUnique({ where: { id: standaloneEvent.id } }),
    "evento avulso deve continuar existindo"
  );
});

test("reabrir prazo durante a exclusão não permite perder o prazo pendente", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const deadline = await createEvent({
    userId: user.id,
    processId: process.id,
    type: "PRAZO",
    status: "CONCLUIDO",
    title: "Prazo reaberto",
  });

  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let updated!: () => void;
  const updateApplied = new Promise<void>((resolve) => {
    updated = resolve;
  });

  // Simula outro usuário/aba reabrindo o prazo sem commitar ainda.
  const reopening = testDb.$transaction(async (tx) => {
    await tx.event.update({
      where: { id: deadline.id },
      data: { status: "PENDENTE" },
    });
    updated();
    await gate;
  });

  await updateApplied;

  const deletion = deleteProcessForUser(testDb, user.id, process.id, { ip: TEST_IP });

  // Dá tempo para a exclusão ler a contagem antes de o prazo ser reaberto.
  await new Promise((resolve) => setTimeout(resolve, 500));

  release();
  await reopening;
  const result = await deletion;

  assert.deepEqual(result, { status: "blocked", pendingDeadlines: 1 });
  assert.equal(
    (await testDb.event.findUnique({ where: { id: deadline.id } }))?.status,
    "PENDENTE"
  );
  assert.ok(await testDb.process.findUnique({ where: { id: process.id } }));
});

test("edição de processo respeita a ordem de lock cliente -> processo", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);

  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let locked!: () => void;
  const lockAcquired = new Promise<void>((resolve) => {
    locked = resolve;
  });

  const locking = testDb.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM clients WHERE id = ${client.id} FOR UPDATE`;
    locked();
    await gate;
  });

  await lockAcquired;

  const update = updateProcessForUser(testDb, user.id, process.id, {
    clientId: client.id,
    processNumber: process.processNumber,
    court: process.court,
    area: process.area,
    status: process.status,
    value: null,
    notes: null,
  });

  const settledEarly = await Promise.race([
    update.then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 400)),
  ]);

  release();
  await locking;
  const result = await update;

  assert.equal(
    result.status,
    "updated",
    "update deve concluir depois de liberar o lock do cliente"
  );
  assert.equal(
    settledEarly,
    false,
    "update não pode alterar o processo antes do lock do cliente ser liberado"
  );
});

test("upload só cria documento se o processo ainda pertence ao usuário", async () => {
  const owner = await createUser();
  const intruder = await createUser();
  const client = await createClient(owner.id);
  const process = await createProcess(client.id);
  const fileUrl = `uploads/test/${randomUUID()}.pdf`;

  const denied = await createDocumentForUser(testDb, {
    userId: intruder.id,
    processId: process.id,
    fileName: "arquivo.pdf",
    fileUrl,
    category: null,
  });

  assert.equal(denied.status, "not_found");
  assert.equal(
    await testDb.document.count({ where: { fileUrl } }),
    0
  );

  const created = await createDocumentForUser(testDb, {
    userId: owner.id,
    processId: process.id,
    fileName: "arquivo.pdf",
    fileUrl,
    category: null,
  });

  assert.equal(created.status, "created");
  assert.equal(
    (await testDb.document.findFirst({ where: { fileUrl } }))?.clientId,
    client.id
  );
});

test("leitura e exclusão de documento respeitam o dono do processo", async () => {
  const owner = await createUser();
  const intruder = await createUser();
  const client = await createClient(owner.id);
  const process = await createProcess(client.id);
  const document = await createDocument({
    userId: owner.id,
    clientId: client.id,
    processId: process.id,
  });

  assert.equal(
    await getDocumentForUser(testDb, intruder.id, document.id),
    null
  );

  const denied = await deleteDocumentForUser(
    testDb,
    intruder.id,
    process.id,
    document.id,
    { ip: TEST_IP }
  );
  assert.equal(denied.status, "process_not_found");
  assert.ok(
    await testDb.document.findUnique({ where: { id: document.id } })
  );

  const deleted = await deleteDocumentForUser(
    testDb,
    owner.id,
    process.id,
    document.id,
    { ip: TEST_IP }
  );
  assert.equal(deleted.status, "deleted");
  assert.equal(
    await testDb.document.findUnique({ where: { id: document.id } }),
    null
  );
});

test("serviços de cliente e processo não expõem registros de outro usuário", async () => {
  const owner = await createUser();
  const intruder = await createUser();
  const client = await createClient(owner.id);
  const process = await createProcess(client.id);

  assert.equal(
    await getClientByIdForUser(testDb, intruder.id, client.id),
    null
  );
  assert.equal(
    await getProcessByIdForUser(testDb, intruder.id, process.id),
    null
  );
  assert.equal(
    (await deleteClientForUser(testDb, intruder.id, client.id, { ip: TEST_IP }))
      .status,
    "not_found"
  );
  assert.equal(
    (await deleteProcessForUser(testDb, intruder.id, process.id, { ip: TEST_IP }))
      .status,
    "not_found"
  );
  assert.ok(await testDb.client.findUnique({ where: { id: client.id } }));
  assert.ok(await testDb.process.findUnique({ where: { id: process.id } }));
});

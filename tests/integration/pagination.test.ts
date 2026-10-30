import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import {
  listClientOptionsForUser,
  listClientsForUser,
} from "../../src/lib/services/clients";
import {
  listProcessOptionsForUser,
  listProcessesForUser,
} from "../../src/lib/services/processes";
import { listEventsForUser } from "../../src/lib/services/events";
import {
  createUser,
  resetTestData,
  testDb,
} from "./helpers/db";

let userId: string;

beforeEach(async () => {
  await resetTestData();

  const user = await createUser();
  userId = user.id;

  await testDb.client.createMany({
    data: Array.from({ length: 25 }, (_, index) => ({
      userId,
      name: `Cliente ${String(index + 1).padStart(2, "0")}`,
      personType: "PF",
      document: String(10000000000 + index),
      phone: "11999999999",
    })),
  });

  const client = await testDb.client.findFirstOrThrow({
    where: { userId },
  });

  await testDb.process.createMany({
    data: Array.from({ length: 25 }, (_, index) => ({
      clientId: client.id,
      processNumber: `PROC-${String(index + 1).padStart(2, "0")}`,
      court: `Vara ${String(index + 1).padStart(2, "0")}`,
      area: "CIVEL" as const,
      status: "ATIVO" as const,
    })),
  });

  await testDb.event.createMany({
    data: Array.from({ length: 25 }, (_, index) => ({
      userId,
      title: `Evento ${String(index + 1).padStart(2, "0")}`,
      eventDate: new Date(
        Date.UTC(2026, 0, 1, 9, 0, 0) + index * 60 * 60 * 1000
      ),
      type: index % 3 === 0 ? ("PRAZO" as const) : ("AUDIENCIA" as const),
      status: index % 2 === 0 ? ("PENDENTE" as const) : ("CONCLUIDO" as const),
    })),
  });
});

after(async () => {
  await testDb.$disconnect();
});

interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

async function collectPages<T extends { id: string }>(
  fetchPage: (cursor?: string) => Promise<Page<T>>
): Promise<T[]> {
  const collected: T[] = [];
  let cursor: string | undefined;

  for (let pageNumber = 0; pageNumber < 20; pageNumber++) {
    const page = await fetchPage(cursor);

    collected.push(...page.items);
    assert.ok(
      page.items.length <= 10,
      `página ${pageNumber + 1} excedeu o take solicitado`
    );

    if (!page.nextCursor) return collected;
    cursor = page.nextCursor;
  }

  assert.fail("paginação não terminou");
}

test("clientes são paginados por cursor, em ordem estável e sem duplicar", async () => {
  const first = await listClientsForUser(testDb, userId, { take: 10 });
  assert.equal(first.items.length, 10);
  assert.deepEqual(
    first.items.map((client) => client.name),
    Array.from({ length: 10 }, (_, index) =>
      `Cliente ${String(index + 1).padStart(2, "0")}`
    )
  );
  assert.ok(first.nextCursor);

  const second = await listClientsForUser(testDb, userId, {
    take: 10,
    cursor: first.nextCursor,
  });
  assert.deepEqual(
    second.items.map((client) => client.name),
    Array.from({ length: 10 }, (_, index) =>
      `Cliente ${String(index + 11).padStart(2, "0")}`
    )
  );
  assert.ok(second.nextCursor);

  const third = await listClientsForUser(testDb, userId, {
    take: 10,
    cursor: second.nextCursor,
  });
  assert.deepEqual(
    third.items.map((client) => client.name),
    Array.from({ length: 5 }, (_, index) =>
      `Cliente ${String(index + 21).padStart(2, "0")}`
    )
  );
  assert.equal(third.nextCursor, null);

  const all = await collectPages((cursor) =>
    listClientsForUser(testDb, userId, { take: 10, cursor })
  );
  assert.equal(all.length, 25);
  assert.equal(new Set(all.map((client) => client.id)).size, 25);
});

test("busca de clientes acontece no banco, além da página carregada", async () => {

  await testDb.client.create({
    data: {
      userId,
      name: "Alvo da busca",
      personType: "PF",
      document: "99999999999",
      phone: "11888888888",
    },
  });

  const result = await listClientsForUser(testDb, userId, {
    search: "Alvo da busca",
    take: 10,
  });

  assert.deepEqual(
    result.items.map((client) => client.name),
    ["Alvo da busca"]
  );

  const byDocument = await listClientsForUser(testDb, userId, {
    search: "10000000023",
    take: 10,
  });
  assert.deepEqual(
    byDocument.items.map((client) => client.name),
    ["Cliente 24"]
  );
});

test("opções de cliente são leves e trazem apenas id e nome", async () => {

  const options = await listClientOptionsForUser(testDb, userId);

  assert.equal(options.length, 25);
  assert.deepEqual(Object.keys(options[0]).sort(), ["id", "name"]);
});

test("processos são paginados e a busca por CNJ/cliente/vara é server-side", async () => {

  const all = await collectPages((cursor) =>
    listProcessesForUser(testDb, userId, { take: 10, cursor })
  );
  assert.equal(all.length, 25);
  assert.equal(new Set(all.map((process) => process.id)).size, 25);

  const byNumber = await listProcessesForUser(testDb, userId, {
    search: "PROC-24",
    take: 10,
  });
  assert.deepEqual(
    byNumber.items.map((process) => process.processNumber),
    ["PROC-24"]
  );

  const byCourt = await listProcessesForUser(testDb, userId, {
    search: "Vara 23",
    take: 10,
  });
  assert.deepEqual(
    byCourt.items.map((process) => process.processNumber),
    ["PROC-23"]
  );
});

test("opções de processo são leves e trazem apenas o necessário para o select", async () => {

  const options = await listProcessOptionsForUser(testDb, userId);

  assert.equal(options.length, 25);
  assert.deepEqual(Object.keys(options[0]).sort(), [
    "client",
    "id",
    "processNumber",
  ]);
  assert.deepEqual(Object.keys(options[0].client), ["name"]);
});

test("eventos são paginados por data e aceitam filtro de status", async () => {

  const all = await collectPages((cursor) =>
    listEventsForUser(testDb, userId, { take: 10, cursor })
  );
  assert.equal(all.length, 25);

  const dates = all.map((event) => event.eventDate.getTime());
  assert.deepEqual(dates, [...dates].sort((a, b) => a - b));

  const pending = await collectPages((cursor) =>
    listEventsForUser(testDb, userId, {
      take: 10,
      cursor,
      status: "PENDENTE",
    })
  );
  assert.equal(pending.length, 13);
  assert.ok(pending.every((event) => event.status === "PENDENTE"));
});

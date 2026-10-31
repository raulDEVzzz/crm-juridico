import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import type { EventStatus } from "@prisma/client";

import {
  getAgendaSectionsForUser,
  listAgendaSectionForUser,
  type AgendaSection,
} from "../../src/lib/services/events";
import {
  createUser,
  resetTestData,
  testDb,
} from "./helpers/db";

const NOW = new Date("2026-06-15T15:00:00.000Z");
const HOUR = 60 * 60 * 1000;

interface AgendaEventFixture {
  id: string;
  userId: string;
  title: string;
  eventDate: Date;
  type: "AUDIENCIA";
  status: EventStatus;
}

let userId: string;
let fixtures: AgendaEventFixture[];

function createFixtures(
  ownerId: string,
  section: AgendaSection,
  status: EventStatus,
  offsetInHours: (index: number) => number
): AgendaEventFixture[] {
  const prefix = section[0];

  return Array.from({ length: 25 }, (_, index) => ({
    id: `${prefix}${String(index + 1).padStart(2, "0")}`,
    userId: ownerId,
    title: `${section} ${String(index + 1).padStart(2, "0")}`,
    eventDate: new Date(NOW.getTime() + offsetInHours(index) * HOUR),
    type: "AUDIENCIA" as const,
    status,
  }));
}

beforeEach(async () => {
  await resetTestData();

  const user = await createUser();
  userId = user.id;

  const otherUser = await createUser({ name: "Outro usuário" });

  fixtures = [
    ...createFixtures(userId, "atrasados", "PENDENTE", (index) => -(index % 5) - 1),
    // O primeiro evento fica exatamente em NOW para fixar a fronteira >=.
    ...createFixtures(userId, "proximos", "PENDENTE", (index) =>
      index === 0 ? 0 : (index % 5) + 1
    ),
    // Inclui concluídos no passado, no instante atual e no futuro.
    ...createFixtures(userId, "concluidos", "CONCLUIDO", (index) => (index % 5) - 2),
  ];

  await testDb.event.createMany({
    data: [
      ...fixtures,
      {
        id: "outro-atrasado",
        userId: otherUser.id,
        title: "Evento de outro usuário",
        eventDate: new Date(NOW.getTime() - HOUR),
        type: "AUDIENCIA" as const,
        status: "PENDENTE" as const,
      },
    ],
  });
});

after(async () => {
  await testDb.$disconnect();
});

function expectedIds(section: AgendaSection): string[] {
  const sectionStatus: EventStatus =
    section === "concluidos" ? "CONCLUIDO" : "PENDENTE";

  return fixtures
    .filter((event) => {
      if (event.status !== sectionStatus) return false;
      if (section === "atrasados") return event.eventDate < NOW;
      if (section === "proximos") return event.eventDate >= NOW;
      return true;
    })
    .sort((left, right) => {
      const dateDiff =
        section === "proximos"
          ? left.eventDate.getTime() - right.eventDate.getTime()
          : right.eventDate.getTime() - left.eventDate.getTime();

      if (dateDiff !== 0) return dateDiff;

      const idDiff = left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
      return section === "proximos" ? idDiff : -idDiff;
    })
    .map((event) => event.id);
}

async function collectSectionPages(
  section: AgendaSection,
  take: number
): Promise<string[]> {
  const ids: string[] = [];
  let cursor: string | undefined;
  let pageCount = 0;

  while (pageCount < 10) {
    const page = await listAgendaSectionForUser(testDb, userId, section, {
      take,
      cursor,
      now: NOW,
    });

    ids.push(...page.items.map((event) => event.id));
    pageCount += 1;

    if (!page.nextCursor) return ids;
    cursor = page.nextCursor;
  }

  assert.fail(`paginação de ${section} não terminou`);
}

test("cada seção carrega sua primeira página com 20 itens, mesmo com muitos atrasados", async () => {
  const [atrasados, proximos, concluidos] = await Promise.all([
    listAgendaSectionForUser(testDb, userId, "atrasados", { now: NOW }),
    listAgendaSectionForUser(testDb, userId, "proximos", { now: NOW }),
    listAgendaSectionForUser(testDb, userId, "concluidos", { now: NOW }),
  ]);

  assert.equal(atrasados.items.length, 20);
  assert.equal(proximos.items.length, 20);
  assert.equal(concluidos.items.length, 20);

  assert.ok(
    atrasados.items.every(
      (event) => event.status === "PENDENTE" && event.eventDate < NOW
    )
  );
  assert.ok(
    proximos.items.every(
      (event) => event.status === "PENDENTE" && event.eventDate >= NOW
    )
  );
  assert.ok(concluidos.items.every((event) => event.status === "CONCLUIDO"));
  assert.ok(concluidos.items.some((event) => event.eventDate >= NOW));
  assert.ok(proximos.items.length > 0);
  assert.ok(proximos.items.every((event) => !event.id.startsWith("outro-")));
  assert.equal(proximos.items[0]?.id, "p01");
  assert.ok(proximos.items.some((event) => event.id === "p01"));
  assert.ok(!atrasados.items.some((event) => event.id === "p01"));

  assert.deepEqual(
    atrasados.items.map((event) => event.id),
    expectedIds("atrasados").slice(0, 20)
  );
  assert.deepEqual(
    proximos.items.map((event) => event.id),
    expectedIds("proximos").slice(0, 20)
  );
  assert.deepEqual(
    concluidos.items.map((event) => event.id),
    expectedIds("concluidos").slice(0, 20)
  );
});

test("as três seções percorrem 25 itens em ordem, sem repetir nem pular", async () => {
  const sections: AgendaSection[] = ["atrasados", "proximos", "concluidos"];

  for (const section of sections) {
    // 5 eventos compartilham cada data; take 7 corta um grupo de datas iguais.
    const ids = await collectSectionPages(section, 7);

    assert.equal(ids.length, 25, `${section} não retornou todos os eventos`);
    assert.equal(new Set(ids).size, 25, `${section} repetiu eventos`);
    assert.deepEqual(ids, expectedIds(section), `${section} saiu da ordem`);
  }
});

test("cursores distintos avançam apenas a seção correspondente", async () => {
  const first = await getAgendaSectionsForUser(testDb, userId, {}, NOW);

  assert.equal(first.atrasados.items.length, 20);
  assert.equal(first.proximos.items.length, 20);
  assert.equal(first.concluidos.items.length, 20);
  assert.ok(first.atrasados.nextCursor);
  assert.ok(first.proximos.nextCursor);

  const second = await getAgendaSectionsForUser(
    testDb,
    userId,
    {
      atrasados: first.atrasados.nextCursor,
      proximos: first.proximos.nextCursor,
    },
    NOW
  );

  assert.deepEqual(
    second.atrasados.items.map((event) => event.id),
    expectedIds("atrasados").slice(20)
  );
  assert.deepEqual(
    second.proximos.items.map((event) => event.id),
    expectedIds("proximos").slice(20)
  );
  assert.deepEqual(
    second.concluidos.items.map((event) => event.id),
    expectedIds("concluidos").slice(0, 20)
  );
});

import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import { PrismaClient } from "@prisma/client";

import {
  getDashboardOverviewForUser,
  URGENT_DEADLINE_LIMIT,
} from "../../src/lib/services/dashboard";
import {
  buildPerformanceSeedData,
  PERFORMANCE_TOTAL_CLIENTS,
  PERFORMANCE_TOTAL_EVENTS,
} from "../../scripts/seed-performance";
import {
  createUser,
  resetTestData,
  testDb,
} from "./helpers/db";

const NOW = new Date("2026-10-30T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;

beforeEach(async () => {
  await resetTestData();
});

after(async () => {
  await testDb.$disconnect();
});

test("dashboard usa contadores e limites, sem carregar clientes e eventos inteiros", async () => {
  const user = await createUser();
  const { clients, events } = buildPerformanceSeedData(user.id, NOW);

  await testDb.client.createMany({ data: clients });
  await testDb.event.createMany({ data: events });

  await testDb.event.createMany({
    data: [
      {
        id: "old-deadline",
        userId: user.id,
        title: "Prazo com mais de 90 dias",
        eventDate: new Date(NOW.getTime() - 100 * 24 * HOUR),
        type: "PRAZO",
        status: "PENDENTE",
      },
      {
        id: "recent-deadline",
        userId: user.id,
        title: "Prazo dentro dos 90 dias",
        eventDate: new Date(NOW.getTime() - 89 * 24 * HOUR),
        type: "PRAZO",
        status: "PENDENTE",
      },
    ],
  });

  const databaseUrl = process.env.DATABASE_URL_TEST;
  assert.ok(databaseUrl, "DATABASE_URL_TEST precisa estar definida");

  const loggedDb = new PrismaClient({
    datasourceUrl: databaseUrl,
    log: [{ emit: "event", level: "query" }],
  });
  const queries: string[] = [];
  loggedDb.$on("query", (event) => {
    queries.push(event.query);
  });

  try {
    const overview = await getDashboardOverviewForUser(loggedDb, user.id, {
      now: NOW,
    });

    assert.equal(overview.totalClients, PERFORMANCE_TOTAL_CLIENTS);
    assert.equal(overview.pendingEvents, PERFORMANCE_TOTAL_EVENTS / 4);

    assert.equal(overview.upcomingEvents.length, 3);
    assert.ok(
      overview.upcomingEvents.every(
        (event) => event.status === "PENDENTE" && event.eventDate >= NOW
      )
    );

    assert.equal(overview.birthdayClients.length, 5);

    assert.equal(overview.urgentDeadlines.length, URGENT_DEADLINE_LIMIT);
    assert.ok(
      overview.urgentDeadlines.every(
        (event) =>
          event.type === "PRAZO" &&
          event.status === "PENDENTE" &&
          event.eventDate >=
            new Date(NOW.getTime() - 90 * 24 * HOUR)
      )
    );
    assert.equal(
      overview.urgentDeadlines.some((event) => event.id === "old-deadline"),
      false,
      "prazos com mais de 90 dias devem ficar fora"
    );
    assert.equal(
      overview.urgentDeadlines.some((event) => event.id === "recent-deadline"),
      true,
      "prazos dentro dos 90 dias devem aparecer"
    );

    assert.ok(
      queries.some(
        (query) =>
          /COUNT\(\*\)/i.test(query) && /FROM "public"\."clients"/i.test(query)
      ),
      "o total de clientes deve vir de COUNT(*)"
    );

    const eventSelects = queries.filter(
      (query) =>
        /FROM "public"\."events"/i.test(query) &&
        !/COUNT\(\*\)/i.test(query)
    );
    assert.ok(eventSelects.length > 0, "deve haver consulta de eventos");
    for (const query of eventSelects) {
      assert.match(
        query,
        /LIMIT \$\d+/i,
        `consulta de eventos sem LIMIT: ${query}`
      );
    }

    const clientSelects = queries.filter(
      (query) =>
        /FROM "public"\."clients"/i.test(query) &&
        !/COUNT\(\*\)/i.test(query)
    );
    for (const query of clientSelects) {
      assert.match(
        query,
        /birth_date/i,
        `consulta de clientes sem filtro de aniversário: ${query}`
      );
      assert.match(query, /birthday_clients/i);
    }
  } finally {
    await loggedDb.$disconnect();
  }
});

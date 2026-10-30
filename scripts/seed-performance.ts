import { randomUUID } from "node:crypto";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

export const PERFORMANCE_TOTAL_CLIENTS = 500;
export const PERFORMANCE_TOTAL_EVENTS = 2000;

const HOUR = 60 * 60 * 1000;

/**
 * Gera os dados do teste de performance do dashboard:
 * 500 clientes e 2000 eventos, sendo metade no passado e metade no futuro.
 */
export function buildPerformanceSeedData(userId: string, now: Date) {
  const clients = Array.from(
    { length: PERFORMANCE_TOTAL_CLIENTS },
    (_, index) => ({
      userId,
      name: `Cliente ${String(index + 1).padStart(3, "0")}`,
      personType: "PF" as const,
      document: String(20000000000 + index),
      phone: "11999999999",
      birthDate:
        index < 5 ? new Date(Date.UTC(1990, 9, 31 + index)) : null,
    })
  );

  const events = Array.from(
    { length: PERFORMANCE_TOTAL_EVENTS },
    (_, index) => {
      const isPast = index < PERFORMANCE_TOTAL_EVENTS / 2;
      const distance = isPast
        ? index + 1
        : index - PERFORMANCE_TOTAL_EVENTS / 2 + 1;

      return {
        userId,
        title: `Evento ${index}`,
        eventDate: new Date(
          now.getTime() + (isPast ? -distance : distance) * 3 * HOUR
        ),
        type:
          index % 3 === 0
            ? ("PRAZO" as const)
            : index % 3 === 1
              ? ("AUDIENCIA" as const)
              : ("REUNIAO" as const),
        status:
          index % 2 === 0 ? ("PENDENTE" as const) : ("CONCLUIDO" as const),
      };
    }
  );

  return { clients, events };
}

async function main() {
  try {
    loadEnvFile(path.resolve(process.cwd(), ".env"));
  } catch {
    // Allows CI to provide the variables directly through the environment.
  }

  const testUrl = process.env.DATABASE_URL_TEST;

  if (!testUrl) {
    throw new Error("DATABASE_URL_TEST não está definida.");
  }

  if (!testUrl.toLowerCase().includes("test")) {
    throw new Error(
      "DATABASE_URL_TEST precisa conter 'test' no nome/host do banco."
    );
  }

  if (process.env.DATABASE_URL && testUrl === process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL_TEST é igual a DATABASE_URL. Seed recusado para não tocar no banco de desenvolvimento."
    );
  }

  const db = new PrismaClient({ datasourceUrl: testUrl });

  try {
    const previous = await db.user.findUnique({
      where: { username: "performance-seed" },
    });

    if (previous) {
      await db.user.delete({ where: { id: previous.id } });
    }

    const suffix = randomUUID().slice(0, 8);
    const user = await db.user.create({
      data: {
        name: "Usuário de performance",
        username: "performance-seed",
        email: `performance-${suffix}@example.com`,
        passwordHash: "seed-only",
      },
    });

    const { clients, events } = buildPerformanceSeedData(user.id, new Date());

    await db.client.createMany({ data: clients });
    await db.event.createMany({ data: events });

    console.log(
      `[seed-performance] ${clients.length} clientes e ${events.length} eventos criados para ${user.id}.`
    );
  } finally {
    await db.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  main().catch((error) => {
    console.error(
      `[seed-performance] ${error instanceof Error ? error.message : error}`
    );
    process.exit(1);
  });
}

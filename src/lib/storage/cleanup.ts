import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import type { StorageAdapter } from "@/lib/storage/types";

type StorageDeletionDb = PrismaClient | Prisma.TransactionClient;

/** Limite único de tentativas antes do dead-letter. */
export const MAX_ATTEMPTS = 10;
/** Primeira falha que gera alerta operacional, sem virar dead-letter. */
export const DEAD_LETTER_ALERT_ATTEMPTS = 5;

/**
 * Registra jobs de exclusão no outbox. Deve ser chamado com o cliente da
 * mesma transação que apagou os registros no banco. O upsert reabre jobs já
 * processados, garantindo que uma nova exclusão do mesmo key não seja ignorada.
 */
export async function enqueueStorageDeletion(
  db: StorageDeletionDb,
  keys: string[]
) {
  const uniqueKeys = [...new Set(keys)];

  if (!uniqueKeys.length) return;

  await Promise.all(
    uniqueKeys.map((key) =>
      db.storageDeletionJob.upsert({
        where: { key },
        create: { key },
        update: { processedAt: null, attempts: 0, lastError: null },
      })
    )
  );
}

export interface DrainStorageOptions {
  maxAttempts?: number;
  /** Injetável nos testes para nunca tocar no storage real. */
  storage?: StorageAdapter;
  /** Injetável nos testes para apontar para o banco de teste. */
  db?: PrismaClient;
}

/** Retries are durable: failures remain queued for a later request or worker. */
export async function drainStorageDeletionJobs(
  limit = 25,
  options: DrainStorageOptions = {}
): Promise<{
  processed: number;
  failed: number;
  deadLetterCount: number;
}> {
  const maxAttempts = options.maxAttempts ?? MAX_ATTEMPTS;
  const db = options.db ?? prisma;

  const jobs = await db.storageDeletionJob.findMany({
    where: {
      processedAt: null,
      attempts: { lt: maxAttempts },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const countDeadLetter = () =>
    db.storageDeletionJob.count({
      where: { processedAt: null, attempts: { gte: maxAttempts } },
    });

  if (!jobs.length) {
    return {
      processed: 0,
      failed: 0,
      deadLetterCount: await countDeadLetter(),
    };
  }

  const storage = options.storage ?? getStorage();
  let processed = 0;
  let failed = 0;

  await Promise.all(
    jobs.map(async (job) => {
      try {
        await storage.delete(job.key);
        await db.storageDeletionJob.update({
          where: { id: job.id },
          data: {
            processedAt: new Date(),
            lastError: null,
            lastAttemptAt: new Date(),
          },
        });
        processed++;
      } catch (error) {
        failed++;
        const nextAttempts = job.attempts + 1;
        const errorMessage = String(error).slice(0, 1000);
        const attemptedAt = new Date();

        if (nextAttempts === DEAD_LETTER_ALERT_ATTEMPTS) {
          console.error(
            `[STORAGE_CLEANUP_ALERT] Job ${job.id} atingiu ${DEAD_LETTER_ALERT_ATTEMPTS} falhas consecutivas; continuará tentando até ${maxAttempts}. Arquivo: '${job.key}'. Erro: ${errorMessage}`
          );
        } else if (nextAttempts >= maxAttempts) {
          console.error(
            `[STORAGE_CLEANUP_EXHAUSTED] Job ${job.id} esgotou o limite de ${maxAttempts} tentativas e entrou em dead-letter. Arquivo: '${job.key}'. Erro: ${errorMessage}`
          );
        }

        await db.storageDeletionJob.update({
          where: { id: job.id },
          data: {
            attempts: { increment: 1 },
            lastError: errorMessage,
            lastAttemptAt: attemptedAt,
          },
        });
      }
    })
  );

  return {
    processed,
    failed,
    deadLetterCount: await countDeadLetter(),
  };
}

export interface PurgeStorageOptions {
  db?: PrismaClient;
  /** Injetável nos testes para controlar a janela de retenção. */
  now?: Date;
}

/**
 * Purga jobs concluídos com sucesso (padrão 24h) e jobs em dead-letter
 * esgotados (padrão 7 dias), sempre respeitando a retenção.
 */
export async function purgeCompletedStorageJobs(
  retentionHours = 24,
  deadLetterRetentionHours = 24 * 7,
  options: PurgeStorageOptions = {}
): Promise<number> {
  const db = options.db ?? prisma;
  const now = options.now ?? new Date();
  const completedCutoff = new Date(
    now.getTime() - retentionHours * 60 * 60 * 1000
  );
  const deadLetterCutoff = new Date(
    now.getTime() - deadLetterRetentionHours * 60 * 60 * 1000
  );

  try {
    const result = await db.storageDeletionJob.deleteMany({
      where: {
        OR: [
          {
            processedAt: {
              not: null,
              lt: completedCutoff,
            },
          },
          {
            processedAt: null,
            attempts: { gte: MAX_ATTEMPTS },
            OR: [
              { lastAttemptAt: { lt: deadLetterCutoff } },
              {
                lastAttemptAt: null,
                createdAt: { lt: deadLetterCutoff },
              },
            ],
          },
        ],
      },
    });
    return result.count;
  } catch (error) {
    console.error("Erro ao purgar jobs de exclusão:", error);
    return 0;
  }
}

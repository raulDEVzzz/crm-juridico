import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

export async function enqueueStorageDeletion(keys: string[]) {
  if (!keys.length) return;
  await prisma.storageDeletionJob.createMany({
    data: keys.map((key) => ({ key })),
    skipDuplicates: true,
  });
}

export interface DrainStorageOptions {
  maxAttempts?: number;
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
  const maxAttempts = options.maxAttempts ?? 5;

  const jobs = await prisma.storageDeletionJob.findMany({
    where: {
      processedAt: null,
      attempts: { lt: maxAttempts },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  if (!jobs.length) return { processed: 0, failed: 0, deadLetterCount: 0 };

  const storage = getStorage();
  let processed = 0;
  let failed = 0;

  await Promise.all(
    jobs.map(async (job) => {
      try {
        await storage.delete(job.key);
        await prisma.storageDeletionJob.update({
          where: { id: job.id },
          data: { processedAt: new Date(), lastError: null },
        });
        processed++;
      } catch (error) {
        failed++;
        const nextAttempts = job.attempts + 1;
        const errorMessage = String(error).slice(0, 1000);

        if (nextAttempts === 5) {
          console.error(
            `[STORAGE_CLEANUP_ALERT] Job ${job.id} atingiu 5 falhas consecutivas e entrou em dead-letter. Será retentado pela rotina agendada diária. Arquivo: '${job.key}'. Erro: ${errorMessage}`
          );
        } else if (nextAttempts >= 10) {
          console.error(
            `[STORAGE_CLEANUP_EXHAUSTED] Job ${job.id} esgotou o limite total de ${nextAttempts} tentativas e foi abandonado. Arquivo: '${job.key}'. Erro: ${errorMessage}`
          );
        }

        await prisma.storageDeletionJob.update({
          where: { id: job.id },
          data: {
            attempts: { increment: 1 },
            lastError: errorMessage,
          },
        });
      }
    })
  );

  const deadLetterCount = await prisma.storageDeletionJob.count({
    where: { processedAt: null, attempts: { gte: 5 } },
  });

  return { processed, failed, deadLetterCount };
}

/**
 * Purga jobs já concluídos com sucesso (padrão 24h) e jobs em dead-letter
 * esgotados (padrão 7 dias) para evitar crescimento indefinido da tabela.
 */
export async function purgeCompletedStorageJobs(
  retentionHours = 24,
  deadLetterRetentionHours = 24 * 7
): Promise<number> {
  const completedCutoff = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
  const deadLetterCutoff = new Date(
    Date.now() - deadLetterRetentionHours * 60 * 60 * 1000
  );

  try {
    const result = await prisma.storageDeletionJob.deleteMany({
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
            attempts: { gte: 10 },
            createdAt: { lt: deadLetterCutoff },
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

/**
 * Re-enfileira jobs em dead-letter resetando o contador de tentativas.
 */
export async function requeueDeadLetterJobs(minAttempts = 5): Promise<number> {
  try {
    const result = await prisma.storageDeletionJob.updateMany({
      where: {
        processedAt: null,
        attempts: { gte: minAttempts },
      },
      data: {
        attempts: 0,
      },
    });
    return result.count;
  } catch (error) {
    console.error("Erro ao reenfileirar jobs de storage em dead-letter:", error);
    return 0;
  }
}

/**
 * Purga explicitamente jobs em dead-letter mais antigos que a retenção (padrão 7 dias).
 */
export async function purgeDeadLetterJobs(retentionDays = 7): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  try {
    const result = await prisma.storageDeletionJob.deleteMany({
      where: {
        processedAt: null,
        attempts: { gte: 5 },
        createdAt: { lt: cutoff },
      },
    });
    return result.count;
  } catch (error) {
    console.error("Erro ao purgar jobs de exclusão em dead-letter:", error);
    return 0;
  }
}

import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

export async function enqueueStorageDeletion(keys: string[]) {
  if (!keys.length) return;
  await prisma.storageDeletionJob.createMany({
    data: keys.map((key) => ({ key })),
    skipDuplicates: true,
  });
}

/** Retries are durable: failures remain queued for a later request or worker. */
export async function drainStorageDeletionJobs(limit = 25): Promise<{
  processed: number;
  failed: number;
  deadLetterCount: number;
}> {
  const jobs = await prisma.storageDeletionJob.findMany({
    where: {
      processedAt: null,
      attempts: { lt: 5 },
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
            `[STORAGE_CLEANUP_ALERT] Job ${job.id} atingiu cinco falhas e continuará sendo tentado pela rotina agendada. Arquivo: '${job.key}'. Erro: ${errorMessage}`
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
 * Purga jobs já concluídos com sucesso após uma janela de retenção (padrão 24h)
 * para evitar crescimento indefinido da tabela.
 */
export async function purgeCompletedStorageJobs(retentionHours = 24): Promise<number> {
  const cutoff = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
  try {
    const result = await prisma.storageDeletionJob.deleteMany({
      where: {
        processedAt: {
          not: null,
          lt: cutoff,
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error("Erro ao purgar jobs de exclusão concluídos:", error);
    return 0;
  }
}


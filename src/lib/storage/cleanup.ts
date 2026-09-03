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
export async function drainStorageDeletionJobs(limit = 25) {
  const jobs = await prisma.storageDeletionJob.findMany({
    where: {
      processedAt: null,
      attempts: { lt: 5 },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  const storage = getStorage();

  await Promise.all(jobs.map(async (job) => {
    try {
      await storage.delete(job.key);
      await prisma.storageDeletionJob.update({
        where: { id: job.id }, data: { processedAt: new Date(), lastError: null },
      });
    } catch (error) {
      await prisma.storageDeletionJob.update({
        where: { id: job.id }, data: { attempts: { increment: 1 }, lastError: String(error).slice(0, 1000) },
      });
    }
  }));
}

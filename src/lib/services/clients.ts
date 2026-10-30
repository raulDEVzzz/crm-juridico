import type { PrismaClient } from "@prisma/client";

import { enqueueStorageDeletion } from "@/lib/storage/cleanup";
import { countPendingDeadlinesForClient } from "@/lib/services/deadlines";

type EnqueueStorageDeletion = typeof enqueueStorageDeletion;

export type DeleteClientResult =
  | { status: "deleted"; storageKeys: string[] }
  | { status: "not_found" }
  | { status: "blocked"; pendingDeadlines: number };

export async function getClientByIdForUser(
  db: PrismaClient,
  userId: string,
  clientId: string
) {
  return db.client.findFirst({
    where: { id: clientId, userId },
  });
}

export async function deleteClientForUser(
  db: PrismaClient,
  userId: string,
  clientId: string,
  options: { enqueue?: EnqueueStorageDeletion } = {}
): Promise<DeleteClientResult> {
  const enqueue = options.enqueue ?? enqueueStorageDeletion;

  return db.$transaction(async (tx) => {
    // Serializa com uploads (que travam o cliente em FOR SHARE) e com
    // outras exclusões do mesmo cliente.
    const locked = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM clients
      WHERE id = ${clientId} AND user_id = ${userId}
      FOR UPDATE
    `;

    if (!locked.length) {
      return { status: "not_found" };
    }

    // Serializa com a reatribuição de processos do cliente. Sem isso, um
    // processo poderia mudar de cliente entre a contagem e a exclusão.
    await tx.$queryRaw`
      SELECT id
      FROM processes
      WHERE client_id = ${clientId}
      FOR UPDATE
    `;

    // Serializa a reabertura/alteração de status dos eventos com a contagem
    // de prazos. Sem isso, um PRAZO reaberto em outra transação poderia ser
    // apagado em cascata depois de uma contagem que viu o status antigo.
    await tx.$queryRaw`
      SELECT e.id
      FROM events e
      INNER JOIN processes p ON p.id = e.process_id
      WHERE p.client_id = ${clientId}
      FOR UPDATE OF e
    `;

    const pendingDeadlines = await countPendingDeadlinesForClient(tx, clientId);

    if (pendingDeadlines > 0) {
      return { status: "blocked", pendingDeadlines };
    }

    // Documentos com processo pertencem ao cliente via processo. O clientId
    // do documento não é usado para decidir a exclusão de documentos com
    // processo, pois pode estar desatualizado.
    const documentWhere = {
      userId,
      OR: [
        { process: { clientId } },
        { processId: null, clientId },
      ],
    };

    const documents = await tx.document.findMany({
      where: documentWhere,
      select: { fileUrl: true },
    });

    await tx.document.deleteMany({ where: documentWhere });
    await tx.client.delete({ where: { id: clientId } });

    const storageKeys = documents.map((document) => document.fileUrl);
    await enqueue(tx, storageKeys);

    return { status: "deleted", storageKeys };
  });
}

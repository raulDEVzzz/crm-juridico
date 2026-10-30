import type {
  LegalArea,
  PrismaClient,
  ProcessStatus,
} from "@prisma/client";

import { enqueueStorageDeletion } from "@/lib/storage/cleanup";
import { countPendingDeadlinesForProcess } from "@/lib/services/deadlines";

type EnqueueStorageDeletion = typeof enqueueStorageDeletion;

export interface ProcessUpdateInput {
  clientId: string;
  processNumber: string;
  court: string;
  area: LegalArea;
  status: ProcessStatus;
  value: number | null;
  notes: string | null;
}

export type DeleteProcessResult =
  | { status: "deleted"; storageKeys: string[] }
  | { status: "not_found" }
  | { status: "blocked"; pendingDeadlines: number };

export type UpdateProcessResult =
  | { status: "updated" }
  | { status: "not_found" }
  | { status: "client_not_found" };

export async function getProcessByIdForUser(
  db: PrismaClient,
  userId: string,
  processId: string
) {
  return db.process.findFirst({
    where: {
      id: processId,
      client: { userId },
    },
    include: {
      client: true,
      timeline: { orderBy: { date: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
}

export async function updateProcessForUser(
  db: PrismaClient,
  userId: string,
  processId: string,
  input: ProcessUpdateInput
): Promise<UpdateProcessResult> {
  return db.$transaction(async (tx) => {
    // Mantém a mesma ordem de locks das exclusões e do upload:
    // cliente -> processo. Isso evita deadlock com a exclusão do cliente
    // quando o processo continua no mesmo cliente.
    const lockedClient = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM clients
      WHERE id = ${input.clientId} AND user_id = ${userId}
      FOR SHARE
    `;

    if (!lockedClient.length) {
      return { status: "client_not_found" };
    }

    const lockedProcess = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT p.id
      FROM processes p
      INNER JOIN clients c ON c.id = p.client_id
      WHERE p.id = ${processId} AND c.user_id = ${userId}
      FOR UPDATE OF p
    `;

    if (!lockedProcess.length) {
      return { status: "not_found" };
    }

    await tx.process.update({
      where: { id: processId },
      data: {
        clientId: input.clientId,
        processNumber: input.processNumber,
        court: input.court,
        area: input.area,
        status: input.status,
        value: input.value,
        notes: input.notes,
      },
    });

    // Mantém Document.clientId coerente com o processo na mesma transação.
    await tx.document.updateMany({
      where: { processId, userId },
      data: { clientId: input.clientId },
    });

    return { status: "updated" };
  });
}

export async function deleteProcessForUser(
  db: PrismaClient,
  userId: string,
  processId: string,
  options: { enqueue?: EnqueueStorageDeletion } = {}
): Promise<DeleteProcessResult> {
  const enqueue = options.enqueue ?? enqueueStorageDeletion;

  return db.$transaction(async (tx) => {
    // Trava o processo pai antes de contar prazos e apagar documentos.
    // Uploads usam FOR SHARE no processo, portanto são serializados aqui.
    const locked = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT p.id
      FROM processes p
      INNER JOIN clients c ON c.id = p.client_id
      WHERE p.id = ${processId} AND c.user_id = ${userId}
      FOR UPDATE OF p
    `;

    if (!locked.length) {
      return { status: "not_found" };
    }

    // Serializa a reabertura/alteração de status dos eventos com a contagem
    // de prazos. Sem isso, um PRAZO reaberto em outra transação poderia ser
    // apagado em cascata depois de uma contagem que viu o status antigo.
    await tx.$queryRaw`
      SELECT id
      FROM events
      WHERE process_id = ${processId}
      FOR UPDATE
    `;

    const pendingDeadlines = await countPendingDeadlinesForProcess(
      tx,
      processId
    );

    if (pendingDeadlines > 0) {
      return { status: "blocked", pendingDeadlines };
    }

    const documents = await tx.document.findMany({
      where: { processId, userId },
      select: { fileUrl: true },
    });

    await tx.document.deleteMany({ where: { processId, userId } });
    await tx.process.delete({ where: { id: processId } });

    const storageKeys = documents.map((document) => document.fileUrl);
    await enqueue(tx, storageKeys);

    return { status: "deleted", storageKeys };
  });
}

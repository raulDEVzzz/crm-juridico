import type { PrismaClient } from "@prisma/client";

import { AUDIT_ACTIONS, AUDIT_ENTITIES, writeAuditLog } from "@/lib/audit";
import { enqueueStorageDeletion } from "@/lib/storage/cleanup";
import { buildStorageKey } from "@/lib/storage/types";
import type { StorageAdapter } from "@/lib/storage/types";

type EnqueueStorageDeletion = typeof enqueueStorageDeletion;

export interface CreateDocumentInput {
  userId: string;
  processId: string;
  fileName: string;
  fileUrl: string;
  category: string | null;
}

export type CreateDocumentResult =
  | { status: "created"; documentId: string; clientId: string }
  | { status: "not_found" };

export type DeleteDocumentResult =
  | { status: "deleted"; storageKey: string }
  | { status: "process_not_found" }
  | { status: "document_not_found" };

export interface UploadDocumentInput {
  userId: string;
  processId: string;
  fileName: string;
  category: string | null;
  body: Buffer;
  contentType: string;
}

export type UploadDocumentResult =
  | {
      status: "created";
      documentId: string;
      clientId: string;
      storageKey: string;
    }
  | { status: "not_found"; storageKey: string };

export interface UploadDocumentOptions {
  enqueue?: EnqueueStorageDeletion;
  /** Chamado quando o arquivo não pôde ser removido após a falha do banco. */
  onCleanupFailure?: (storageKey: string) => void | Promise<void>;
}

export async function getDocumentForUser(
  db: PrismaClient,
  userId: string,
  documentId: string
) {
  return db.document.findFirst({
    where: { id: documentId, userId },
  });
}

/**
 * Cria o registro do documento somente depois de travar o cliente e o
 * processo e confirmar que o processo ainda pertence ao usuário. Isso fecha
 * a corrida entre upload e exclusão/reatribuição do processo.
 */
export async function createDocumentForUser(
  db: PrismaClient,
  input: CreateDocumentInput
): Promise<CreateDocumentResult> {
  return db.$transaction(async (tx) => {
    const candidate = await tx.process.findFirst({
      where: {
        id: input.processId,
        client: { userId: input.userId },
      },
      select: { clientId: true },
    });

    if (!candidate) {
      return { status: "not_found" };
    }

    // Ordem de lock: cliente -> processo. A exclusão de cliente usa
    // FOR UPDATE no cliente primeiro; uploads usam FOR SHARE no cliente.
    const lockedClient = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM clients
      WHERE id = ${candidate.clientId} AND user_id = ${input.userId}
      FOR SHARE
    `;

    if (!lockedClient.length) {
      return { status: "not_found" };
    }

    const lockedProcess = await tx.$queryRaw<
      Array<{ id: string; clientId: string }>
    >`
      SELECT id, client_id AS "clientId"
      FROM processes
      WHERE id = ${input.processId}
      FOR SHARE
    `;

    const process = lockedProcess[0];

    if (!process || process.clientId !== candidate.clientId) {
      return { status: "not_found" };
    }

    const document = await tx.document.create({
      data: {
        userId: input.userId,
        processId: input.processId,
        clientId: process.clientId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        category: input.category,
      },
    });

    return {
      status: "created",
      documentId: document.id,
      clientId: process.clientId,
    };
  });
}

/**
 * Faz o upload no storage e só então cria o registro, revalidando o processo
 * dentro da transação. Se o processo deixou de existir, remove o arquivo para
 * não deixar órfão.
 */
export async function uploadDocumentForUser(
  db: PrismaClient,
  storage: StorageAdapter,
  input: UploadDocumentInput,
  options: UploadDocumentOptions = {}
): Promise<UploadDocumentResult> {
  const storageKey = buildStorageKey(
    input.userId,
    input.processId,
    input.fileName
  );
  const enqueue = options.enqueue ?? enqueueStorageDeletion;

  let created: CreateDocumentResult;
  let uploaded = false;

  try {
    await storage.upload({
      key: storageKey,
      body: input.body,
      contentType: input.contentType,
      contentLength: input.body.length,
    });
    uploaded = true;

    created = await createDocumentForUser(db, {
      userId: input.userId,
      processId: input.processId,
      fileName: input.fileName,
      fileUrl: storageKey,
      category: input.category,
    });
  } catch (error) {
    if (uploaded) {
      await discardUploadedFile(
        db,
        storage,
        storageKey,
        enqueue,
        options.onCleanupFailure
      );
    }
    throw error;
  }

  if (created.status !== "created") {
    await discardUploadedFile(
      db,
      storage,
      storageKey,
      enqueue,
      options.onCleanupFailure
    );
    return { status: "not_found", storageKey };
  }

  return { ...created, storageKey };
}

async function discardUploadedFile(
  db: PrismaClient,
  storage: StorageAdapter,
  storageKey: string,
  enqueue: EnqueueStorageDeletion,
  onCleanupFailure?: (storageKey: string) => void | Promise<void>
) {
  try {
    await storage.delete(storageKey);
  } catch (error) {
    console.error(
      "Erro ao desfazer upload sem registro; enfileirando limpeza:",
      error
    );
    await enqueue(db, [storageKey]).catch(() => undefined);
    await onCleanupFailure?.(storageKey);
  }
}

export async function deleteDocumentForUser(
  db: PrismaClient,
  userId: string,
  processId: string,
  documentId: string,
  options: { enqueue?: EnqueueStorageDeletion; ip: string }
): Promise<DeleteDocumentResult> {
  const enqueue = options.enqueue ?? enqueueStorageDeletion;

  return db.$transaction(async (tx) => {
    // FOR SHARE impede que o processo seja excluído no meio da operação.
    const lockedProcess = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT p.id
      FROM processes p
      INNER JOIN clients c ON c.id = p.client_id
      WHERE p.id = ${processId} AND c.user_id = ${userId}
      FOR SHARE OF p
    `;

    if (!lockedProcess.length) {
      return { status: "process_not_found" };
    }

    const document = await tx.document.findFirst({
      where: { id: documentId, processId, userId },
      select: { fileUrl: true },
    });

    if (!document) {
      return { status: "document_not_found" };
    }

    await tx.document.delete({ where: { id: documentId } });

    await writeAuditLog(tx, {
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entity: AUDIT_ENTITIES.DOCUMENT,
      entityId: documentId,
      ip: options.ip,
    });

    await enqueue(tx, [document.fileUrl]);

    return { status: "deleted", storageKey: document.fileUrl };
  });
}

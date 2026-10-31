import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const AUDIT_ACTIONS = {
  DELETE: "DELETE",
  DOWNLOAD: "DOWNLOAD",
  LOGIN: "LOGIN",
} as const;

export const AUDIT_ENTITIES = {
  CLIENT: "Client",
  PROCESS: "Process",
  DOCUMENT: "Document",
  EVENT: "Event",
  USER: "User",
} as const;

export interface AuditLogEntry {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  ip: string;
}

/**
 * Grava o registro sem tratar erro. Use dentro de uma transação quando a
 * auditoria precisa fazer parte da operação (exclusões).
 */
export async function writeAuditLog(
  db: Pick<Prisma.TransactionClient, "auditLog">,
  entry: AuditLogEntry
): Promise<void> {
  await db.auditLog.create({ data: entry });
}

/**
 * Grava o registro sem interromper o fluxo principal. Use em operações em que
 * a auditoria é acessória (login e download).
 */
export async function recordAuditLogSafely(
  entry: AuditLogEntry,
  db: Pick<PrismaClient, "auditLog"> = prisma
): Promise<void> {
  try {
    await writeAuditLog(db, entry);
  } catch (error) {
    console.error("Falha ao registrar auditoria:", error);
  }
}

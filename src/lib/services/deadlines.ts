import type { Prisma } from "@prisma/client";

/**
 * Conta prazos pendentes ligados diretamente a um processo.
 * Deve ser executada dentro da mesma transação da exclusão.
 */
export async function countPendingDeadlinesForProcess(
  db: Prisma.TransactionClient,
  processId: string
): Promise<number> {
  return db.event.count({
    where: {
      processId,
      type: "PRAZO",
      status: "PENDENTE",
    },
  });
}

/**
 * Conta prazos pendentes ligados aos processos de um cliente.
 * Deve ser executada dentro da mesma transação da exclusão.
 */
export async function countPendingDeadlinesForClient(
  db: Prisma.TransactionClient,
  clientId: string
): Promise<number> {
  return db.event.count({
    where: {
      type: "PRAZO",
      status: "PENDENTE",
      process: { clientId },
    },
  });
}

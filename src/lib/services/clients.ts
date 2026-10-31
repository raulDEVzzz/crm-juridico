import { Prisma, type Client, type PrismaClient } from "@prisma/client";

import { AUDIT_ACTIONS, AUDIT_ENTITIES, writeAuditLog } from "@/lib/audit";
import {
  getBirthdayMonthDayWindow,
  isLeapYear,
} from "@/lib/birthdays";
import { enqueueStorageDeletion } from "@/lib/storage/cleanup";
import { countPendingDeadlinesForClient } from "@/lib/services/deadlines";
import {
  buildPage,
  normalizePagination,
  type Page,
  type PaginationParams,
} from "@/lib/services/pagination";

type EnqueueStorageDeletion = typeof enqueueStorageDeletion;

export interface ListClientsParams extends PaginationParams {
  search?: string;
}

export interface ClientOption {
  id: string;
  name: string;
}

export interface BirthdayClientRecord {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  birthDate: Date;
}

/** Lista paginada de clientes com busca executada no banco. */
export async function listClientsForUser(
  db: PrismaClient,
  userId: string,
  params: ListClientsParams = {}
): Promise<Page<Client>> {
  const { take, cursor } = normalizePagination(params);
  const term = params.search?.trim();
  const digits = term?.replace(/\D/g, "") ?? "";

  const where: Prisma.ClientWhereInput = { userId };

  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      ...(digits
        ? [
            { document: { contains: digits } },
            { phone: { contains: digits } },
            { whatsapp: { contains: digits } },
          ]
        : []),
    ];
  }

  const clients = await db.client.findMany({
    where,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  return buildPage(clients, take);
}

/** Opções leves para selects de formulários. */
export async function listClientOptionsForUser(
  db: PrismaClient,
  userId: string
): Promise<ClientOption[]> {
  return db.client.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

/**
 * Busca no banco somente os aniversariantes da janela informada (MM-DD).
 * O filtro lida com a virada do ano e com 29/02 em anos não bissextos.
 */
export async function getClientsWithBirthdayWindowForUser(
  db: PrismaClient,
  userId: string,
  daysAhead = 7,
  referenceDate = new Date()
): Promise<BirthdayClientRecord[]> {
  const { startMd, endMd, wrapsYear, referenceYear } =
    getBirthdayMonthDayWindow(daysAhead, referenceDate);
  const leap = isLeapYear(referenceYear);

  const range = wrapsYear
    ? Prisma.sql`("birthday_clients"."md" >= ${startMd} OR "birthday_clients"."md" <= ${endMd})`
    : Prisma.sql`("birthday_clients"."md" >= ${startMd} AND "birthday_clients"."md" <= ${endMd})`;

  return db.$queryRaw<BirthdayClientRecord[]>`
    SELECT "id", "name", "phone", "whatsapp", "birthDate"
    FROM (
      SELECT
        "id",
        "name",
        "phone",
        "whatsapp",
        "birth_date" AS "birthDate",
        CASE
          WHEN EXTRACT(MONTH FROM "birth_date") = 2
            AND EXTRACT(DAY FROM "birth_date") = 29
            AND ${leap} = false
          THEN 228
          ELSE
            EXTRACT(MONTH FROM "birth_date")::int * 100
            + EXTRACT(DAY FROM "birth_date")::int
        END AS "md"
      FROM "clients"
      WHERE "user_id" = ${userId} AND "birth_date" IS NOT NULL
    ) AS "birthday_clients"
    WHERE ${range}
    ORDER BY "birthDate" ASC, "id" ASC
  `;
}

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
  options: { enqueue?: EnqueueStorageDeletion; ip: string }
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

    await writeAuditLog(tx, {
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entity: AUDIT_ENTITIES.CLIENT,
      entityId: clientId,
      ip: options.ip,
    });

    const storageKeys = documents.map((document) => document.fileUrl);
    await enqueue(tx, storageKeys);

    return { status: "deleted", storageKeys };
  });
}

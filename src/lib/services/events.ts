import {
  Prisma,
  type EventStatus,
  type PrismaClient,
} from "@prisma/client";

import { getBrasiliaDateParts } from "@/lib/dates";
import { AUDIT_ACTIONS, AUDIT_ENTITIES, writeAuditLog } from "@/lib/audit";
import {
  buildPage,
  normalizePagination,
  type Page,
  type PaginationParams,
} from "@/lib/services/pagination";

export const URGENT_DEADLINE_LIMIT = 100;
export const URGENT_DEADLINE_LOOKBACK_DAYS = 90;

export type EventWithProcess = Prisma.EventGetPayload<{
  include: {
    process: {
      include: {
        client: true;
      };
    };
  };
}>;

export interface ListEventsParams extends PaginationParams {
  status?: EventStatus;
}

export type AgendaSection = "atrasados" | "proximos" | "concluidos";

export interface ListAgendaSectionParams extends PaginationParams {
  now?: Date;
}

export interface AgendaCursors {
  atrasados?: string | null;
  proximos?: string | null;
  concluidos?: string | null;
}

export interface AgendaSectionPages {
  atrasados: Page<EventWithProcess>;
  proximos: Page<EventWithProcess>;
  concluidos: Page<EventWithProcess>;
}

/** Lista paginada de uma das três seções da agenda. */
export async function listAgendaSectionForUser(
  db: PrismaClient,
  userId: string,
  section: AgendaSection,
  params: ListAgendaSectionParams = {}
): Promise<Page<EventWithProcess>> {
  const { take, cursor } = normalizePagination(params);
  const now = params.now ?? new Date();

  const { status, eventDate, orderBy } = {
    atrasados: {
      status: "PENDENTE" as const,
      eventDate: { lt: now },
      orderBy: [
        { eventDate: "desc" as const },
        { id: "desc" as const },
      ],
    },
    proximos: {
      status: "PENDENTE" as const,
      eventDate: { gte: now },
      orderBy: [
        { eventDate: "asc" as const },
        { id: "asc" as const },
      ],
    },
    concluidos: {
      status: "CONCLUIDO" as const,
      eventDate: undefined,
      orderBy: [
        { eventDate: "desc" as const },
        { id: "desc" as const },
      ],
    },
  }[section];

  const events = await db.event.findMany({
    where: {
      userId,
      status,
      ...(eventDate ? { eventDate } : {}),
    },
    include: {
      process: {
        include: { client: true },
      },
    },
    orderBy,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  return buildPage(events, take);
}

/** Busca as três seções com o mesmo instante de referência. */
export async function getAgendaSectionsForUser(
  db: PrismaClient,
  userId: string,
  cursors: AgendaCursors = {},
  now = new Date()
): Promise<AgendaSectionPages> {
  const [atrasados, proximos, concluidos] = await Promise.all([
    listAgendaSectionForUser(db, userId, "atrasados", {
      cursor: cursors.atrasados,
      now,
    }),
    listAgendaSectionForUser(db, userId, "proximos", {
      cursor: cursors.proximos,
      now,
    }),
    listAgendaSectionForUser(db, userId, "concluidos", {
      cursor: cursors.concluidos,
      now,
    }),
  ]);

  return { atrasados, proximos, concluidos };
}

/** Lista paginada de compromissos, com filtro opcional de status. */
export async function listEventsForUser(
  db: PrismaClient,
  userId: string,
  params: ListEventsParams = {}
): Promise<Page<EventWithProcess>> {
  const { take, cursor } = normalizePagination(params);

  const events = await db.event.findMany({
    where: {
      userId,
      ...(params.status ? { status: params.status } : {}),
    },
    include: {
      process: {
        include: { client: true },
      },
    },
    orderBy: [{ eventDate: "asc" }, { id: "asc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  return buildPage(events, take);
}

/** Próximos compromissos pendentes, limitados (padrão: 3 para o dashboard). */
export async function getUpcomingEventsForUser(
  db: PrismaClient,
  userId: string,
  limit = 3,
  now = new Date()
): Promise<EventWithProcess[]> {
  return db.event.findMany({
    where: {
      userId,
      eventDate: { gte: now },
      status: "PENDENTE",
    },
    include: {
      process: {
        include: { client: true },
      },
    },
    orderBy: [{ eventDate: "asc" }, { id: "asc" }],
    take: limit,
  });
}

export async function countUpcomingEventsForUser(
  db: PrismaClient,
  userId: string,
  now = new Date()
): Promise<number> {
  return db.event.count({
    where: {
      userId,
      eventDate: { gte: now },
      status: "PENDENTE",
    },
  });
}

/**
 * Prazos urgentes: vencidos nos últimos 90 dias ou a vencer em até 48h.
 * O limite evita carregar um histórico inteiro no dashboard.
 */
export async function getUrgentDeadlinesForUser(
  db: PrismaClient,
  userId: string,
  options: { now?: Date; limit?: number } = {}
): Promise<EventWithProcess[]> {
  const now = options.now ?? new Date();
  const limit = options.limit ?? URGENT_DEADLINE_LIMIT;
  const { year, month, day } = getBrasiliaDateParts(now);
  const lowerBound = new Date(
    now.getTime() - URGENT_DEADLINE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
  );
  const endOfIn2Days = new Date(
    Date.UTC(year, month, day + 2, 23 + 3, 59, 59, 999)
  );

  return db.event.findMany({
    where: {
      userId,
      type: "PRAZO",
      status: "PENDENTE",
      eventDate: {
        gte: lowerBound,
        lte: endOfIn2Days,
      },
    },
    include: {
      process: {
        include: { client: true },
      },
    },
    orderBy: [{ eventDate: "asc" }, { id: "asc" }],
    take: limit,
  });
}

export async function getEventByIdForUser(
  db: PrismaClient,
  userId: string,
  eventId: string
) {
  return db.event.findFirst({
    where: { id: eventId, userId },
    include: {
      process: {
        include: { client: true },
      },
    },
  });
}

export async function updateEventStatusForUser(
  db: PrismaClient,
  userId: string,
  eventId: string,
  status: EventStatus
): Promise<boolean> {
  const result = await db.event.updateMany({
    where: { id: eventId, userId },
    data: { status },
  });

  return result.count > 0;
}

export async function deleteEventForUser(
  db: PrismaClient,
  userId: string,
  eventId: string,
  options: { ip: string }
): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const result = await tx.event.deleteMany({
      where: { id: eventId, userId },
    });

    if (result.count === 0) {
      return false;
    }

    await writeAuditLog(tx, {
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entity: AUDIT_ENTITIES.EVENT,
      entityId: eventId,
      ip: options.ip,
    });

    return true;
  });
}

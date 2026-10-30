import {
  Prisma,
  type EventStatus,
  type PrismaClient,
} from "@prisma/client";

import { getBrasiliaDateParts } from "@/lib/dates";
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
  eventId: string
): Promise<boolean> {
  const result = await db.event.deleteMany({
    where: { id: eventId, userId },
  });

  return result.count > 0;
}

import type { PrismaClient } from "@prisma/client";

import {
  getClientsWithBirthdayWindowForUser,
  type BirthdayClientRecord,
} from "@/lib/services/clients";
import {
  countUpcomingEventsForUser,
  getUpcomingEventsForUser,
  getUrgentDeadlinesForUser,
  type EventWithProcess,
} from "@/lib/services/events";

export { URGENT_DEADLINE_LIMIT } from "@/lib/services/events";

export interface DashboardOverview {
  totalClients: number;
  pendingEvents: number;
  upcomingEvents: EventWithProcess[];
  birthdayClients: BirthdayClientRecord[];
  urgentDeadlines: EventWithProcess[];
}

/**
 * Carrega o dashboard com contadores no banco e listas limitadas.
 * Nenhuma consulta traz todos os clientes ou todos os eventos.
 */
export async function getDashboardOverviewForUser(
  db: PrismaClient,
  userId: string,
  options: { now?: Date; birthdayDaysAhead?: number } = {}
): Promise<DashboardOverview> {
  const now = options.now ?? new Date();
  const birthdayDaysAhead = options.birthdayDaysAhead ?? 7;

  const [
    totalClients,
    pendingEvents,
    upcomingEvents,
    birthdayClients,
    urgentDeadlines,
  ] = await Promise.all([
    db.client.count({ where: { userId } }),
    countUpcomingEventsForUser(db, userId, now),
    getUpcomingEventsForUser(db, userId, 3, now),
    getClientsWithBirthdayWindowForUser(db, userId, birthdayDaysAhead, now),
    getUrgentDeadlinesForUser(db, userId, { now }),
  ]);

  return {
    totalClients,
    pendingEvents,
    upcomingEvents,
    birthdayClients,
    urgentDeadlines,
  };
}

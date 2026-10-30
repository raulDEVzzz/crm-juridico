"use server";

import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProcess } from "@/lib/serializers/process";
import { getDashboardOverviewForUser } from "@/lib/services/dashboard";
import type { EventWithProcess } from "@/lib/services/events";

function serializeEvent(event: EventWithProcess) {
  return {
    ...event,
    process: event.process ? serializeProcess(event.process) : null,
  };
}

export async function getDashboardData() {
  const userId = await getCurrentUserId();
  const overview = await getDashboardOverviewForUser(prisma, userId);

  return {
    ...overview,
    upcomingEvents: overview.upcomingEvents.map(serializeEvent),
    urgentDeadlines: overview.urgentDeadlines.map(serializeEvent),
  };
}

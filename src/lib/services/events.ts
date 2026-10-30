import type { EventStatus, PrismaClient } from "@prisma/client";

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

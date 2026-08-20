"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EventStatus, EventType } from "@prisma/client";

import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  eventFormSchema,
  parseEventDateTime,
} from "@/lib/validations/agenda";
import type { ActionState } from "@/types/actions";

export type { ActionState };

export async function getEvents() {
  const userId = await getCurrentUserId();

  return prisma.event.findMany({
    where: { userId },
    include: {
      process: {
        include: { client: true },
      },
    },
    orderBy: { eventDate: "asc" },
  });
}

export async function getUpcomingEvents() {
  const userId = await getCurrentUserId();
  const now = new Date();

  return prisma.event.findMany({
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
    orderBy: { eventDate: "asc" },
  });
}

export async function getEventById(id: string) {
  const userId = await getCurrentUserId();

  return prisma.event.findFirst({
    where: { id, userId },
    include: {
      process: {
        include: { client: true },
      },
    },
  });
}

export async function createEvent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description")?.toString() || undefined,
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime")?.toString() || undefined,
    type: formData.get("type"),
    status: formData.get("status") || "PENDENTE",
    processId: formData.get("processId")?.toString() || undefined,
  };

  const parsed = eventFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do compromisso.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const eventDate = parseEventDateTime(
    parsed.data.eventDate,
    parsed.data.eventTime
  );

  if (!eventDate) {
    return { success: false, message: "Data ou horário inválido." };
  }

  if (parsed.data.processId) {
    const process = await prisma.process.findFirst({
      where: {
        id: parsed.data.processId,
        client: { userId },
      },
    });

    if (!process) {
      return { success: false, message: "Processo vinculado não encontrado." };
    }
  }

  await prisma.event.create({
    data: {
      userId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      eventDate,
      type: parsed.data.type as EventType,
      status: parsed.data.status as EventStatus,
      processId: parsed.data.processId || null,
    },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");

  const returnTo = formData.get("returnTo")?.toString();
  if (returnTo) {
    redirect(returnTo);
  }

  redirect("/agenda");
}

export async function updateEventStatus(
  id: string,
  status: EventStatus
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  const event = await prisma.event.findFirst({
    where: { id, userId },
  });

  if (!event) {
    return { success: false, message: "Compromisso não encontrado." };
  }

  await prisma.event.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");

  return {
    success: true,
    message:
      status === "CONCLUIDO"
        ? "Compromisso marcado como concluído."
        : "Compromisso reaberto.",
  };
}

export async function deleteEvent(id: string): Promise<ActionState> {
  const userId = await getCurrentUserId();

  const event = await prisma.event.findFirst({
    where: { id, userId },
  });

  if (!event) {
    return { success: false, message: "Compromisso não encontrado." };
  }

  await prisma.event.delete({ where: { id } });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");

  return { success: true, message: "Compromisso excluído com sucesso." };
}

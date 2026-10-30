"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EventStatus, EventType } from "@prisma/client";

import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteEventForUser,
  getEventByIdForUser,
  getUpcomingEventsForUser,
  getUrgentDeadlinesForUser,
  listEventsForUser,
  updateEventStatusForUser,
  type ListEventsParams,
} from "@/lib/services/events";
import { serializeProcess } from "@/lib/serializers/process";
import {
  eventFormSchema,
  eventStatusEnum,
  parseEventDateTime,
} from "@/lib/validations/agenda";
import type { ActionState } from "@/types/actions";

export type { ActionState };

export async function getEvents(params: ListEventsParams = {}) {
  const userId = await getCurrentUserId();
  const page = await listEventsForUser(prisma, userId, params);

  return {
    ...page,
    items: page.items.map((event) => ({
      ...event,
      process: event.process ? serializeProcess(event.process) : null,
    })),
  };
}

/** Próximos compromissos pendentes (o dashboard pede apenas 3). */
export async function getUpcomingEvents(limit = 3) {
  const userId = await getCurrentUserId();
  const events = await getUpcomingEventsForUser(prisma, userId, limit);

  return events.map((event) => ({
    ...event,
    process: event.process ? serializeProcess(event.process) : null,
  }));
}

/**
 * Prazos urgentes: vencidos nos últimos 90 dias ou a vencer em até 48h.
 * Limitado a 100 registros para não carregar histórico inteiro.
 */
export async function getUrgentDeadlines() {
  const userId = await getCurrentUserId();
  const events = await getUrgentDeadlinesForUser(prisma, userId);

  return events.map((event) => ({
    ...event,
    process: event.process ? serializeProcess(event.process) : null,
  }));
}

export async function getEventById(id: string) {
  const userId = await getCurrentUserId();

  const event = await getEventByIdForUser(prisma, userId, id);
  return event ? { ...event, process: event.process ? serializeProcess(event.process) : null } : null;
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

  try {
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
  } catch (error) {
    console.error("Erro ao criar compromisso:", error);
    return { success: false, message: "Erro ao criar o compromisso." };
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");

  const rawReturnTo = formData.get("returnTo")?.toString().trim();
  const isSafeInternalUrl =
    rawReturnTo &&
    rawReturnTo.startsWith("/") &&
    !rawReturnTo.startsWith("//") &&
    !rawReturnTo.includes("\\") &&
    !/[\x00-\x1F\x7F]/.test(rawReturnTo);

  if (isSafeInternalUrl) {
    redirect(rawReturnTo);
  }

  redirect("/agenda");
}

export async function updateEventStatus(
  id: string,
  status: EventStatus
): Promise<ActionState> {
  const parsedStatus = eventStatusEnum.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, message: "Status de compromisso inválido." };
  }

  const validStatus = parsedStatus.data;
  const userId = await getCurrentUserId();

  let updated = false;

  try {
    updated = await updateEventStatusForUser(prisma, userId, id, validStatus);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, message: "Erro ao atualizar status do compromisso." };
  }

  if (!updated) {
    return { success: false, message: "Compromisso não encontrado." };
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");

  return {
    success: true,
    message:
      validStatus === "CONCLUIDO"
        ? "Compromisso marcado como concluído."
        : "Compromisso reaberto com sucesso.",
  };
}

export async function deleteEvent(id: string): Promise<ActionState> {
  const userId = await getCurrentUserId();

  let deleted = false;

  try {
    deleted = await deleteEventForUser(prisma, userId, id);
  } catch (error) {
    console.error("Erro ao excluir compromisso:", error);
    return { success: false, message: "Erro ao excluir o compromisso." };
  }

  if (!deleted) {
    return { success: false, message: "Compromisso não encontrado." };
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");

  return { success: true, message: "Compromisso excluído com sucesso." };
}

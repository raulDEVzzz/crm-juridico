"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EventStatus, EventType } from "@prisma/client";

import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProcess } from "@/lib/serializers/process";
import {
  eventFormSchema,
  eventStatusEnum,
  parseEventDateTime,
} from "@/lib/validations/agenda";
import type { ActionState } from "@/types/actions";

export type { ActionState };

export async function getEvents() {
  const userId = await getCurrentUserId();

  const events = await prisma.event.findMany({
    where: { userId },
    include: {
      process: {
        include: { client: true },
      },
    },
    orderBy: { eventDate: "asc" },
  });
  return events.map((event) => ({ ...event, process: event.process ? serializeProcess(event.process) : null }));
}

export async function getUpcomingEvents() {
  const userId = await getCurrentUserId();
  const now = new Date();

  const events = await prisma.event.findMany({
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
  return events.map((event) => ({ ...event, process: event.process ? serializeProcess(event.process) : null }));
}

export async function getEventById(id: string) {
  const userId = await getCurrentUserId();

  const event = await prisma.event.findFirst({
    where: { id, userId },
    include: {
      process: {
        include: { client: true },
      },
    },
  });
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

  const event = await prisma.event.findFirst({
    where: { id, userId },
  });

  if (!event) {
    return { success: false, message: "Compromisso não encontrado." };
  }

  try {
    await prisma.event.update({
      where: { id },
      data: { status: validStatus },
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, message: "Erro ao atualizar status do compromisso." };
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

  const event = await prisma.event.findFirst({
    where: { id, userId },
  });

  if (!event) {
    return { success: false, message: "Compromisso não encontrado." };
  }

  try {
    await prisma.event.delete({ where: { id } });
  } catch (error) {
    console.error("Erro ao excluir compromisso:", error);
    return { success: false, message: "Erro ao excluir o compromisso." };
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");

  return { success: true, message: "Compromisso excluído com sucesso." };
}

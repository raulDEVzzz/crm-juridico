"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type LegalArea, type ProcessStatus } from "@prisma/client";

import { getCurrentUserId } from "@/lib/auth";
import { parseDateTime } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { serializeProcess } from "@/lib/serializers/process";
import { drainStorageDeletionJobs, enqueueStorageDeletion } from "@/lib/storage/cleanup";
import {
  formatCnj,
  processFormSchema,
  timelineFormSchema,
} from "@/lib/validations/process";
import type { ActionState } from "@/types/actions";

export type { ActionState };

/**
 * Verificação rápida de propriedade do processo pelo usuário logado (sem joins pesados).
 */
async function verifyProcessOwner(processId: string, userId: string) {
  const process = await prisma.process.findFirst({
    where: {
      id: processId,
      client: { userId },
    },
    select: {
      id: true,
      clientId: true,
    },
  });
  return process;
}

/**
 * Busca completa de processo com timeline e documentos associados.
 */
async function getProcessWithDetails(processId: string, userId: string) {
  const process = await prisma.process.findFirst({
    where: {
      id: processId,
      client: { userId },
    },
    include: {
      client: true,
      timeline: { orderBy: { date: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
  return process ? serializeProcess(process) : null;
}

export async function getProcesses(search?: string) {
  const userId = await getCurrentUserId();
  const term = search?.trim();

  let formattedSearchCnj: string | undefined;
  if (term) {
    const rawDigits = term.replace(/\D/g, "");
    if (rawDigits.length > 0) {
      formattedSearchCnj = formatCnj(rawDigits);
    }
  }

  const processes = await prisma.process.findMany({
    where: {
      client: { userId },
      ...(term
        ? {
            OR: [
              ...(formattedSearchCnj
                ? [
                    {
                      processNumber: {
                        contains: formattedSearchCnj,
                        mode: "insensitive" as const,
                      },
                    },
                  ]
                : []),
              {
                processNumber: {
                  contains: term,
                  mode: "insensitive" as const,
                },
              },
              {
                client: {
                  name: { contains: term, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });
  return processes.map(serializeProcess);
}

export async function getProcessById(id: string) {
  const userId = await getCurrentUserId();
  return getProcessWithDetails(id, userId);
}

export async function createProcess(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  const raw = {
    clientId: formData.get("clientId"),
    processNumber: formData.get("processNumber"),
    court: formData.get("court"),
    area: formData.get("area"),
    status: formData.get("status") || "ATIVO",
    value: formData.get("value")?.toString() || undefined,
    notes: formData.get("notes")?.toString() || undefined,
  };

  const parsed = processFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, userId },
  });

  if (!client) {
    return { success: false, message: "Cliente não encontrado." };
  }

  let createdProcessId: string;

  try {
    const process = await prisma.process.create({
      data: {
        clientId: parsed.data.clientId,
        processNumber: parsed.data.processNumber,
        court: parsed.data.court,
        area: parsed.data.area as LegalArea,
        status: parsed.data.status as ProcessStatus,
        value: parsed.data.value ?? null,
        notes: parsed.data.notes || null,
      },
    });
    createdProcessId = process.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Este número CNJ já está cadastrado para este cliente.",
      };
    }
    console.error("Erro ao criar processo:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao salvar o processo. Tente novamente.",
    };
  }

  revalidatePath("/processes");
  redirect(`/processes/${createdProcessId}`);
}

export async function updateProcess(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const existing = await verifyProcessOwner(id, userId);

  if (!existing) {
    return { success: false, message: "Processo não encontrado." };
  }

  const raw = {
    clientId: formData.get("clientId"),
    processNumber: formData.get("processNumber"),
    court: formData.get("court"),
    area: formData.get("area"),
    status: formData.get("status"),
    value: formData.get("value")?.toString() || undefined,
    notes: formData.get("notes")?.toString() || undefined,
  };

  const parsed = processFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, userId },
  });

  if (!client) {
    return { success: false, message: "Cliente não encontrado." };
  }

  try {
    await prisma.process.update({
      where: { id },
      data: {
        clientId: parsed.data.clientId,
        processNumber: parsed.data.processNumber,
        court: parsed.data.court,
        area: parsed.data.area as LegalArea,
        status: parsed.data.status as ProcessStatus,
        value: parsed.data.value ?? null,
        notes: parsed.data.notes || null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Este número CNJ já está cadastrado para este cliente.",
      };
    }
    console.error("Erro ao atualizar processo:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao atualizar o processo. Tente novamente.",
    };
  }

  revalidatePath("/processes");
  revalidatePath(`/processes/${id}`);
  redirect(`/processes/${id}`);
}

export async function deleteProcess(id: string): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const existing = await verifyProcessOwner(id, userId);

  if (!existing) {
    return { success: false, message: "Processo não encontrado." };
  }

  const documents = await prisma.document.findMany({
    where: { processId: id, userId },
    select: { fileUrl: true },
  });

  try {
    await prisma.$transaction([
      prisma.document.deleteMany({ where: { processId: id, userId } }),
      prisma.process.delete({ where: { id } }),
    ]);
    await enqueueStorageDeletion(documents.map((document) => document.fileUrl));
    await drainStorageDeletionJobs();
  } catch (error) {
    console.error("Erro ao excluir processo e documentos:", error);
    return { success: false, message: "Não foi possível excluir o processo." };
  }

  revalidatePath("/processes");
  revalidatePath("/agenda");

  return { success: true, message: "Processo excluído com sucesso." };
}

export async function createTimelineEntry(
  processId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const process = await verifyProcessOwner(processId, userId);

  if (!process) {
    return { success: false, message: "Processo não encontrado." };
  }

  const raw = {
    title: formData.get("title"),
    description: formData.get("description")?.toString() || undefined,
    date: formData.get("date"),
  };

  const parsed = timelineFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do andamento.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const date = parseDateTime(parsed.data.date);
  if (!date) {
    return { success: false, message: "Data inválida." };
  }

  await prisma.processTimeline.create({
    data: {
      processId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      date,
    },
  });

  revalidatePath(`/processes/${processId}`);

  return { success: true, message: "Andamento registrado com sucesso." };
}

export async function deleteTimelineEntry(
  processId: string,
  timelineId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const process = await verifyProcessOwner(processId, userId);

  if (!process) {
    return { success: false, message: "Processo não encontrado." };
  }

  // Previne IDOR garantindo que o timelineId pertence ao processId
  const entry = await prisma.processTimeline.findFirst({
    where: { id: timelineId, processId },
  });

  if (!entry) {
    return { success: false, message: "Andamento não encontrado." };
  }

  await prisma.processTimeline.delete({ where: { id: timelineId } });

  revalidatePath(`/processes/${processId}`);

  return { success: true, message: "Andamento removido." };
}

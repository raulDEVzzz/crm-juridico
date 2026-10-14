"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PersonType, Prisma } from "@prisma/client";

import { getCurrentUserId } from "@/lib/auth";
import { parseDateUTC } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { drainStorageDeletionJobs, enqueueStorageDeletion } from "@/lib/storage/cleanup";
import { clientFormSchema } from "@/lib/validations/client";
import type { ActionState } from "@/types/actions";

export type { ActionState };

export async function getClients() {
  const userId = await getCurrentUserId();

  return prisma.client.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

/** Minimal dataset used by the dashboard's birthday widgets. */
export async function getClientsWithBirthDate() {
  const userId = await getCurrentUserId();

  return prisma.client.findMany({
    where: { userId, birthDate: { not: null } },
    select: {
      id: true,
      name: true,
      phone: true,
      whatsapp: true,
      birthDate: true,
    },
  });
}

export async function getClientById(id: string) {
  const userId = await getCurrentUserId();

  return prisma.client.findFirst({
    where: { id, userId },
  });
}

export async function createClient(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  const raw = {
    name: formData.get("name"),
    personType: formData.get("personType"),
    document: formData.get("document"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = clientFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await prisma.client.create({
      data: {
        name: data.name,
        personType: data.personType as PersonType,
        document: data.document,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        birthDate: parseDateUTC(data.birthDate),
        notes: data.notes || null,
        userId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Já existe um cliente cadastrado com este CPF/CNPJ.",
      };
    }
    console.error("Erro ao cadastrar cliente:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao salvar o cliente. Tente novamente.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClient(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  const existing = await prisma.client.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return { success: false, message: "Cliente não encontrado." };
  }

  const raw = {
    name: formData.get("name"),
    personType: formData.get("personType"),
    document: formData.get("document"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = clientFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        personType: data.personType as PersonType,
        document: data.document,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        birthDate: parseDateUTC(data.birthDate),
        notes: data.notes || null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Já existe um cliente cadastrado com este CPF/CNPJ.",
      };
    }
    console.error("Erro ao atualizar cliente:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao atualizar o cliente. Tente novamente.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect("/clients");
}

export async function deleteClient(id: string): Promise<ActionState> {
  const userId = await getCurrentUserId();

  const existing = await prisma.client.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return { success: false, message: "Cliente não encontrado." };
  }

  const documents = await prisma.document.findMany({
    where: {
      userId,
      OR: [{ clientId: id }, { process: { clientId: id } }],
    },
    select: { fileUrl: true },
  });

  try {
    await prisma.$transaction([
      prisma.document.deleteMany({
        where: { userId, OR: [{ clientId: id }, { process: { clientId: id } }] },
      }),
      prisma.client.delete({ where: { id } }),
    ]);
    await enqueueStorageDeletion(documents.map((document) => document.fileUrl));
  } catch (error) {
    console.error("Erro ao excluir cliente e documentos no banco:", error);
    return { success: false, message: "Não foi possível excluir o cliente." };
  }

  // Não bloqueia a resposta de sucesso caso a fila de storage falhe momentaneamente
  drainStorageDeletionJobs().catch(console.error);

  revalidatePath("/dashboard");
  revalidatePath("/clients");

  return { success: true, message: "Cliente excluído com sucesso." };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PersonType } from "@prisma/client";

import { getCurrentUserId } from "@/lib/auth";
import { parseDateUTC } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
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
  } catch {
    return {
      success: false,
      message: "Não foi possível salvar. Verifique se o documento já está cadastrado.",
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
  } catch {
    return {
      success: false,
      message: "Não foi possível atualizar. Verifique se o documento já está cadastrado.",
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
    const storage = getStorage();
    await Promise.all(documents.map((document) => storage.delete(document.fileUrl)));
    await prisma.$transaction([
      prisma.document.deleteMany({
        where: { userId, OR: [{ clientId: id }, { process: { clientId: id } }] },
      }),
      prisma.client.delete({ where: { id } }),
    ]);
  } catch (error) {
    console.error("Erro ao excluir cliente e documentos:", error);
    return { success: false, message: "Não foi possível excluir o cliente." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/clients");

  return { success: true, message: "Cliente excluído com sucesso." };
}

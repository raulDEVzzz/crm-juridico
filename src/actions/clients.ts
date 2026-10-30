"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { PersonType, Prisma } from "@prisma/client";

import { getCurrentUserId } from "@/lib/auth";
import { parseDateUTC } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import {
  deleteClientForUser,
  getClientByIdForUser,
  getClientsWithBirthdayWindowForUser,
  listClientOptionsForUser,
  listClientsForUser,
  type ListClientsParams,
} from "@/lib/services/clients";
import { drainStorageDeletionJobs } from "@/lib/storage/cleanup";
import { clientFormSchema } from "@/lib/validations/client";
import type { ActionState } from "@/types/actions";

export type { ActionState };

export async function getClients(params: ListClientsParams = {}) {
  const userId = await getCurrentUserId();
  return listClientsForUser(prisma, userId, params);
}

/** Opções leves para selects de formulários. */
export async function getClientOptions() {
  const userId = await getCurrentUserId();
  return listClientOptionsForUser(prisma, userId);
}

/**
 * Aniversariantes já filtrados no banco pela janela de dias.
 * Usado pelo dashboard para não carregar todos os clientes.
 */
export async function getClientsWithBirthDate(daysAhead = 7) {
  const userId = await getCurrentUserId();
  return getClientsWithBirthdayWindowForUser(prisma, userId, daysAhead);
}

export async function getClientById(id: string) {
  const userId = await getCurrentUserId();

  return getClientByIdForUser(prisma, userId, id);
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

  let result: Awaited<ReturnType<typeof deleteClientForUser>>;

  try {
    result = await deleteClientForUser(prisma, userId, id);
  } catch (error) {
    console.error("Erro ao excluir cliente e documentos no banco:", error);
    return { success: false, message: "Não foi possível excluir o cliente." };
  }

  if (result.status === "not_found") {
    return { success: false, message: "Cliente não encontrado." };
  }

  if (result.status === "blocked") {
    const deadlineLabel =
      result.pendingDeadlines === 1 ? "prazo pendente" : "prazos pendentes";

    return {
      success: false,
      message: `Não é possível excluir o cliente: há ${result.pendingDeadlines} ${deadlineLabel} nos processos vinculados. Conclua ou exclua esses prazos antes de continuar.`,
    };
  }

  // Só drena depois que a transação commitou. Uma falha aqui não desfaz a
  // exclusão: o job permanece na fila para o cron.
  after(async () => {
    await drainStorageDeletionJobs().catch(console.error);
  });

  revalidatePath("/dashboard");
  revalidatePath("/clients");

  return { success: true, message: "Cliente excluído com sucesso." };
}

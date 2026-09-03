"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildStorageKey, getStorage } from "@/lib/storage";
import { enqueueStorageDeletion } from "@/lib/storage/cleanup";
import {
  documentUploadSchema,
  sanitizeFileName,
  validateFileContent,
  validateFileSize,
  validateFileType,
} from "@/lib/validations/upload";
import type { ActionState } from "@/types/actions";

export type { ActionState };

async function verifyProcessOwnership(processId: string, userId: string) {
  return prisma.process.findFirst({
    where: {
      id: processId,
      client: { userId },
    },
    select: {
      id: true,
      clientId: true,
    },
  });
}

export async function uploadDocument(
  processId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const process = await verifyProcessOwnership(processId, userId);

  if (!process) {
    return { success: false, message: "Processo não encontrado." };
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Selecione um arquivo para enviar." };
  }

  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    return { success: false, message: sizeValidation.message! };
  }

  const typeValidation = validateFileType(file.name, file.type);
  if (!typeValidation.valid) {
    return { success: false, message: typeValidation.message! };
  }

  const metadata = documentUploadSchema.safeParse({
    category: formData.get("category")?.toString() || undefined,
  });

  if (!metadata.success) {
    return {
      success: false,
      message: "Dados do documento inválidos.",
      errors: metadata.error.flatten().fieldErrors,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentValidation = validateFileContent(file.name, buffer);
  if (!contentValidation.valid) {
    return { success: false, message: contentValidation.message! };
  }

  const safeFileName = sanitizeFileName(file.name);
  const storageKey = buildStorageKey(userId, processId, safeFileName);

  let storage: ReturnType<typeof getStorage> | undefined;
  let uploaded = false;

  try {
    storage = getStorage();

    await storage.upload({
      key: storageKey,
      body: buffer,
      contentType: contentValidation.contentType!,
      contentLength: file.size,
    });
    uploaded = true;

    await prisma.document.create({
      data: {
        userId,
        processId,
        clientId: process.clientId,
        fileName: safeFileName,
        fileUrl: storageKey,
        category: metadata.data.category || null,
      },
    });
  } catch (error) {
    console.error("Erro no upload:", error);

    if (uploaded && storage) {
      try {
        await storage.delete(storageKey);
      } catch (cleanupError) {
        console.error("Erro ao desfazer upload sem registro; enfileirando limpeza:", cleanupError);
        await enqueueStorageDeletion([storageKey]).catch(() => undefined);
      }
    }

    return {
      success: false,
      message: "Falha ao enviar o arquivo. Tente novamente.",
    };
  }

  revalidatePath(`/processes/${processId}`);

  return { success: true, message: "Documento enviado com sucesso." };
}

export async function deleteDocument(
  processId: string,
  documentId: string
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  const process = await verifyProcessOwnership(processId, userId);

  if (!process) {
    return { success: false, message: "Processo não encontrado." };
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, processId, userId },
  });

  if (!document) {
    return { success: false, message: "Documento não encontrado." };
  }

  // 1. Remove primeiro do banco de dados para manter consistência
  try {
    await prisma.document.delete({ where: { id: documentId } });
  } catch (error) {
    console.error("Erro ao remover registro do documento:", error);
    return {
      success: false,
      message: "Não foi possível remover o documento. Tente novamente.",
    };
  }

  // 2. Remove do storage sem carregar buffer em memória
  try {
    const storage = getStorage();
    await storage.delete(document.fileUrl);
  } catch (error) {
    console.error("Erro ao deletar arquivo do storage; enfileirando para retry:", error);
    await enqueueStorageDeletion([document.fileUrl]).catch(() => undefined);
  }

  revalidatePath(`/processes/${processId}`);

  return { success: true, message: "Documento removido." };
}

export async function getDocumentDownloadUrl(
  documentId: string
): Promise<{ url: string } | { error: string }> {
  const userId = await getCurrentUserId();

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!document) {
    return { error: "Documento não encontrado." };
  }

  try {
    const storage = getStorage();

    if (storage.driver === "s3") {
      const signedUrl = await storage.getSignedUrl(document.fileUrl);
      return { url: signedUrl };
    }

    return { url: `/api/documents/${documentId}/download` };
  } catch (error) {
    console.error("Erro ao gerar URL de download:", error);
    return { error: "Não foi possível gerar o link de download." };
  }
}

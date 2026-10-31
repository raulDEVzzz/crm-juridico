"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { after } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { resolveClientIp } from "@/lib/auth/credentials";
import { prisma } from "@/lib/prisma";
import {
  deleteDocumentForUser,
  getDocumentForUser,
  uploadDocumentForUser,
} from "@/lib/services/documents";
import { getStorage } from "@/lib/storage";
import { drainStorageDeletionJobs } from "@/lib/storage/cleanup";
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

  try {
    const storage = getStorage();

    // O service relê e trava o processo/cliente na transação, fechando a
    // corrida com exclusão ou reatribuição do processo. Se o vínculo sumiu,
    // ele mesmo remove o arquivo recém-enviado.
    const result = await uploadDocumentForUser(
      prisma,
      storage,
      {
        userId,
        processId,
        fileName: safeFileName,
        category: metadata.data.category || null,
        body: buffer,
        contentType: contentValidation.contentType!,
      },
      {
        onCleanupFailure: () => {
          after(async () => {
            await drainStorageDeletionJobs().catch(() => undefined);
          });
        },
      }
    );

    if (result.status !== "created") {
      return { success: false, message: "Processo não encontrado." };
    }
  } catch (error) {
    console.error("Erro no upload:", error);

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
  const clientIp = resolveClientIp(await headers());

  let result: Awaited<ReturnType<typeof deleteDocumentForUser>>;

  try {
    result = await deleteDocumentForUser(
      prisma,
      userId,
      processId,
      documentId,
      { ip: clientIp }
    );
  } catch (error) {
    console.error("Erro ao remover documento e enfileirar storage:", error);
    return {
      success: false,
      message: "Não foi possível remover o documento. Tente novamente.",
    };
  }

  if (result.status === "process_not_found") {
    return { success: false, message: "Processo não encontrado." };
  }

  if (result.status === "document_not_found") {
    return { success: false, message: "Documento não encontrado." };
  }

  // O arquivo só é apagado depois do commit. Falhas ficam no outbox.
  after(async () => {
    await drainStorageDeletionJobs().catch(console.error);
  });

  revalidatePath(`/processes/${processId}`);

  return { success: true, message: "Documento removido." };
}

export async function getDocumentDownloadUrl(
  documentId: string
): Promise<{ url: string } | { error: string }> {
  const userId = await getCurrentUserId();

  const document = await getDocumentForUser(prisma, userId, documentId);

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

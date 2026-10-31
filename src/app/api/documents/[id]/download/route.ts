import { NextResponse } from "next/server";

import { recordAuditLogSafely } from "@/lib/audit";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDocumentForUser } from "@/lib/services/documents";
import { handleDocumentDownload } from "@/lib/services/downloads";
import { getStorage } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;

    return await handleDocumentDownload(request, id, userId, {
      getDocument: (ownerId, documentId) =>
        getDocumentForUser(prisma, ownerId, documentId),
      getStorage,
      audit: (entry) => recordAuditLogSafely(entry),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Não autenticado') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    console.error("Erro no download:", error);
    return NextResponse.json(
      { error: "Erro ao baixar o documento." },
      { status: 500 }
    );
  }
}

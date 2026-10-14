import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Documento não encontrado." },
        { status: 404 }
      );
    }

    const storage = getStorage();

    if (storage.driver === "s3") {
      const signedUrl = await storage.getSignedUrl(document.fileUrl, 900, document.fileName);
      return NextResponse.redirect(signedUrl);
    }

    const { buffer, contentType } = await storage.readFile(document.fileUrl);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.fileName)}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
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

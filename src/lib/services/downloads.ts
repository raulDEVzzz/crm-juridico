import { NextResponse } from "next/server";

import {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
  type AuditLogEntry,
} from "@/lib/audit";
import { resolveClientIp } from "@/lib/auth/credentials";
import type { StorageAdapter } from "@/lib/storage/types";

interface DownloadDocumentRecord {
  fileUrl: string;
  fileName: string;
}

export interface DocumentDownloadDeps {
  getDocument(
    userId: string,
    documentId: string
  ): Promise<DownloadDocumentRecord | null>;
  getStorage(): StorageAdapter;
  audit(entry: AuditLogEntry): Promise<void>;
}

async function auditDownload(
  audit: DocumentDownloadDeps["audit"],
  entry: AuditLogEntry
) {
  try {
    await audit(entry);
  } catch (error) {
    console.error("Falha ao registrar download na auditoria:", error);
  }
}

export async function handleDocumentDownload(
  request: Request,
  documentId: string,
  userId: string,
  deps: DocumentDownloadDeps
): Promise<Response> {
  const document = await deps.getDocument(userId, documentId);

  if (!document) {
    return NextResponse.json(
      { error: "Documento não encontrado." },
      { status: 404 }
    );
  }

  const storage = deps.getStorage();
  const auditEntry: AuditLogEntry = {
    userId,
    action: AUDIT_ACTIONS.DOWNLOAD,
    entity: AUDIT_ENTITIES.DOCUMENT,
    entityId: documentId,
    ip: resolveClientIp(request.headers),
  };

  if (storage.driver === "s3") {
    const signedUrl = await storage.getSignedUrl(
      document.fileUrl,
      900,
      document.fileName
    );

    await auditDownload(deps.audit, auditEntry);
    return NextResponse.redirect(signedUrl);
  }

  const { stream, contentType, contentLength } = await storage.createReadStream(
    document.fileUrl
  );
  const encodedFileName = encodeURIComponent(document.fileName);

  await auditDownload(deps.audit, auditEntry);

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": contentLength.toString(),
      "Content-Disposition": `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}

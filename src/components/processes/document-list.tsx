"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, File, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import type { Document } from "@prisma/client";

import { deleteDocument } from "@/actions/documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-dialog";
import { DocumentUploadZone } from "@/components/processes/document-upload-zone";

interface DocumentListProps {
  processId: string;
  documents: Document[];
}

export function DocumentList({ processId, documents }: DocumentListProps) {
  const router = useRouter();
  const [uploadKey, setUploadKey] = useState(0);

  const handleUploadSuccess = useCallback(() => {
    setUploadKey((k) => k + 1);
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Documentos</h3>
        <p className="text-sm text-muted-foreground">
          Anexe arquivos ao processo. Downloads são protegidos por link temporário.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enviar documento</CardTitle>
          <CardDescription>
            Arraste ou selecione um arquivo (PDF, DOCX, JPG, PNG — máx. 10 MB).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploadZone
            key={uploadKey}
            processId={processId}
            onSuccess={handleUploadSuccess}
          />
        </CardContent>
      </Card>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <File className="h-8 w-8 opacity-50" />
            Nenhum documento anexado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {documents.length} documento{documents.length !== 1 ? "s" : ""} anexado
            {documents.length !== 1 ? "s" : ""}
          </h4>
          <div className="grid gap-3">
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                processId={processId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentItem({
  document,
  processId,
}: {
  document: Document;
  processId: string;
}) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleConfirmDelete() {
    startDeleteTransition(async () => {
      const result = await deleteDocument(processId, document.id);

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setDeleteError(null);
      setShowDeleteDialog(false);
    });
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      window.open(`/api/documents/${document.id}/download`, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <File className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">{document.fileName}</CardTitle>
                <CardDescription>
                  Enviado em{" "}
                  {format(document.uploadedAt, "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {document.category && (
                <Badge variant="outline">{document.category}</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={handleDownload}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Baixar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteError(null);
                  setShowDeleteDialog(true);
                }}
                title="Remover documento"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteError(null);
        }}
        title="Remover Documento"
        description={`Deseja realmente remover o arquivo "${document.fileName}"? Esta ação excluirá permanentemente o arquivo do storage.`}
        isPending={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

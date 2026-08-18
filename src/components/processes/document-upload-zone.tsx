"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, Loader2, Upload, X } from "lucide-react";

import { uploadDocument, type ActionState } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ALLOWED_EXTENSIONS,
  formatFileSize,
  getAcceptAttribute,
  MAX_FILE_SIZE_BYTES,
  validateFileSize,
  validateFileType,
} from "@/lib/validations/upload";

const initialState: ActionState = {
  success: false,
  message: "",
};

const CATEGORIES = [
  "Petição",
  "Contrato",
  "Procuração",
  "Sentença",
  "Comprovante",
  "Outros",
];

interface DocumentUploadZoneProps {
  processId: string;
  onSuccess?: () => void;
}

export function DocumentUploadZone({
  processId,
  onSuccess,
}: DocumentUploadZoneProps) {
  const action = uploadDocument.bind(null, processId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (state.success) {
      setSelectedFile(null);
      setCategory("");
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setLocalError(null);
    const file = acceptedFiles[0];
    if (!file) return;

    const sizeCheck = validateFileSize(file.size);
    if (!sizeCheck.valid) {
      setLocalError(sizeCheck.message!);
      return;
    }

    const typeCheck = validateFileType(file.name, file.type);
    if (!typeCheck.valid) {
      setLocalError(typeCheck.message!);
      return;
    }

    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptAttribute(),
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false,
    disabled: isPending,
    noClick: false,
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        setLocalError("Arquivo excede o limite de 10 MB.");
      } else if (error?.code === "file-invalid-type") {
        setLocalError(
          `Tipo não permitido. Use: ${ALLOWED_EXTENSIONS.join(", ")}`
        );
      } else {
        setLocalError("Arquivo inválido.");
      }
    },
  });

  function clearFile() {
    setSelectedFile(null);
    setLocalError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);

    if (!selectedFile) {
      setLocalError("Selecione um arquivo para enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (category) formData.append("category", category);

    startTransition(() => {
      formAction(formData);
    });
  }

  const displayError = localError || (!state.success ? state.message : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          isPending && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {isDragActive ? (
              <FileUp className="h-6 w-6 text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          {isDragActive ? (
            <p className="text-sm font-medium text-primary">
              Solte o arquivo aqui...
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Arraste um arquivo ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, JPG ou PNG — máximo 10 MB
              </p>
            </>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileUp className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="category">Categoria (opcional)</Label>
        <Input
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="document-categories"
          placeholder="Ex: Petição"
        />
        <datalist id="document-categories">
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>

      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}

      {state.success && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={isPending || !selectedFile}
        className="w-full"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar documento
      </Button>
    </form>
  );
}

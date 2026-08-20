import { z } from "zod";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
] as const;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const EXTENSION_MIME_MAP: Record<AllowedExtension, AllowedMimeType[]> = {
  ".pdf": ["application/pdf"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

export function isAllowedExtension(extension: string): extension is AllowedExtension {
  return ALLOWED_EXTENSIONS.includes(extension as AllowedExtension);
}

export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
}

export function validateFileType(
  fileName: string,
  mimeType: string
): { valid: boolean; message?: string } {
  const extension = getFileExtension(fileName);

  if (!isAllowedExtension(extension)) {
    return {
      valid: false,
      message: `Tipo de arquivo não permitido. Use: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  const allowedMimes = EXTENSION_MIME_MAP[extension];
  if (!allowedMimes.includes(mimeType as AllowedMimeType)) {
    return {
      valid: false,
      message: "O tipo MIME do arquivo não corresponde à extensão.",
    };
  }

  return { valid: true };
}

/** Validates file signatures; MIME types sent by the browser are not trusted. */
export function validateFileContent(
  fileName: string,
  buffer: Buffer
): { valid: boolean; contentType?: AllowedMimeType; message?: string } {
  const extension = getFileExtension(fileName);
  const startsWith = (...bytes: number[]) =>
    bytes.every((byte, index) => buffer[index] === byte);

  const contentType =
    extension === ".pdf" && buffer.subarray(0, 5).toString("ascii") === "%PDF-"
      ? "application/pdf"
      : (extension === ".jpg" || extension === ".jpeg") && startsWith(0xff, 0xd8, 0xff)
        ? "image/jpeg"
        : extension === ".png" && startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
          ? "image/png"
          : extension === ".docx" && startsWith(0x50, 0x4b, 0x03, 0x04)
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : undefined;

  return contentType
    ? { valid: true, contentType }
    : { valid: false, message: "O conteúdo do arquivo não corresponde ao formato informado." };
}

export function validateFileSize(size: number): { valid: boolean; message?: string } {
  if (size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      message: "Arquivo excede o limite de 10 MB.",
    };
  }

  if (size === 0) {
    return {
      valid: false,
      message: "O arquivo está vazio.",
    };
  }

  return { valid: true };
}

export function sanitizeFileName(fileName: string): string {
  const extension = getFileExtension(fileName);
  const baseName = fileName.slice(0, fileName.length - extension.length);
  const safeBase = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 100);

  return `${safeBase || "documento"}${extension}`;
}

export const documentUploadSchema = z.object({
  category: z.string().max(100, "Categoria muito longa").optional(),
});

export type DocumentUploadData = z.infer<typeof documentUploadSchema>;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getAcceptAttribute(): Record<string, string[]> {
  return {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  };
}

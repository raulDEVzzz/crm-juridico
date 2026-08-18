import { LocalStorageAdapter } from "./local";
import { S3StorageAdapter } from "./s3";
import type { StorageAdapter } from "./types";

export type { StorageAdapter, UploadParams, UploadResult } from "./types";
export { buildStorageKey } from "./types";

let storageInstance: StorageAdapter | null = null;

export function getStorageDriver(): "local" | "s3" {
  const driver = process.env.STORAGE_DRIVER;

  if (driver === "s3") return "s3";
  if (driver === "local") return "local";

  // Em produção na Vercel, usa S3/R2 por padrão
  if (process.env.VERCEL === "1") return "s3";

  return "local";
}

export function getStorage(): StorageAdapter {
  if (storageInstance) return storageInstance;

  const driver = getStorageDriver();

  storageInstance =
    driver === "s3"
      ? new S3StorageAdapter()
      : new LocalStorageAdapter();

  return storageInstance;
}

export function resetStorageForTests() {
  storageInstance = null;
}

import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

import type { StorageAdapter, UploadParams, UploadResult } from "./types";

export class LocalStorageAdapter implements StorageAdapter {
  readonly driver = "local" as const;
  private readonly basePath: string;

  constructor(basePath?: string) {
    this.basePath = path.resolve(
      process.cwd(),
      basePath || process.env.STORAGE_LOCAL_PATH || "./storage/uploads"
    );
  }

  private resolvePath(key: string): string {
    const normalized = path.normalize(key).replace(/^(\.\.[/\\])+/, "");
    const fullPath = path.join(this.basePath, normalized);

    if (!fullPath.startsWith(this.basePath)) {
      throw new Error("Caminho de arquivo inválido.");
    }

    return fullPath;
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    const filePath = this.resolvePath(params.key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, params.body);

    return { key: params.key };
  }

  async getSignedUrl(key: string): Promise<string> {
    // Em ambiente local, o download é feito via Route Handler autenticado.
    // Retornamos a key para o handler resolver o stream diretamente.
    return key;
  }

  async readFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    const filePath = this.resolvePath(key);
    const buffer = await readFile(filePath);
    const extension = path.extname(key).toLowerCase();

    const mimeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };

    return {
      buffer,
      contentType: mimeMap[extension] || "application/octet-stream",
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    try {
      await unlink(filePath);
    } catch {
      // Arquivo pode já ter sido removido
    }
  }
}

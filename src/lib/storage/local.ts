import { createReadStream } from "fs";
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import type { ReadStreamResult, StorageAdapter, UploadParams, UploadResult } from "./types";

const MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

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

  async createReadStream(key: string): Promise<ReadStreamResult> {
    const filePath = this.resolvePath(key);
    const fileStat = await stat(filePath);
    const nodeStream = createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;
    const extension = path.extname(key).toLowerCase();

    return {
      stream: webStream,
      contentType: MIME_MAP[extension] || "application/octet-stream",
      contentLength: fileStat.size,
    };
  }

  async readFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    const filePath = this.resolvePath(key);
    const buffer = await readFile(filePath);
    const extension = path.extname(key).toLowerCase();

    return {
      buffer,
      contentType: MIME_MAP[extension] || "application/octet-stream",
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

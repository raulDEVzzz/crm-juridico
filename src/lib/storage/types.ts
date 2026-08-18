export interface UploadParams {
  key: string;
  body: Buffer;
  contentType: string;
  contentLength: number;
}

export interface UploadResult {
  key: string;
}

export interface StorageAdapter {
  readonly driver: "local" | "s3";
  upload(params: UploadParams): Promise<UploadResult>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  readFile(key: string): Promise<{ buffer: Buffer; contentType: string }>;
  delete(key: string): Promise<void>;
}

export function buildStorageKey(
  userId: string,
  processId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${userId}/${processId}/${timestamp}-${safeName}`;
}

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { StorageAdapter, UploadParams, UploadResult } from "./types";

export class S3StorageAdapter implements StorageAdapter {
  readonly driver = "s3" as const;
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly defaultExpiresIn: number;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.S3_REGION || "auto";

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error(
        "Variáveis S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY e S3_BUCKET_NAME são obrigatórias para o driver s3."
      );
    }

    this.bucket = bucket;
    this.defaultExpiresIn = Number(process.env.S3_SIGNED_URL_EXPIRES || 900);

    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        ContentLength: params.contentLength,
      })
    );

    return { key: params.key };
  }

  async getSignedUrl(
    key: string,
    expiresInSeconds?: number,
    originalName?: string
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...(originalName ? { ResponseContentDisposition: `attachment; filename="${encodeURIComponent(originalName)}"` } : {})
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds ?? this.defaultExpiresIn,
    });
  }

  async readFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );

    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) {
      throw new Error("Não foi possível ler o arquivo do storage.");
    }

    return {
      buffer: Buffer.from(bytes),
      contentType: response.ContentType || "application/octet-stream",
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}

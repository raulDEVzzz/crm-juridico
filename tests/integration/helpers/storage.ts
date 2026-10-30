import type {
  ReadStreamResult,
  StorageAdapter,
  UploadParams,
  UploadResult,
} from "../../../src/lib/storage/types";

export class FakeStorage implements StorageAdapter {
  readonly driver = "local" as const;
  readonly deleted: string[] = [];
  failDeletes = false;

  async upload(params: UploadParams): Promise<UploadResult> {
    return { key: params.key };
  }

  async getSignedUrl(key: string): Promise<string> {
    return key;
  }

  async readFile(): Promise<{ buffer: Buffer; contentType: string }> {
    throw new Error("FakeStorage.readFile não implementado.");
  }

  async createReadStream(): Promise<ReadStreamResult> {
    throw new Error("FakeStorage.createReadStream não implementado.");
  }

  async delete(key: string): Promise<void> {
    if (this.failDeletes) {
      throw new Error("storage indisponível");
    }
    this.deleted.push(key);
  }
}

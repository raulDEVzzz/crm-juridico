import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { LocalStorageAdapter } from "../src/lib/storage/local";

const root = mkdtempSync(path.join(tmpdir(), "crm-storage-test-"));
const basePath = path.join(root, "uploads");

after(() => {
  rmSync(root, { recursive: true, force: true });
});

function upload(adapter: LocalStorageAdapter, key: string) {
  return adapter.upload({
    key,
    body: Buffer.from("conteudo"),
    contentType: "text/plain",
    contentLength: 8,
  });
}

test("aceita chave dentro do diretório base", async () => {
  const adapter = new LocalStorageAdapter(basePath);

  await upload(adapter, "user/process/file.pdf");
  const file = await adapter.readFile("user/process/file.pdf");

  assert.equal(file.buffer.toString(), "conteudo");
});

test("rejeita traversal, caminho absoluto e diretório irmão com prefixo igual", async () => {
  const adapter = new LocalStorageAdapter(basePath);
  const absoluteKey = path.resolve(root, "fora.txt");

  for (const key of [
    "../x",
    absoluteKey,
    "../uploads-evil/file.pdf",
  ]) {
    await assert.rejects(
      upload(adapter, key),
      /Caminho de arquivo inválido\./,
      `deveria rejeitar a chave ${key}`
    );
  }
});

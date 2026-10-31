import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import { handleDocumentDownload } from "../../src/lib/services/downloads";
import { recordAuditLogSafely } from "../../src/lib/audit";
import {
  deleteClientForUser,
  getClientByIdForUser,
} from "../../src/lib/services/clients";
import {
  deleteDocumentForUser,
  getDocumentForUser,
} from "../../src/lib/services/documents";
import {
  deleteEventForUser,
  getEventByIdForUser,
} from "../../src/lib/services/events";
import {
  deleteProcessForUser,
  getProcessByIdForUser,
} from "../../src/lib/services/processes";
import type { StorageAdapter } from "../../src/lib/storage/types";
import {
  createClient,
  createDocument,
  createEvent,
  createProcess,
  createUser,
  resetTestData,
  testDb,
} from "./helpers/db";

const CLIENT_IP = "203.0.113.7";
const PROXY_IP = "198.51.100.10";

beforeEach(async () => {
  await resetTestData();
});

after(async () => {
  await testDb.$disconnect();
});

function makeStorage(): StorageAdapter {
  return {
    driver: "local",
    upload: async () => ({ key: "key" }),
    getSignedUrl: async () => "signed-url",
    readFile: async () => ({
      buffer: Buffer.from("conteudo"),
      contentType: "application/pdf",
    }),
    createReadStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("conteudo"));
          controller.close();
        },
      }),
      contentType: "application/pdf",
      contentLength: 8,
    }),
    delete: async () => undefined,
  };
}

async function findAudit(entityId: string) {
  return testDb.auditLog.findFirst({
    where: { entityId },
    orderBy: { createdAt: "desc" },
  });
}

test("exclusão de cliente grava auditoria na mesma transação", async () => {
  const user = await createUser();
  const client = await createClient(user.id);

  const result = await deleteClientForUser(testDb, user.id, client.id, {
    ip: CLIENT_IP,
  });

  assert.equal(result.status, "deleted");
  assert.equal(await getClientByIdForUser(testDb, user.id, client.id), null);

  const log = await findAudit(client.id);
  assert.ok(log);
  assert.equal(log.userId, user.id);
  assert.equal(log.action, "DELETE");
  assert.equal(log.entity, "Client");
  assert.equal(log.ip, CLIENT_IP);
});

test("exclusão de processo grava auditoria na mesma transação", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);

  const result = await deleteProcessForUser(testDb, user.id, process.id, {
    ip: CLIENT_IP,
  });

  assert.equal(result.status, "deleted");
  assert.equal(await getProcessByIdForUser(testDb, user.id, process.id), null);

  const log = await findAudit(process.id);
  assert.ok(log);
  assert.equal(log.userId, user.id);
  assert.equal(log.action, "DELETE");
  assert.equal(log.entity, "Process");
  assert.equal(log.ip, CLIENT_IP);
});

test("exclusão de documento grava auditoria na mesma transação", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const document = await createDocument({
    userId: user.id,
    clientId: client.id,
    processId: process.id,
  });

  const result = await deleteDocumentForUser(
    testDb,
    user.id,
    process.id,
    document.id,
    { ip: CLIENT_IP }
  );

  assert.equal(result.status, "deleted");
  assert.equal(await getDocumentForUser(testDb, user.id, document.id), null);

  const log = await findAudit(document.id);
  assert.ok(log);
  assert.equal(log.userId, user.id);
  assert.equal(log.action, "DELETE");
  assert.equal(log.entity, "Document");
  assert.equal(log.ip, CLIENT_IP);
});

test("exclusão de evento grava auditoria na mesma transação", async () => {
  const user = await createUser();
  const event = await createEvent({ userId: user.id });

  const deleted = await deleteEventForUser(testDb, user.id, event.id, {
    ip: CLIENT_IP,
  });

  assert.equal(deleted, true);
  assert.equal(await getEventByIdForUser(testDb, user.id, event.id), null);

  const log = await findAudit(event.id);
  assert.ok(log);
  assert.equal(log.userId, user.id);
  assert.equal(log.action, "DELETE");
  assert.equal(log.entity, "Event");
  assert.equal(log.ip, CLIENT_IP);
});

test("download de documento grava auditoria com IP do header", async () => {
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const document = await createDocument({
    userId: user.id,
    clientId: client.id,
    processId: process.id,
  });

  const response = await handleDocumentDownload(
    new Request(`http://localhost/api/documents/${document.id}/download`, {
      headers: { "x-real-ip": PROXY_IP },
    }),
    document.id,
    user.id,
    {
      getDocument: (userId, documentId) =>
        getDocumentForUser(testDb, userId, documentId),
      getStorage: makeStorage,
      audit: (entry) => recordAuditLogSafely(entry, testDb),
    }
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "conteudo");

  const log = await findAudit(document.id);
  assert.ok(log);
  assert.equal(log.userId, user.id);
  assert.equal(log.action, "DOWNLOAD");
  assert.equal(log.entity, "Document");
  assert.equal(log.ip, PROXY_IP);
});

test("falha ao gravar auditoria de download não derruba o download", async (t) => {
  t.mock.method(console, "error", () => undefined);
  const user = await createUser();
  const client = await createClient(user.id);
  const process = await createProcess(client.id);
  const document = await createDocument({
    userId: user.id,
    clientId: client.id,
    processId: process.id,
  });

  const response = await handleDocumentDownload(
    new Request(`http://localhost/api/documents/${document.id}/download`),
    document.id,
    user.id,
    {
      getDocument: (userId, documentId) =>
        getDocumentForUser(testDb, userId, documentId),
      getStorage: makeStorage,
      audit: async () => {
        throw new Error("auditoria indisponível");
      },
    }
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "conteudo");
});

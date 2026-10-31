import { randomUUID } from "node:crypto";
import path from "node:path";
import { loadEnvFile } from "node:process";

import {
  PrismaClient,
  type EventStatus,
  type EventType,
  type LegalArea,
  type PersonType,
  type ProcessStatus,
} from "@prisma/client";

try {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch {
  // Environment variables may already be exported.
}

const storageDriver = (process.env.STORAGE_DRIVER ?? "local").toLowerCase();

if (storageDriver === "s3") {
  throw new Error(
    "Testes de integração não podem usar o driver S3/R2. Force STORAGE_DRIVER=local e/ou injete um storage fake."
  );
}

const testDatabaseUrl = process.env.DATABASE_URL_TEST;

if (!testDatabaseUrl) {
  throw new Error("DATABASE_URL_TEST não está definida.");
}

if (!testDatabaseUrl.toLowerCase().includes("test")) {
  throw new Error(
    "DATABASE_URL_TEST precisa conter 'test' no nome/host do banco."
  );
}

if (
  process.env.DATABASE_URL &&
  testDatabaseUrl === process.env.DATABASE_URL &&
  process.env.DATABASE_URL_TEST_OVERRIDE !== "1"
) {
  throw new Error(
    "DATABASE_URL_TEST é igual a DATABASE_URL. Testes recusados para não tocar no banco de desenvolvimento."
  );
}

export const testDb = new PrismaClient({
  datasourceUrl: testDatabaseUrl,
});

export async function resetTestData() {
  await testDb.$executeRawUnsafe(
    'TRUNCATE TABLE "audit_logs", "login_attempts", "storage_deletion_jobs", "users" RESTART IDENTITY CASCADE'
  );
}

export async function createUser(overrides: { name?: string } = {}) {
  const suffix = randomUUID();

  return testDb.user.create({
    data: {
      name: overrides.name ?? "Usuário de teste",
      username: `user-${suffix}`,
      email: `user-${suffix}@example.com`,
      passwordHash: "test-hash",
    },
  });
}

export async function createClient(
  userId: string,
  overrides: { name?: string; birthDate?: Date } = {}
) {
  return testDb.client.create({
    data: {
      userId,
      name: overrides.name ?? "Cliente de teste",
      personType: "PF" as PersonType,
      document: randomUUID().replace(/-/g, "").slice(0, 11),
      phone: "11999999999",
      birthDate: overrides.birthDate ?? null,
    },
  });
}

export async function createProcess(
  clientId: string,
  overrides: {
    processNumber?: string;
    court?: string;
    area?: LegalArea;
    status?: ProcessStatus;
  } = {}
) {
  return testDb.process.create({
    data: {
      clientId,
      processNumber: overrides.processNumber ?? `PROC-${randomUUID()}`,
      court: overrides.court ?? "1ª Vara Cível",
      area: overrides.area ?? "CIVEL",
      status: overrides.status ?? "ATIVO",
    },
  });
}

export async function createDocument(input: {
  userId: string;
  clientId?: string | null;
  processId?: string | null;
  fileName?: string;
  fileUrl?: string;
}) {
  return testDb.document.create({
    data: {
      userId: input.userId,
      clientId: input.clientId ?? null,
      processId: input.processId ?? null,
      fileName: input.fileName ?? "documento.pdf",
      fileUrl: input.fileUrl ?? `uploads/test/${randomUUID()}.pdf`,
    },
  });
}

export async function createEvent(input: {
  userId: string;
  processId?: string | null;
  title?: string;
  type?: EventType;
  status?: EventStatus;
}) {
  return testDb.event.create({
    data: {
      userId: input.userId,
      processId: input.processId ?? null,
      title: input.title ?? "Evento de teste",
      type: input.type ?? "AUDIENCIA",
      status: input.status ?? "PENDENTE",
      eventDate: new Date(),
    },
  });
}

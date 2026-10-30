import assert from "node:assert/strict";

import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const TEST_IP = process.env.TEST_IP ?? "198.51.100.77";
const WRONG_PASSWORD = "wrong-password-123";
const username = `auditbypass${Date.now().toString(36)}`;
const userKey = `user:${username}`;
const userIpKey = `user-ip:${username}:${TEST_IP}`;
const ipKey = `ip:${TEST_IP}`;
const forgedIpKeys = Array.from(
  { length: 6 },
  (_, index) => `ip:203.0.113.${index + 1}`
);

const prisma = new PrismaClient();
const cookieJar = new Map();

function captureCookies(response) {
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  for (const rawCookie of setCookies) {
    const [pair] = rawCookie.split(";");
    const separator = pair.indexOf("=");
    if (separator > 0) {
      cookieJar.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  }
}

function cookieHeader() {
  return [...cookieJar.entries()]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function request(path, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("x-real-ip", TEST_IP);
  if (cookieJar.size > 0) headers.set("cookie", cookieHeader());

  const response = await fetch(new URL(path, BASE_URL), {
    ...init,
    headers,
    redirect: "manual",
  });

  captureCookies(response);
  return response;
}

async function getCsrfToken() {
  const response = await request("/api/auth/csrf");
  assert.equal(response.status, 200, "GET /api/auth/csrf deve responder 200");

  const body = await response.json();
  assert.equal(typeof body.csrfToken, "string", "csrfToken ausente");
  return body.csrfToken;
}

async function main() {
  const csrfToken = await getCsrfToken();

  for (let attempt = 1; attempt <= 6; attempt++) {
    const body = new URLSearchParams({
      csrfToken,
      username,
      password: WRONG_PASSWORD,
      callbackUrl: "/dashboard",
      // Campo legado/forjado: não deve influenciar o rate limit.
      clientIp: `203.0.113.${attempt}`,
    });

    const response = await request("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });

    console.log(
      `tentativa ${attempt}: status=${response.status} location=${response.headers.get("location") ?? "-"}`
    );
  }

  const rows = await prisma.loginAttempt.findMany({
    where: { email: { in: [userKey, userIpKey, ipKey, ...forgedIpKeys] } },
  });
  const byKey = new Map(rows.map((row) => [row.email, row]));

  const account = byKey.get(userKey);
  assert.ok(account, "registro do limite global da conta não encontrado");
  assert.ok(
    account.attempts >= 5,
    `conta deveria ter >= 5 tentativas, recebeu ${account.attempts}`
  );
  assert.ok(
    account.blockedUntil && account.blockedUntil.getTime() > Date.now(),
    "conta deveria estar bloqueada"
  );

  const accountIp = byKey.get(userIpKey);
  assert.ok(
    accountIp,
    "registro da chave composta conta+IP não encontrado; o header x-real-ip não foi usado"
  );
  assert.equal(
    accountIp.attempts,
    5,
    `chave composta deveria ter 5 tentativas, recebeu ${accountIp.attempts}`
  );

  const globalIp = byKey.get(ipKey);
  assert.ok(
    globalIp,
    "registro do limite global por IP não encontrado; o header x-real-ip não foi usado"
  );
  assert.equal(
    globalIp.attempts,
    5,
    `chave global de IP deveria ter 5 tentativas, recebeu ${globalIp.attempts}`
  );

  for (const forgedKey of forgedIpKeys) {
    assert.equal(
      byKey.has(forgedKey),
      false,
      `clientIp do corpo criou a chave ${forgedKey}; o corpo ainda influencia o limite`
    );
  }

  console.log(
    "OK: 6 POSTs diretos com clientIp forjado mantiveram o bloqueio global da conta e usaram apenas o header x-real-ip."
  );
}

main()
  .catch((error) => {
    console.error("FALHA:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.loginAttempt.deleteMany({
      where: { email: { in: [userKey, userIpKey, ipKey, ...forgedIpKeys] } },
    });
    await prisma.$disconnect();
  });

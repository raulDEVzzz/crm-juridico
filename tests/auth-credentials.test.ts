import assert from "node:assert/strict";
import test from "node:test";

import {
  UNKNOWN_CLIENT_IP,
  authorizeCredentials,
  authorizeCredentialsFailClosed,
  buildRateLimitKeys,
  resolveClientIp,
  type CredentialsAuthorizeDeps,
} from "../src/lib/auth/credentials";
import { RateLimitUnavailableError } from "../src/lib/rate-limit";

const validUser = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  passwordHash: "$2a$12$fake-hash",
};

function makeDeps(overrides: Partial<CredentialsAuthorizeDeps> = {}) {
  const blockedKeys: string[] = [];
  const attempts: Array<{ key: string; maxAttempts: number }> = [];
  const cleared: string[] = [];
  let compareCalls = 0;

  const deps: CredentialsAuthorizeDeps = {
    findUser: async () => validUser,
    comparePassword: async () => {
      compareCalls++;
      return true;
    },
    isKeyBlocked: async (key) => {
      blockedKeys.push(key);
      return false;
    },
    recordFailedAttempt: async (key, maxAttempts) => {
      attempts.push({ key, maxAttempts });
    },
    clearAttempts: async (key) => {
      cleared.push(key);
    },
    ...overrides,
  };

  return {
    deps,
    blockedKeys,
    attempts,
    cleared,
    get compareCalls() {
      return compareCalls;
    },
  };
}

test("resolveClientIp usa x-real-ip válido", () => {
  assert.equal(
    resolveClientIp(new Headers({ "x-real-ip": "203.0.113.7" })),
    "203.0.113.7"
  );
});

test("resolveClientIp usa o primeiro IP de x-forwarded-for", () => {
  assert.equal(
    resolveClientIp(
      new Headers({ "x-forwarded-for": "198.51.100.10, 10.0.0.1" })
    ),
    "198.51.100.10"
  );
});

test("resolveClientIp rejeita IP inválido e usa chave fixa segura", () => {
  assert.equal(
    resolveClientIp(new Headers({ "x-real-ip": "not-an-ip" })),
    UNKNOWN_CLIENT_IP
  );
  assert.equal(
    resolveClientIp(
      new Headers({ "x-forwarded-for": "999.999.999.999, 10.0.0.1" })
    ),
    UNKNOWN_CLIENT_IP
  );
});

test("resolveClientIp rejeita header excessivamente longo", () => {
  assert.equal(
    resolveClientIp(new Headers({ "x-real-ip": "1".repeat(2048) })),
    UNKNOWN_CLIENT_IP
  );
});

test("buildRateLimitKeys mantém limites global da conta, composto e global por IP", () => {
  assert.deepEqual(buildRateLimitKeys("alice", "203.0.113.7"), {
    userKey: "user:alice",
    userIpKey: "user-ip:alice:203.0.113.7",
    ipKey: "ip:203.0.113.7",
  });
});

test("buildRateLimitKeys nunca desativa o limite com IP inválido", () => {
  assert.deepEqual(buildRateLimitKeys("alice", "not-an-ip"), {
    userKey: "user:alice",
    userIpKey: `user-ip:alice:${UNKNOWN_CLIENT_IP}`,
    ipKey: `ip:${UNKNOWN_CLIENT_IP}`,
  });
});

test("authorizeCredentials ignora clientIp do corpo e usa somente o header", async () => {
  const harness = makeDeps();

  const result = await authorizeCredentials(
    {
      username: "alice",
      password: "secret123",
      clientIp: "198.51.100.99",
    },
    new Headers({ "x-real-ip": "203.0.113.7" }),
    harness.deps
  );

  assert.equal(result?.id, "user-1");
  assert.deepEqual(harness.blockedKeys, [
    "user:alice",
    "user-ip:alice:203.0.113.7",
    "ip:203.0.113.7",
  ]);
  assert.deepEqual(harness.cleared, [
    "user:alice",
    "user-ip:alice:203.0.113.7",
  ]);
});

test("authorizeCredentials usa chave fixa quando o header não tem IP válido", async () => {
  const harness = makeDeps();

  await authorizeCredentials(
    { username: "alice", password: "secret123", clientIp: "198.51.100.99" },
    new Headers({ "x-real-ip": "invalid" }),
    harness.deps
  );

  assert.deepEqual(harness.blockedKeys, [
    "user:alice",
    `user-ip:alice:${UNKNOWN_CLIENT_IP}`,
    `ip:${UNKNOWN_CLIENT_IP}`,
  ]);
});

test("authorizeCredentials falha fechado quando o rate limit lança erro", async () => {
  const harness = makeDeps({
    isKeyBlocked: async () => {
      throw new Error("rate limit indisponível");
    },
  });

  await assert.rejects(
    authorizeCredentials(
      { username: "alice", password: "secret123" },
      new Headers({ "x-real-ip": "203.0.113.7" }),
      harness.deps
    ),
    /rate limit indisponível/
  );
  assert.equal(harness.compareCalls, 0);
});

test("authorizeCredentialsFailClosed converte indisponibilidade do rate limit em negação controlada", async () => {
  const harness = makeDeps({
    isKeyBlocked: async () => {
      throw new RateLimitUnavailableError("rate limit indisponível");
    },
  });

  const result = await authorizeCredentialsFailClosed(
    { username: "alice", password: "secret123" },
    new Headers({ "x-real-ip": "203.0.113.7" }),
    harness.deps
  );

  assert.equal(result, null);
  assert.equal(harness.compareCalls, 0);
});

test("authorizeCredentialsFailClosed propaga erros que não são de rate limit", async () => {
  const harness = makeDeps({
    isKeyBlocked: async () => {
      throw new Error("erro inesperado");
    },
  });

  await assert.rejects(
    authorizeCredentialsFailClosed(
      { username: "alice", password: "secret123" },
      new Headers({ "x-real-ip": "203.0.113.7" }),
      harness.deps
    ),
    /erro inesperado/
  );
});

test("authorizeCredentials não executa bcrypt quando a conta está bloqueada", async () => {
  const harness = makeDeps({
    isKeyBlocked: async (key) => key === "user:alice",
  });

  const result = await authorizeCredentials(
    { username: "alice", password: "secret123" },
    new Headers({ "x-real-ip": "203.0.113.7" }),
    harness.deps
  );

  assert.equal(result, null);
  assert.equal(harness.compareCalls, 0);
});

test("authorizeCredentials compara hash fictício para usuário inexistente e registra as três chaves", async () => {
  let comparedHash = "";
  const harness = makeDeps({
    findUser: async () => null,
    comparePassword: async (_password, hash) => {
      comparedHash = hash;
      return false;
    },
  });

  const result = await authorizeCredentials(
    { username: "alice", password: "secret123" },
    new Headers({ "x-real-ip": "203.0.113.7" }),
    harness.deps
  );

  assert.equal(result, null);
  assert.match(comparedHash, /^\$2[aby]\$12\$/);
  assert.deepEqual(harness.attempts, [
    { key: "user:alice", maxAttempts: 5 },
    { key: "user-ip:alice:203.0.113.7", maxAttempts: 20 },
    { key: "ip:203.0.113.7", maxAttempts: 100 },
  ]);
});

test("authorizeCredentials falha fechado quando o registro da tentativa lança erro", async () => {
  const harness = makeDeps({
    comparePassword: async () => false,
    recordFailedAttempt: async () => {
      throw new Error("registro indisponível");
    },
  });

  await assert.rejects(
    authorizeCredentials(
      { username: "alice", password: "secret123" },
      new Headers({ "x-real-ip": "203.0.113.7" }),
      harness.deps
    ),
    /registro indisponível/
  );
});

test("authorizeCredentials registra login com o IP do header e ignora o corpo", async () => {
  const entries: Array<{ userId: string; ip: string }> = [];
  const harness = makeDeps({
    recordLoginAudit: async (entry) => {
      entries.push(entry);
    },
  });

  const result = await authorizeCredentials(
    {
      username: "alice",
      password: "secret123",
      clientIp: "198.51.100.99",
    },
    new Headers({ "x-real-ip": "203.0.113.7" }),
    harness.deps
  );

  assert.equal(result?.id, "user-1");
  assert.deepEqual(entries, [{ userId: "user-1", ip: "203.0.113.7" }]);
});

test("falha na auditoria de login não impede o login", async (t) => {
  t.mock.method(console, "error", () => undefined);
  const harness = makeDeps({
    recordLoginAudit: async () => {
      throw new Error("auditoria indisponível");
    },
  });

  const result = await authorizeCredentials(
    { username: "alice", password: "secret123" },
    new Headers({ "x-real-ip": "203.0.113.7" }),
    harness.deps
  );

  assert.equal(result?.id, "user-1");
});

test("authorizeCredentials não registra auditoria quando a senha é inválida", async () => {
  const entries: Array<{ userId: string; ip: string }> = [];
  const harness = makeDeps({
    comparePassword: async () => false,
    recordLoginAudit: async (entry) => {
      entries.push(entry);
    },
  });

  const result = await authorizeCredentials(
    { username: "alice", password: "secret123" },
    new Headers({ "x-real-ip": "203.0.113.7" }),
    harness.deps
  );

  assert.equal(result, null);
  assert.deepEqual(entries, []);
});

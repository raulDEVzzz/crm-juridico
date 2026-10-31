import assert from "node:assert/strict";
import test from "node:test";

import type { JWT } from "next-auth/jwt";

import { authConfig } from "../src/auth.config";
import {
  SESSION_DB_ERROR_GRACE_MS,
  SESSION_MAX_AGE_SECONDS,
  SESSION_REVALIDATE_INTERVAL_MS,
  SESSION_UPDATE_AGE_SECONDS,
  createRevalidatingJwtCallback,
  revalidateSessionToken,
} from "../src/lib/auth/session";

const NOW = Date.UTC(2026, 9, 30, 15, 0, 0);
const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function makeLookup(exists: boolean | (() => Promise<boolean>) = true) {
  const calls: string[] = [];
  return {
    calls,
    deps: {
      userExists: async (userId: string) => {
        calls.push(userId);
        if (typeof exists === "function") {
          return exists();
        }
        return exists;
      },
    },
  };
}

function makeToken(overrides: Partial<JWT> = {}): JWT {
  return { id: "user-1", ...overrides };
}

test("configura sessão JWT para expirar em 24h e renovar a cada 1h", () => {
  assert.equal(SESSION_MAX_AGE_SECONDS, 60 * 60 * 24);
  assert.equal(SESSION_UPDATE_AGE_SECONDS, 60 * 60);
  assert.equal(SESSION_REVALIDATE_INTERVAL_MS, FIVE_MINUTES);
  assert.equal(SESSION_DB_ERROR_GRACE_MS, ONE_HOUR);
  assert.equal(authConfig.session.maxAge, SESSION_MAX_AGE_SECONDS);
  assert.equal(authConfig.session.updateAge, SESSION_UPDATE_AGE_SECONDS);
});

test("token antigo sem userValidatedAt consulta o banco no primeiro acesso", async () => {
  const lookup = makeLookup(true);
  const token = makeToken();

  const isValid = await revalidateSessionToken(token, lookup.deps, NOW);

  assert.equal(isValid, true);
  assert.deepEqual(lookup.calls, ["user-1"]);
  assert.equal(token.userValidatedAt, NOW);
});

test("token validado há menos de 5 minutos não consulta o banco", async () => {
  const lookup = makeLookup(true);
  const token = makeToken({ userValidatedAt: NOW - FIVE_MINUTES + 1 });

  const isValid = await revalidateSessionToken(token, lookup.deps, NOW);

  assert.equal(isValid, true);
  assert.deepEqual(lookup.calls, []);
  assert.equal(token.userValidatedAt, NOW - FIVE_MINUTES + 1);
});

test("token validado há 5 minutos consulta o banco novamente", async () => {
  const lookup = makeLookup(true);
  const token = makeToken({ userValidatedAt: NOW - FIVE_MINUTES });

  const isValid = await revalidateSessionToken(token, lookup.deps, NOW);

  assert.equal(isValid, true);
  assert.deepEqual(lookup.calls, ["user-1"]);
  assert.equal(token.userValidatedAt, NOW);
});

test("usuário excluído invalida a sessão imediatamente", async () => {
  const lookup = makeLookup(false);
  const token = makeToken({ userValidatedAt: NOW - FIVE_MINUTES - 1 });

  const isValid = await revalidateSessionToken(token, lookup.deps, NOW);

  assert.equal(isValid, false);
  assert.deepEqual(lookup.calls, ["user-1"]);
  assert.equal(token.userValidatedAt, NOW - FIVE_MINUTES - 1);
});

test("erro de banco mantém a sessão se a última validação foi há menos de 1h", async () => {
  const lookup = makeLookup(async () => {
    throw new Error("banco indisponível");
  });
  const lastValidatedAt = NOW - ONE_HOUR + 1;
  const token = makeToken({ userValidatedAt: lastValidatedAt });

  const isValid = await revalidateSessionToken(token, lookup.deps, NOW);

  assert.equal(isValid, true);
  assert.deepEqual(lookup.calls, ["user-1"]);
  assert.equal(token.userValidatedAt, lastValidatedAt);
});

test("erro de banco invalida a sessão após 1h sem validação", async () => {
  const lookup = makeLookup(async () => {
    throw new Error("banco indisponível");
  });
  const token = makeToken({ userValidatedAt: NOW - ONE_HOUR });

  const isValid = await revalidateSessionToken(token, lookup.deps, NOW);

  assert.equal(isValid, false);
});

test("erro de banco sem validação anterior invalida a sessão", async () => {
  const lookup = makeLookup(async () => {
    throw new Error("banco indisponível");
  });
  const token = makeToken();

  const isValid = await revalidateSessionToken(token, lookup.deps, NOW);

  assert.equal(isValid, false);
  assert.equal(token.userValidatedAt, undefined);
});

test("token sem id é inválido sem consultar o banco", async () => {
  const lookup = makeLookup(true);
  const token: JWT = { id: "" };

  const isValid = await revalidateSessionToken(token, lookup.deps, NOW);

  assert.equal(isValid, false);
  assert.deepEqual(lookup.calls, []);
});

test("callback jwt grava o id no login e valida a sessão", async () => {
  const lookup = makeLookup(true);
  const callback = createRevalidatingJwtCallback(lookup.deps, () => NOW);
  const token: JWT = { id: "" };

  const result = await callback({
    token,
    user: { id: "user-1", name: "Alice", email: "alice@example.com" },
  });

  assert.equal(result, token);
  assert.equal(result?.id, "user-1");
  assert.equal(result?.userValidatedAt, NOW);
  assert.deepEqual(lookup.calls, ["user-1"]);
});

test("callback jwt retorna null quando o usuário foi excluído", async () => {
  const lookup = makeLookup(false);
  const callback = createRevalidatingJwtCallback(lookup.deps, () => NOW);

  const result = await callback({
    token: makeToken({ userValidatedAt: NOW - FIVE_MINUTES - 1 }),
    user: null,
  });

  assert.equal(result, null);
});

test("callback jwt mantém o token quando o banco falha dentro da tolerância", async () => {
  const lookup = makeLookup(async () => {
    throw new Error("banco indisponível");
  });
  const callback = createRevalidatingJwtCallback(lookup.deps, () => NOW);
  const token = makeToken({ userValidatedAt: NOW - 30 * 60 * 1000 });

  const result = await callback({ token, user: null });

  assert.equal(result, token);
});

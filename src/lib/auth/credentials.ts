import { isIP } from "node:net";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  ACCOUNT_IP_MAX_ATTEMPTS,
  ACCOUNT_MAX_ATTEMPTS,
  IP_MAX_ATTEMPTS,
  RateLimitUnavailableError,
  clearAttempts,
  isKeyBlocked,
  recordFailedAttempt,
} from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

export const UNKNOWN_CLIENT_IP = "unknown";

const MAX_IP_HEADER_LENGTH = 1024;
const MAX_IP_LENGTH = 45;
const DUMMY_HASH =
  "$2a$12$e8k5sR7y4fO6N5k9h7rQce2eHk8U1x4E9m0F6g7H8i9J0k1L2m3N4";

export interface AuthorizedUser {
  id: string;
  name: string;
  email: string;
}

export interface CredentialsAuthorizeDeps {
  findUser(username: string): Promise<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  } | null>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  isKeyBlocked(key: string): Promise<boolean>;
  recordFailedAttempt(key: string, maxAttempts: number): Promise<unknown>;
  clearAttempts(key: string): Promise<void>;
}

const defaultDeps: CredentialsAuthorizeDeps = {
  findUser: (username) => prisma.user.findUnique({ where: { username } }),
  comparePassword: (password, hash) => bcrypt.compare(password, hash),
  isKeyBlocked,
  recordFailedAttempt,
  clearAttempts,
};

function parseIpCandidate(value: string | null): string | null {
  if (!value || value.length > MAX_IP_HEADER_LENGTH) return null;

  const first = value.split(",")[0]?.trim();
  if (!first || first.length > MAX_IP_LENGTH) return null;

  return isIP(first) ? first : null;
}

/**
 * Resolve o IP somente a partir de headers do servidor. O corpo da requisição
 * nunca é consultado. Header inválido cai em uma chave fixa, mantendo o limite.
 */
export function resolveClientIp(headers: Pick<Headers, "get">): string {
  return (
    parseIpCandidate(headers.get("x-real-ip")) ??
    parseIpCandidate(headers.get("x-forwarded-for")) ??
    UNKNOWN_CLIENT_IP
  );
}

/**
 * Mantém um limite global por conta, um limite composto por conta + IP e um
 * limite global por IP. O limite por IP usa um teto mais alto para reduzir
 * bloqueios colaterais em redes NAT, mas ainda contém bcrypt com usuários
 * aleatórios.
 */
export function buildRateLimitKeys(
  username: string,
  clientIp: string
): { userKey: string; userIpKey: string; ipKey: string } {
  const safeIp = isIP(clientIp) ? clientIp : UNKNOWN_CLIENT_IP;

  return {
    userKey: `user:${username}`,
    userIpKey: `user-ip:${username}:${safeIp}`,
    ipKey: `ip:${safeIp}`,
  };
}

export async function authorizeCredentials(
  credentials: unknown,
  headers: Pick<Headers, "get">,
  deps: CredentialsAuthorizeDeps = defaultDeps
): Promise<AuthorizedUser | null> {
  const parsed = loginSchema.safeParse(credentials);

  if (!parsed.success) {
    return null;
  }

  const username = parsed.data.username;
  const clientIp = resolveClientIp(headers);
  const { userKey, userIpKey, ipKey } = buildRateLimitKeys(username, clientIp);

  // A verificação vem antes do bcrypt. Erros de banco sobem e falham fechado.
  const [isUserBlocked, isUserIpBlocked, isIpBlocked] = await Promise.all([
    deps.isKeyBlocked(userKey),
    deps.isKeyBlocked(userIpKey),
    deps.isKeyBlocked(ipKey),
  ]);

  if (isUserBlocked || isUserIpBlocked || isIpBlocked) {
    return null;
  }

  const user = await deps.findUser(username);
  const isPasswordValid = await deps.comparePassword(
    parsed.data.password,
    user ? user.passwordHash : DUMMY_HASH
  );

  if (!user || !isPasswordValid) {
    await Promise.all([
      deps.recordFailedAttempt(userKey, ACCOUNT_MAX_ATTEMPTS),
      deps.recordFailedAttempt(userIpKey, ACCOUNT_IP_MAX_ATTEMPTS),
      deps.recordFailedAttempt(ipKey, IP_MAX_ATTEMPTS),
    ]);
    return null;
  }

  // O contador global por IP não é limpo no sucesso: ele representa falhas de
  // toda a rede e não deve ser zerado por um login válido.
  await Promise.all([
    deps.clearAttempts(userKey),
    deps.clearAttempts(userIpKey),
  ]);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Borda usada pelo Auth.js: converte indisponibilidade do rate limit em
 * negação controlada (credenciais inválidas), mantendo o login fechado sem
 * expor a página de erro de configuração. Outros erros continuam propagando.
 */
export async function authorizeCredentialsFailClosed(
  credentials: unknown,
  headers: Pick<Headers, "get">,
  deps: CredentialsAuthorizeDeps = defaultDeps
): Promise<AuthorizedUser | null> {
  try {
    return await authorizeCredentials(credentials, headers, deps);
  } catch (error) {
    if (error instanceof RateLimitUnavailableError) {
      return null;
    }
    throw error;
  }
}

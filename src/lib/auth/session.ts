import type { JWT } from "next-auth/jwt";

/** Sessão JWT expira em 24h; cada acesso renova o cookie. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
/**
 * Intervalo mínimo para regravar a sessão. Na estratégia JWT o Auth.js renova
 * o cookie a cada acesso; o valor mantém a configuração explícita e alinhada
 * com a política de sessão curta.
 */
export const SESSION_UPDATE_AGE_SECONDS = 60 * 60;
/** Intervalo mínimo entre consultas ao banco para revalidar o usuário. */
export const SESSION_REVALIDATE_INTERVAL_MS = 5 * 60 * 1000;
/** Tolerância de indisponibilidade do banco antes de invalidar a sessão. */
export const SESSION_DB_ERROR_GRACE_MS = 60 * 60 * 1000;

export interface SessionRevalidationDeps {
  userExists(userId: string): Promise<boolean>;
}

/**
 * Revalida no máximo a cada 5 minutos. Token sem `userValidatedAt` (emitido
 * antes da revalidação existir) passa pela consulta no primeiro acesso.
 *
 * Em erro de banco mantém a sessão somente se a última validação foi há menos
 * de 1h; usuário inexistente invalida na hora. O token é atualizado in place.
 */
export async function revalidateSessionToken(
  token: JWT,
  deps: SessionRevalidationDeps,
  now: number = Date.now()
): Promise<boolean> {
  const userId = token.id;

  if (typeof userId !== "string" || userId.length === 0) {
    return false;
  }

  const lastValidatedAt =
    typeof token.userValidatedAt === "number" &&
    Number.isFinite(token.userValidatedAt)
      ? token.userValidatedAt
      : null;

  if (
    lastValidatedAt !== null &&
    now - lastValidatedAt < SESSION_REVALIDATE_INTERVAL_MS
  ) {
    return true;
  }

  try {
    const exists = await deps.userExists(userId);

    if (!exists) {
      return false;
    }

    token.userValidatedAt = now;
    return true;
  } catch {
    return (
      lastValidatedAt !== null &&
      now - lastValidatedAt < SESSION_DB_ERROR_GRACE_MS
    );
  }
}

export function createRevalidatingJwtCallback(
  deps: SessionRevalidationDeps,
  now: () => number = Date.now
) {
  return async ({
    token,
    user,
  }: {
    token: JWT;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
    } | null;
  }): Promise<JWT | null> => {
    if (user?.id) {
      token.id = user.id;
    }

    const isValid = await revalidateSessionToken(token, deps, now());

    // Retornar null faz o Auth.js limpar o cookie de sessão.
    return isValid ? token : null;
  };
}

import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

export const ACCOUNT_MAX_ATTEMPTS = 5;
export const IP_MAX_ATTEMPTS = 20;
export const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Verifica atomicamente se uma chave de rate limit está atualmente bloqueada.
 */
export async function isKeyBlocked(key: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ blocked_until: Date }>>`
      SELECT "blocked_until"
      FROM "login_attempts"
      WHERE "email" = ${key}
        AND "blocked_until" IS NOT NULL
        AND "blocked_until" > NOW()
      LIMIT 1;
    `;
    return result.length > 0;
  } catch (error) {
    console.error("Erro ao verificar bloqueio de rate limit:", error);
    return false;
  }
}

/**
 * Registra uma tentativa falha de forma atômica no PostgreSQL (sem race condition/TOCTOU).
 * Reseta a janela se expirada e aplica o bloqueio se atingir o limite.
 */
export async function recordFailedAttempt(
  key: string,
  maxAttempts: number = ACCOUNT_MAX_ATTEMPTS,
  windowMs: number = WINDOW_MS
): Promise<{ blocked: boolean; attempts: number; blockedUntil: Date | null }> {
  const now = new Date();
  const windowThreshold = new Date(now.getTime() - windowMs);
  const blockedUntil = new Date(now.getTime() + windowMs);
  const id = randomUUID();

  try {
    const result = await prisma.$queryRaw<
      Array<{ attempts: number; blocked_until: Date | null }>
    >`
      INSERT INTO "login_attempts" ("id", "email", "attempts", "window_started_at", "blocked_until", "updated_at")
      VALUES (${id}, ${key}, 1, ${now}, NULL, ${now})
      ON CONFLICT ("email") DO UPDATE
      SET 
        attempts = CASE 
          WHEN "login_attempts"."window_started_at" < ${windowThreshold} THEN 1 
          ELSE "login_attempts"."attempts" + 1 
        END,
        window_started_at = CASE 
          WHEN "login_attempts"."window_started_at" < ${windowThreshold} THEN ${now} 
          ELSE "login_attempts"."window_started_at" 
        END,
        blocked_until = CASE 
          WHEN (CASE WHEN "login_attempts"."window_started_at" < ${windowThreshold} THEN 1 ELSE "login_attempts"."attempts" + 1 END) >= ${maxAttempts} 
          THEN ${blockedUntil} 
          ELSE NULL 
        END,
        updated_at = ${now}
      RETURNING "attempts", "blocked_until";
    `;

    const row = result[0];
    const attempts = row?.attempts ?? 1;
    const isBlocked = attempts >= maxAttempts;

    return {
      blocked: isBlocked,
      attempts,
      blockedUntil: row?.blocked_until ?? null,
    };
  } catch (error) {
    console.error("Erro ao registrar tentativa falha de login:", error);
    return { blocked: false, attempts: 1, blockedUntil: null };
  }
}

/**
 * Remove o registro de tentativas após login bem-sucedido.
 */
export async function clearAttempts(key: string): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM "login_attempts" WHERE "email" = ${key};
    `;
  } catch (error) {
    console.error("Erro ao limpar tentativas de login:", error);
  }
}

/**
 * Purga tentativas antigas já desbloqueadas para evitar crescimento infinito da tabela.
 */
export async function purgeExpiredAttempts(retentionHours = 24): Promise<number> {
  const cutoff = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
  try {
    const deleted = await prisma.$executeRaw`
      DELETE FROM "login_attempts" 
      WHERE "updated_at" < ${cutoff} 
        AND ("blocked_until" IS NULL OR "blocked_until" < NOW());
    `;
    return Number(deleted);
  } catch (error) {
    console.error("Erro ao purgar tentativas de login expiradas:", error);
    return 0;
  }
}

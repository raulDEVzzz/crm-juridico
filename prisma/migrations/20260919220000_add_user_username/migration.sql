-- Adds a human-friendly login identifier while preserving existing accounts.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Computa username determinístico e compatível com as regras de validação:
-- 1. Extrai a parte local do e-mail em minúsculas
-- 2. Remove caracteres especiais fora do conjunto [a-z0-9._-]
-- 3. Garante caractere inicial alfanumérico e comprimento mínimo de 3 caracteres
-- 4. Trunca para garantir limite máximo de 32 caracteres
-- 5. Numera eventuais colisões de prefixo de forma única
WITH sanitized AS (
  SELECT
    id,
    COALESCE(
      NULLIF(
        REGEXP_REPLACE(
          LOWER(SPLIT_PART("email", '@', 1)),
          '[^a-z0-9._-]',
          '',
          'g'
        ),
        ''
      ),
      'user'
    ) AS clean_base
  FROM "users"
  WHERE "username" IS NULL
),
normalized AS (
  SELECT
    id,
    CASE
      WHEN clean_base ~ '^[^a-z0-9]' THEN 'u' || clean_base
      WHEN LENGTH(clean_base) < 3 THEN clean_base || '_user'
      ELSE clean_base
    END AS base_candidate
  FROM sanitized
),
numbered AS (
  SELECT
    id,
    SUBSTRING(base_candidate FROM 1 FOR 25) AS truncated_base,
    ROW_NUMBER() OVER (
      PARTITION BY SUBSTRING(base_candidate FROM 1 FOR 25)
      ORDER BY id
    ) AS seq
  FROM normalized
)
UPDATE "users" u
SET "username" = CASE
  WHEN n.seq = 1 THEN n.truncated_base
  ELSE n.truncated_base || '_' || n.seq
END
FROM numbered n
WHERE u.id = n.id AND u."username" IS NULL;

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");


-- Preserve financial precision and support resilient cleanup/rate limiting.
ALTER TABLE "processes"
  ALTER COLUMN "value" TYPE DECIMAL(14, 2) USING "value"::DECIMAL(14, 2);

DROP INDEX IF EXISTS "events_user_id_idx";
CREATE INDEX "events_user_id_event_date_idx" ON "events"("user_id", "event_date");

CREATE TABLE "storage_deletion_jobs" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storage_deletion_jobs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "storage_deletion_jobs_key_key" ON "storage_deletion_jobs"("key");
CREATE INDEX "storage_deletion_jobs_processed_at_created_at_idx" ON "storage_deletion_jobs"("processed_at", "created_at");

CREATE TABLE "login_attempts" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "window_started_at" TIMESTAMP(3) NOT NULL,
  "blocked_until" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "login_attempts_email_key" ON "login_attempts"("email");
CREATE INDEX "login_attempts_blocked_until_idx" ON "login_attempts"("blocked_until");

-- Registra a última tentativa para calcular a retenção do dead-letter.
ALTER TABLE "storage_deletion_jobs"
  ADD COLUMN "last_attempt_at" TIMESTAMP(3);

CREATE INDEX "storage_deletion_jobs_processed_at_attempts_last_attempt_at_idx"
  ON "storage_deletion_jobs"("processed_at", "attempts", "last_attempt_at");

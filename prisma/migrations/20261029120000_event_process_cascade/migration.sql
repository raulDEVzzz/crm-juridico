-- Eventos vinculados a um processo devem ser removidos junto com o processo.
-- Eventos avulsos (process_id NULL) permanecem intactos.
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_process_id_fkey";
ALTER TABLE "events"
  ADD CONSTRAINT "events_process_id_fkey"
  FOREIGN KEY ("process_id") REFERENCES "processes"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

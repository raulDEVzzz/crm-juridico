/*
  Warnings:

  - A unique constraint covering the columns `[client_id,process_number]` on the table `processes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "processes_process_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "processes_client_id_process_number_key" ON "processes"("client_id", "process_number");

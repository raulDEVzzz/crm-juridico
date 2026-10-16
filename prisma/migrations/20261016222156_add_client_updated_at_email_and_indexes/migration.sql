-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "email" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "clients_user_id_name_idx" ON "clients"("user_id", "name");

-- CreateIndex
CREATE INDEX "processes_area_idx" ON "processes"("area");

-- CreateIndex
CREATE INDEX "processes_client_id_area_idx" ON "processes"("client_id", "area");

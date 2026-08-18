-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('ATIVO', 'CONCLUIDO', 'SUSPENSO');
CREATE TYPE "LegalArea" AS ENUM ('CIVEL', 'CRIMINAL', 'TRABALHISTA', 'FAMILIA', 'TRIBUTARIO', 'CONSUMIDOR', 'OUTROS');
CREATE TYPE "EventType" AS ENUM ('AUDIENCIA', 'PRAZO', 'REUNIAO');
CREATE TYPE "EventStatus" AS ENUM ('PENDENTE', 'CONCLUIDO');

-- CreateTable
CREATE TABLE "processes" (
    "id" TEXT NOT NULL,
    "process_number" TEXT NOT NULL,
    "court" TEXT NOT NULL,
    "area" "LegalArea" NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'ATIVO',
    "value" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "client_id" TEXT NOT NULL,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_timeline" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "process_id" TEXT NOT NULL,

    CONSTRAINT "process_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "category" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT,
    "process_id" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "type" "EventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDENTE',
    "user_id" TEXT NOT NULL,
    "process_id" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processes_process_number_key" ON "processes"("process_number");
CREATE INDEX "processes_client_id_idx" ON "processes"("client_id");
CREATE INDEX "processes_status_idx" ON "processes"("status");
CREATE INDEX "process_timeline_process_id_idx" ON "process_timeline"("process_id");
CREATE INDEX "process_timeline_date_idx" ON "process_timeline"("date");
CREATE INDEX "documents_user_id_idx" ON "documents"("user_id");
CREATE INDEX "documents_client_id_idx" ON "documents"("client_id");
CREATE INDEX "documents_process_id_idx" ON "documents"("process_id");
CREATE INDEX "events_user_id_idx" ON "events"("user_id");
CREATE INDEX "events_process_id_idx" ON "events"("process_id");
CREATE INDEX "events_event_date_idx" ON "events"("event_date");
CREATE INDEX "events_status_idx" ON "events"("status");

-- AddForeignKey
ALTER TABLE "processes" ADD CONSTRAINT "processes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "process_timeline" ADD CONSTRAINT "process_timeline_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Edit, Trash2 } from "lucide-react";
import type { Client, Document, Process, ProcessTimeline } from "@prisma/client";

import { deleteProcess } from "@/actions/processes";
import { DocumentList } from "@/components/processes/document-list";
import { TimelineList } from "@/components/processes/timeline-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LEGAL_AREA_LABELS,
  PROCESS_STATUS_LABELS,
} from "@/lib/validations/process";

type ProcessDetail = Omit<Process, "value"> & { value: number | null;
  client: Client;
  timeline: ProcessTimeline[];
  documents: Document[];
};

interface ProcessDetailTabsProps {
  process: ProcessDetail;
}

const statusVariant: Record<
  Process["status"],
  "default" | "secondary" | "success" | "warning"
> = {
  ATIVO: "success",
  CONCLUIDO: "secondary",
  SUSPENSO: "warning",
};

export function ProcessDetailTabs({ process }: ProcessDetailTabsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Deseja excluir o processo ${process.processNumber}?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteProcess(process.id);
      router.push("/processes");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {process.processNumber}
            </h1>
            <Badge variant={statusVariant[process.status]}>
              {PROCESS_STATUS_LABELS[process.status]}
            </Badge>
            <Badge variant="outline">{LEGAL_AREA_LABELS[process.area]}</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Cliente: {process.client.name} · {process.court}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/processes/${process.id}/edit`}>
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="timeline">
            Andamentos ({process.timeline.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documentos ({process.documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Informações do processo</CardTitle>
              <CardDescription>Dados cadastrais e observações.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Cliente" value={process.client.name} />
              <DetailItem label="Vara / Tribunal" value={process.court} />
              <DetailItem label="Área" value={LEGAL_AREA_LABELS[process.area]} />
              <DetailItem
                label="Status"
                value={PROCESS_STATUS_LABELS[process.status]}
              />
              <DetailItem
                label="Valor da causa"
                value={
                  process.value
                    ? process.value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "—"
                }
              />
              <DetailItem
                label="Cadastrado em"
                value={process.createdAt.toLocaleDateString("pt-BR")}
              />
              <DetailItem
                label="Atualizado em"
                value={process.updatedAt.toLocaleDateString("pt-BR")}
              />
              {process.notes && (
                <div className="sm:col-span-2">
                  <DetailItem label="Observações" value={process.notes} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineList processId={process.id} entries={process.timeline} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentList
            processId={process.id}
            documents={process.documents}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

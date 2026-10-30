"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, Gavel, Search, Trash2 } from "lucide-react";
import type { Client, Process } from "@prisma/client";

import { deleteProcess } from "@/actions/processes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { formatTimestampBR } from "@/lib/dates";
import {
  LEGAL_AREA_LABELS,
  PROCESS_STATUS_LABELS,
} from "@/lib/validations/process";

type ProcessWithClient = Omit<Process, "value"> & { value: number | null; client: Client };

interface ProcessTableProps {
  processes: ProcessWithClient[];
  /** Termo aplicado no servidor; usado apenas para o estado vazio. */
  search?: string;
}

const statusVariant: Record<
  Process["status"],
  "default" | "secondary" | "success" | "warning"
> = {
  ATIVO: "success",
  CONCLUIDO: "secondary",
  SUSPENSO: "warning",
};

export function ProcessTable({ processes, search = "" }: ProcessTableProps) {
  const [isPending, startTransition] = useTransition();
  const [processToDelete, setProcessToDelete] = useState<{ id: string; processNumber: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleConfirmDelete() {
    if (!processToDelete) return;

    startTransition(async () => {
      const result = await deleteProcess(processToDelete.id);

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setDeleteError(null);
      setProcessToDelete(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* A busca é enviada ao servidor; o cursor é descartado ao filtrar. */}
      <form action="/processes" method="get" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={search}
            placeholder="Buscar por número CNJ, cliente ou vara..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {processes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Gavel className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">
                {search ? "Nenhum processo encontrado" : "Nenhum processo cadastrado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Tente outro termo de busca."
                  : "Cadastre o primeiro processo do escritório."}
              </p>
            </div>
            {!search && (
              <Button asChild>
                <Link href="/processes/new">Cadastrar processo</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {processes.map((process) => (
            <Card key={process.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="font-mono text-base">
                        {process.processNumber}
                      </CardTitle>
                      <Badge variant={statusVariant[process.status]}>
                        {PROCESS_STATUS_LABELS[process.status]}
                      </Badge>
                      <Badge variant="outline">
                        {LEGAL_AREA_LABELS[process.area]}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      Cliente: {process.client.name} · {process.court}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/processes/${process.id}`}>
                        <Eye className="h-4 w-4" />
                        Detalhes
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isPending}
                      onClick={() => {
                        setDeleteError(null);
                        setProcessToDelete({
                          id: process.id,
                          processNumber: process.processNumber,
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Valor da causa</p>
                  <p className="font-medium">
                    {process.value
                      ? process.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Atualizado em</p>
                  <p className="font-medium">
                    {formatTimestampBR(process.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">
                    {formatTimestampBR(process.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!processToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProcessToDelete(null);
            setDeleteError(null);
          }
        }}
        title="Excluir Processo Judicial"
        description={`Deseja realmente excluir o processo nº ${processToDelete?.processNumber}? Todos os andamentos e documentos vinculados serão excluídos permanentemente.`}
        isPending={isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

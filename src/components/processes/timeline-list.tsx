"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Clock, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import type { ProcessTimeline } from "@prisma/client";

import {
  createTimelineEntry,
  deleteTimelineEntry,
  type ActionState,
} from "@/actions/processes";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestampBR } from "@/lib/dates";

const initialState: ActionState = {
  success: false,
  message: "",
};

interface TimelineListProps {
  processId: string;
  entries: ProcessTimeline[];
}

export function TimelineList({ processId, entries }: TimelineListProps) {
  const action = createTimelineEntry.bind(null, processId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Linha do tempo</h3>
          <p className="text-sm text-muted-foreground">
            Histórico cronológico de andamentos do processo.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Novo andamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar andamento</DialogTitle>
              <DialogDescription>
                Adicione uma atualização à linha do tempo do processo.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Publicação, Audiência, Sentença"
                  required
                />
                {state.errors?.title && (
                  <p className="text-sm text-destructive">{state.errors.title[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input id="date" name="date" type="datetime-local" required />
                {state.errors?.date && (
                  <p className="text-sm text-destructive">{state.errors.date[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detalhes do andamento..."
                  rows={3}
                />
              </div>
              {state.message && !state.success && (
                <p className="text-sm text-destructive">{state.message}</p>
              )}
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar andamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8 opacity-50" />
            Nenhum andamento registrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute bottom-0 left-[15px] top-0 w-px bg-border" />
          {entries.map((entry) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              processId={processId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineEntry({
  entry,
  processId,
}: {
  entry: ProcessTimeline;
  processId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleConfirmDelete() {
    startTransition(async () => {
      const result = await deleteTimelineEntry(processId, entry.id);

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setDeleteError(null);
      setShowDeleteDialog(false);
    });
  }

  return (
    <>
      <div className="relative flex gap-4 pb-6 pl-10">
        <div className="absolute left-2 top-1 flex h-7 w-7 items-center justify-center rounded-full border bg-background">
          <Clock className="h-3.5 w-3.5 text-primary" />
        </div>
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{entry.title}</CardTitle>
                <CardDescription>
                  {formatTimestampBR(entry.date, { withTime: true })}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                disabled={isPending}
                onClick={() => {
                  setDeleteError(null);
                  setShowDeleteDialog(true);
                }}
                title="Remover andamento"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {entry.description && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{entry.description}</p>
            </CardContent>
          )}
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteError(null);
        }}
        title="Remover Andamento"
        description={`Deseja realmente remover o andamento "${entry.title}"? Esta ação não poderá ser desfeita.`}
        isPending={isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

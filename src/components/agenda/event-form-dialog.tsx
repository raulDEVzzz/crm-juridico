"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { createEvent, type ActionState } from "@/actions/agenda";
import { Button } from "@/components/ui/button";
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
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
} from "@/lib/validations/agenda";

const initialState: ActionState = {
  success: false,
  message: "",
};

interface ProcessOption {
  id: string;
  processNumber: string;
  client: { name: string };
}

interface EventFormDialogProps {
  processes: ProcessOption[];
  defaultProcessId?: string;
  trigger?: React.ReactNode;
}

export function EventFormDialog({
  processes,
  defaultProcessId,
  trigger,
}: EventFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, isPending] = useActionState(
    createEvent,
    initialState
  );

  // Fecha o dialog automaticamente quando o compromisso é salvo com sucesso e reseta o formulário
  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setFormKey((k) => k + 1);
    }
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Novo compromisso</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo compromisso</DialogTitle>
          <DialogDescription>
            Cadastre audiências, prazos ou reuniões na agenda.
          </DialogDescription>
        </DialogHeader>
        <form key={formKey} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Audiência de conciliação"
              required
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <NativeSelect id="type" name="type" defaultValue="AUDIENCIA" required>
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <NativeSelect id="status" name="status" defaultValue="PENDENTE">
                {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Data *</Label>
              <Input id="eventDate" name="eventDate" type="date" required />
              {state.errors?.eventDate && (
                <p className="text-sm text-destructive">
                  {state.errors.eventDate[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime">Horário</Label>
              <Input id="eventTime" name="eventTime" type="time" defaultValue="09:00" />
              {state.errors?.eventTime && (
                <p className="text-sm text-destructive">
                  {state.errors.eventTime[0]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processId">Processo vinculado (opcional)</Label>
            <NativeSelect
              id="processId"
              name="processId"
              defaultValue={defaultProcessId ?? ""}
            >
              <option value="">Nenhum processo</option>
              {processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.processNumber} — {process.client.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detalhes do compromisso..."
              rows={3}
            />
          </div>

          {state.message && !state.success && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar compromisso
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

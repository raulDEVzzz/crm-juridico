"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Process } from "@prisma/client";

import {
  createProcess,
  updateProcess,
  type ActionState,
} from "@/actions/processes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCnj,
  LEGAL_AREA_LABELS,
  PROCESS_STATUS_LABELS,
} from "@/lib/validations/process";

const initialState: ActionState = {
  success: false,
  message: "",
};

interface ClientOption {
  id: string;
  name: string;
}

interface ProcessFormProps {
  clients: ClientOption[];
  process?: Omit<Process, "value"> & {
    value: number | null;
    client: ClientOption;
  };
  mode: "create" | "edit";
}

export function ProcessForm({ clients, process, mode }: ProcessFormProps) {
  const router = useRouter();
  const action =
    mode === "create" ? createProcess : updateProcess.bind(null, process!.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [processNumber, setProcessNumber] = useState(
    process?.processNumber ?? ""
  );

  function handleCnjChange(value: string) {
    setProcessNumber(formatCnj(value));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="clientId">Cliente vinculado *</Label>
          <NativeSelect
            id="clientId"
            name="clientId"
            defaultValue={process?.clientId ?? ""}
            required
          >
            <option value="" disabled>
              Selecione um cliente
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </NativeSelect>
          {state.errors?.clientId && (
            <p className="text-sm text-destructive">{state.errors.clientId[0]}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="processNumber">Número do processo (CNJ) *</Label>
          <Input
            id="processNumber"
            name="processNumber"
            value={processNumber}
            onChange={(e) => handleCnjChange(e.target.value)}
            placeholder="0000000-00.0000.0.00.0000"
            maxLength={25}
            required
          />
          <p className="text-xs text-muted-foreground">
            Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
          </p>
          {state.errors?.processNumber && (
            <p className="text-sm text-destructive">
              {state.errors.processNumber[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="court">Vara / Tribunal *</Label>
          <Input
            id="court"
            name="court"
            defaultValue={process?.court ?? ""}
            placeholder="Ex: 1ª Vara Cível de São Paulo"
            required
          />
          {state.errors?.court && (
            <p className="text-sm text-destructive">{state.errors.court[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Área *</Label>
          <NativeSelect
            id="area"
            name="area"
            defaultValue={process?.area ?? "CIVEL"}
            required
          >
            {Object.entries(LEGAL_AREA_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
          {state.errors?.area && (
            <p className="text-sm text-destructive">{state.errors.area[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <NativeSelect
            id="status"
            name="status"
            defaultValue={process?.status ?? "ATIVO"}
            required
          >
            {Object.entries(PROCESS_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor da causa (R$)</Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={process?.value ?? ""}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={process?.notes ?? ""}
            placeholder="Informações adicionais sobre o processo..."
            rows={4}
          />
        </div>
      </div>

      {state.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Cadastrar processo" : "Salvar alterações"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

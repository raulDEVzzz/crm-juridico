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
  stripCnj,
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

interface ProcessFormValues {
  clientId: string;
  processNumber: string;
  court: string;
  area: string;
  status: string;
  value: string;
  notes: string;
}

export function ProcessForm({ clients, process, mode }: ProcessFormProps) {
  const router = useRouter();
  const action =
    mode === "create" ? createProcess : updateProcess.bind(null, process!.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [values, setValues] = useState<ProcessFormValues>({
    clientId: process?.clientId ?? "",
    processNumber: process?.processNumber ?? "",
    court: process?.court ?? "",
    area: process?.area ?? "CIVEL",
    status: process?.status ?? "ATIVO",
    value: process?.value != null ? String(process.value) : "",
    notes: process?.notes ?? "",
  });

  function updateValues(patch: Partial<ProcessFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  // O React 19 reseta o formulário antes de executar a action. Como os campos
  // são controlados, os valores digitados sobrevivem e a confirmação do CNJ
  // duplicado salva exatamente o que o usuário preencheu. O aviso só continua
  // visível enquanto cliente e CNJ forem os mesmos que o geraram.
  const warningIsCurrent =
    !!state.warning?.duplicateCnj &&
    state.warning.duplicateCnj.clientId === values.clientId &&
    stripCnj(state.warning.duplicateCnj.processNumber) ===
      stripCnj(values.processNumber);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="clientId">Cliente vinculado *</Label>
          <NativeSelect
            id="clientId"
            name="clientId"
            value={values.clientId}
            onChange={(event) =>
              updateValues({ clientId: event.target.value })
            }
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
            value={values.processNumber}
            onChange={(event) =>
              updateValues({ processNumber: formatCnj(event.target.value) })
            }
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
            value={values.court}
            onChange={(event) =>
              updateValues({ court: event.target.value })
            }
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
            value={values.area}
            onChange={(event) => updateValues({ area: event.target.value })}
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
            value={values.status}
            onChange={(event) => updateValues({ status: event.target.value })}
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
            type="text"
            inputMode="decimal"
            value={values.value}
            onChange={(event) => updateValues({ value: event.target.value })}
            placeholder="0,00"
          />
          {state.errors?.value && (
            <p className="text-sm text-destructive">{state.errors.value[0]}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            value={values.notes}
            onChange={(event) => updateValues({ notes: event.target.value })}
            placeholder="Informações adicionais sobre o processo..."
            rows={4}
          />
        </div>
      </div>

      {state.warning && warningIsCurrent && (
        <div
          role="alert"
          className="rounded-md border border-amber-500/60 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p className="font-medium">{state.warning.message}</p>
          <label className="mt-3 flex items-start gap-2">
            <input
              type="checkbox"
              name="confirmDuplicateCnj"
              value="on"
              required
              className="mt-0.5"
            />
            <span>Salvar mesmo assim</span>
          </label>
        </div>
      )}

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

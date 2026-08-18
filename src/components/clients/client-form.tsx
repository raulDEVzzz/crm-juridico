"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { Client, PersonType } from "@prisma/client";

import {
  createClient,
  updateClient,
  type ActionState,
} from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInput } from "@/lib/dates";
import { formatDocument, formatPhone } from "@/lib/validations/client";

const initialState: ActionState = {
  success: false,
  message: "",
};

interface ClientFormProps {
  client?: Client;
  mode: "create" | "edit";
}

export function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createClient : updateClient.bind(null, client!.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={client?.name ?? ""}
            placeholder="Nome do cliente"
            required
          />
          {state.errors?.name && (
            <p className="text-sm text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="personType">Tipo de pessoa *</Label>
          <NativeSelect
            id="personType"
            name="personType"
            defaultValue={client?.personType ?? "PF"}
            required
          >
            <option value="PF">Pessoa Física (PF)</option>
            <option value="PJ">Pessoa Jurídica (PJ)</option>
          </NativeSelect>
          {state.errors?.personType && (
            <p className="text-sm text-destructive">{state.errors.personType[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">CPF / CNPJ *</Label>
          <Input
            id="document"
            name="document"
            defaultValue={
              client
                ? formatDocument(client.document, client.personType as PersonType)
                : ""
            }
            placeholder="000.000.000-00"
            required
          />
          {state.errors?.document && (
            <p className="text-sm text-destructive">{state.errors.document[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={client ? formatPhone(client.phone) : ""}
            placeholder="(00) 00000-0000"
            required
          />
          {state.errors?.phone && (
            <p className="text-sm text-destructive">{state.errors.phone[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={client?.whatsapp ? formatPhone(client.whatsapp) : ""}
            placeholder="(00) 00000-0000"
          />
          <p className="text-xs text-muted-foreground">
            Se vazio, o botão usará o telefone principal.
          </p>
          {state.errors?.whatsapp && (
            <p className="text-sm text-destructive">{state.errors.whatsapp[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de nascimento</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={formatDateInput(client?.birthDate)}
          />
          {state.errors?.birthDate && (
            <p className="text-sm text-destructive">{state.errors.birthDate[0]}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={client?.notes ?? ""}
            placeholder="Informações adicionais sobre o cliente..."
            rows={4}
          />
          {state.errors?.notes && (
            <p className="text-sm text-destructive">{state.errors.notes[0]}</p>
          )}
        </div>
      </div>

      {state.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Cadastrar cliente" : "Salvar alterações"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

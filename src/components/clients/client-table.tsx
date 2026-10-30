"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Edit, MessageCircle, Search, Trash2, User } from "lucide-react";
import type { Client } from "@prisma/client";

import { deleteClient } from "@/actions/clients";
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
import { formatDateBR } from "@/lib/dates";
import { formatDocument, formatPhone } from "@/lib/validations/client";
import { getWhatsAppNumber } from "@/lib/whatsapp";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim();
    if (!term) return clients;

    const normalizedTerm = term
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const digitsOnly = term.replace(/\D/g, "");

    return clients.filter((client) => {
      const normalizedName = client.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const nameMatch = normalizedName.includes(normalizedTerm);
      const docMatch = digitsOnly.length > 0 && client.document.includes(digitsOnly);
      const phoneMatch = digitsOnly.length > 0 && client.phone.includes(digitsOnly);
      const whatsappMatch =
        digitsOnly.length > 0 && !!client.whatsapp && client.whatsapp.includes(digitsOnly);

      return nameMatch || docMatch || phoneMatch || whatsappMatch;
    });
  }, [clients, search]);

  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleConfirmDelete() {
    if (!clientToDelete) return;

    startTransition(async () => {
      const result = await deleteClient(clientToDelete.id);

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setDeleteError(null);
      setClientToDelete(null);
    });
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nenhum cliente cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Comece adicionando seu primeiro cliente ao CRM.
            </p>
          </div>
          <Button asChild>
            <Link href="/clients/new">Cadastrar cliente</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Nenhum cliente encontrado</p>
              <p className="text-sm text-muted-foreground">
                Tente outro termo de busca.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((client) => {
            // Link WhatsApp direto — abre o chat sem nenhuma mensagem pré-definida
            const whatsappNumber = getWhatsAppNumber(client.phone, client.whatsapp);
            const whatsappLink = `https://wa.me/${whatsappNumber}`;

            return (
              <Card key={client.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <Badge variant="secondary">{client.personType}</Badge>
                      </div>
                      <CardDescription>
                        {formatDocument(client.document, client.personType)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="whatsapp" size="sm" asChild>
                        <Link
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/clients/${client.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isPending}
                        onClick={() => {
                          setDeleteError(null);
                          setClientToDelete({ id: client.id, name: client.name });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium">{formatPhone(client.phone)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">
                      {client.whatsapp ? formatPhone(client.whatsapp) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nascimento</p>
                    <p className="font-medium">
                      {formatDateBR(client.birthDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cadastrado em</p>
                    <p className="font-medium">
                      {formatDateBR(client.createdAt)}
                    </p>
                  </div>
                  {client.notes && (
                    <div className="sm:col-span-2 lg:col-span-4">
                      <p className="text-muted-foreground">Observações</p>
                      <p className="font-medium">{client.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!clientToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setClientToDelete(null);
            setDeleteError(null);
          }
        }}
        title="Excluir Cliente"
        description={`Deseja realmente excluir o cliente "${clientToDelete?.name}"? Esta ação é irreversível e excluirá também os processos e documentos vinculados.`}
        isPending={isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

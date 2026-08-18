"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Edit, MessageCircle, Trash2, User } from "lucide-react";
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
import { formatDateBR } from "@/lib/dates";
import { formatDocument, formatPhone } from "@/lib/validations/client";
import { buildBirthdayWhatsAppLink } from "@/lib/whatsapp";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o cliente "${name}"?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteClient(id);
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
    <div className="grid gap-4">
      {clients.map((client) => {
        const whatsappLink = buildBirthdayWhatsAppLink(
          client.name,
          client.phone,
          client.whatsapp
        );

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
                    onClick={() => handleDelete(client.id, client.name)}
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
  );
}

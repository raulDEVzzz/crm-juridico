import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getClientById } from "@/actions/clients";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar cliente</h1>
          <p className="text-muted-foreground">
            Atualize os dados de {client.name}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
          <CardDescription>
            Campos com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm client={client} mode="edit" />
        </CardContent>
      </Card>
    </div>
  );
}

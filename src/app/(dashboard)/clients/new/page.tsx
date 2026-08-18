import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo cliente</h1>
          <p className="text-muted-foreground">
            Preencha os dados para cadastrar um novo cliente.
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
          <ClientForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

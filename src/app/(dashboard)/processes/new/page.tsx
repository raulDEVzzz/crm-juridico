import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getClientOptions } from "@/actions/clients";
import { ProcessForm } from "@/components/processes/process-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewProcessPage() {
  const clients = await getClientOptions();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/processes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo processo</h1>
          <p className="text-muted-foreground">
            Cadastre um processo com número no padrão CNJ.
          </p>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              É necessário cadastrar pelo menos um cliente antes de criar um processo.
            </p>
            <Button asChild className="mt-4">
              <Link href="/clients/new">Cadastrar cliente</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Dados do processo</CardTitle>
            <CardDescription>
              Campos com * são obrigatórios. O número CNJ deve seguir o formato
              NNNNNNN-DD.AAAA.J.TR.OOOO.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProcessForm clients={clients} mode="create" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

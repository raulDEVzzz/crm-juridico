import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getClientOptions } from "@/actions/clients";
import { getProcessById } from "@/actions/processes";
import { ProcessForm } from "@/components/processes/process-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditProcessPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProcessPage({ params }: EditProcessPageProps) {
  const { id } = await params;
  const [process, clients] = await Promise.all([
    getProcessById(id),
    getClientOptions(),
  ]);

  if (!process) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/processes/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar processo</h1>
          <p className="text-muted-foreground">
            Atualize os dados de {process.processNumber}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do processo</CardTitle>
          <CardDescription>Campos com * são obrigatórios.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProcessForm clients={clients} process={process} mode="edit" />
        </CardContent>
      </Card>
    </div>
  );
}

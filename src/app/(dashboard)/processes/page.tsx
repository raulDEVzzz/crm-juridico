import Link from "next/link";
import { Plus } from "lucide-react";

import { getProcesses } from "@/actions/processes";
import { ProcessTable } from "@/components/processes/process-table";
import { Button } from "@/components/ui/button";

export default async function ProcessesPage() {
  const processes = await getProcesses();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Processos</h1>
          <p className="text-muted-foreground">
            Gerencie processos judiciais vinculados aos clientes.
          </p>
        </div>
        <Button asChild>
          <Link href="/processes/new">
            <Plus className="h-4 w-4" />
            Novo processo
          </Link>
        </Button>
      </div>

      <ProcessTable processes={processes} />
    </div>
  );
}

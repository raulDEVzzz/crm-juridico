import Link from "next/link";
import { Plus } from "lucide-react";

import { getProcesses } from "@/actions/processes";
import { ProcessTable } from "@/components/processes/process-table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

interface ProcessesPageProps {
  searchParams: Promise<{ cursor?: string; q?: string }>;
}

export default async function ProcessesPage({
  searchParams,
}: ProcessesPageProps) {
  const params = await searchParams;
  const page = await getProcesses({ cursor: params.cursor, search: params.q });

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

      <ProcessTable processes={page.items} search={params.q} />
      <Pagination
        basePath="/processes"
        nextCursor={page.nextCursor}
        currentCursor={params.cursor}
        filters={{ q: params.q }}
      />
    </div>
  );
}

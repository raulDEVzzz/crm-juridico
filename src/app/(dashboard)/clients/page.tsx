import Link from "next/link";
import { Plus } from "lucide-react";

import { getClients } from "@/actions/clients";
import { ClientTable } from "@/components/clients/client-table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

interface ClientsPageProps {
  searchParams: Promise<{ cursor?: string; q?: string }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const page = await getClients({ cursor: params.cursor, search: params.q });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro de clientes do escritório.
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Novo cliente
          </Link>
        </Button>
      </div>

      <ClientTable clients={page.items} search={params.q} />
      <Pagination
        basePath="/clients"
        nextCursor={page.nextCursor}
        currentCursor={params.cursor}
        filters={{ q: params.q }}
      />
    </div>
  );
}

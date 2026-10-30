import { Plus } from "lucide-react";

import { getAgendaSections } from "@/actions/agenda";
import { getProcessOptions } from "@/actions/processes";
import { EventFormDialog } from "@/components/agenda/event-form-dialog";
import { EventList } from "@/components/agenda/event-list";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import type { PaginationSearchParams } from "@/lib/pagination-url";

interface AgendaPageProps {
  searchParams: Promise<PaginationSearchParams>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const [sections, processes] = await Promise.all([
    getAgendaSections({
      atrasados: firstParam(params.cursorAtrasados),
      proximos: firstParam(params.cursorProximos),
      concluidos: firstParam(params.cursorConcluidos),
    }),
    getProcessOptions(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Audiências, prazos e reuniões do escritório.
          </p>
        </div>
        <EventFormDialog
          processes={processes}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Novo compromisso
            </Button>
          }
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Atrasados</h2>
        <EventList
          events={sections.atrasados.items}
          emptyTitle="Nenhum compromisso atrasado."
          emptyDescription="Compromissos pendentes vencidos aparecerão aqui."
          highlightOverdue
        />
        <Pagination
          basePath="/agenda"
          cursorParam="cursorAtrasados"
          nextCursor={sections.atrasados.nextCursor}
          currentCursor={firstParam(params.cursorAtrasados)}
          filters={params}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Próximos</h2>
        <EventList
          events={sections.proximos.items}
          emptyTitle="Nenhum compromisso futuro."
          emptyDescription="Seus próximos compromissos aparecerão aqui."
        />
        <Pagination
          basePath="/agenda"
          cursorParam="cursorProximos"
          nextCursor={sections.proximos.nextCursor}
          currentCursor={firstParam(params.cursorProximos)}
          filters={params}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-muted-foreground">
          Concluídos
        </h2>
        <EventList
          events={sections.concluidos.items}
          emptyTitle="Nenhum compromisso concluído."
          emptyDescription="Compromissos concluídos aparecerão aqui."
        />
        <Pagination
          basePath="/agenda"
          cursorParam="cursorConcluidos"
          nextCursor={sections.concluidos.nextCursor}
          currentCursor={firstParam(params.cursorConcluidos)}
          filters={params}
        />
      </section>
    </div>
  );
}

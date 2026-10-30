import { Plus } from "lucide-react";

import { getEvents } from "@/actions/agenda";
import { getProcessOptions } from "@/actions/processes";
import { EventFormDialog } from "@/components/agenda/event-form-dialog";
import { EventList } from "@/components/agenda/event-list";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

interface AgendaPageProps {
  searchParams: Promise<{ cursor?: string }>;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const [eventsPage, processes] = await Promise.all([
    getEvents({ cursor: params.cursor }),
    getProcessOptions(),
  ]);

  const pending = eventsPage.items.filter((event) => event.status === "PENDENTE");
  const completed = eventsPage.items.filter(
    (event) => event.status === "CONCLUIDO"
  );

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
        <h2 className="text-lg font-semibold">Pendentes</h2>
        <EventList events={pending} />
      </section>

      {completed.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Concluídos
          </h2>
          <EventList events={completed} />
        </section>
      )}

      <Pagination
        basePath="/agenda"
        nextCursor={eventsPage.nextCursor}
        currentCursor={params.cursor}
      />
    </div>
  );
}

import { Plus } from "lucide-react";

import { getEvents } from "@/actions/agenda";
import { getProcesses } from "@/actions/processes";
import { EventFormDialog } from "@/components/agenda/event-form-dialog";
import { EventList } from "@/components/agenda/event-list";
import { Button } from "@/components/ui/button";

export default async function AgendaPage() {
  const [events, processes] = await Promise.all([
    getEvents(),
    getProcesses(),
  ]);

  const pending = events.filter((e) => e.status === "PENDENTE");
  const completed = events.filter((e) => e.status === "CONCLUIDO");

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
        <h2 className="text-lg font-semibold">
          Pendentes ({pending.length})
        </h2>
        <EventList events={pending} />
      </section>

      {completed.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Concluídos ({completed.length})
          </h2>
          <EventList events={completed} />
        </section>
      )}
    </div>
  );
}

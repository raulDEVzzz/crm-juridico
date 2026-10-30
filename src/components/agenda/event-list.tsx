"use client";

import { Calendar, CheckCircle2, Clock, Trash2 } from "lucide-react";
import type { Client, Event, Process } from "@prisma/client";

import { deleteEvent, updateEventStatus } from "@/actions/agenda";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EVENT_TIME_ZONE,
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
} from "@/lib/validations/agenda";
import { useState, useTransition } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-dialog";

type EventWithProcess = Event & {
  process: (Omit<Process, "value"> & { value: number | null; client: Client }) | null;
};

interface EventListProps {
  events: EventWithProcess[];
  emptyTitle?: string;
  emptyDescription?: string;
  highlightOverdue?: boolean;
}

const typeVariant: Record<Event["type"], "default" | "warning" | "secondary"> = {
  AUDIENCIA: "default",
  PRAZO: "warning",
  REUNIAO: "secondary",
};

const formatEventDay = new Intl.DateTimeFormat("pt-BR", {
  timeZone: EVENT_TIME_ZONE,
  day: "2-digit",
});

const formatEventMonth = new Intl.DateTimeFormat("pt-BR", {
  timeZone: EVENT_TIME_ZONE,
  month: "short",
});

const formatEventDateTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: EVENT_TIME_ZONE,
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function EventList({
  events,
  emptyTitle = "Nenhum compromisso agendado",
  emptyDescription = "Adicione audiências, prazos ou reuniões à sua agenda.",
  highlightOverdue = false,
}: EventListProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
          <p className="font-medium">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          highlightOverdue={highlightOverdue}
        />
      ))}
    </div>
  );
}

function EventCard({
  event,
  highlightOverdue,
}: {
  event: EventWithProcess;
  highlightOverdue: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isDone = event.status === "CONCLUIDO";
  const isOverdue = highlightOverdue && !isDone;

  function handleToggleStatus() {
    startTransition(async () => {
      const result = await updateEventStatus(
        event.id,
        isDone ? "PENDENTE" : "CONCLUIDO"
      );

      setStatusError(result.success ? null : result.message);
    });
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      const result = await deleteEvent(event.id);

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setDeleteError(null);
      setShowDeleteDialog(false);
    });
  }

  return (
    <>
      <Card className={isDone ? "opacity-60" : isOverdue ? "border-amber-300" : ""}>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-lg font-bold leading-none">
                  {formatEventDay.format(event.eventDate)}
                </span>
                <span className="text-[10px] uppercase">
                  {formatEventMonth.format(event.eventDate)}
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className={`text-base ${isDone ? "line-through" : ""}`}>
                    {event.title}
                  </CardTitle>
                  <Badge variant={typeVariant[event.type]}>
                    {EVENT_TYPE_LABELS[event.type]}
                  </Badge>
                  <Badge variant={isDone ? "secondary" : "success"}>
                    {EVENT_STATUS_LABELS[event.status]}
                  </Badge>
                  {isOverdue && <Badge variant="warning">Atrasado</Badge>}
                </div>
                <CardDescription className="mt-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatEventDateTime.format(event.eventDate)}
                </CardDescription>
                {event.process && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Processo: {event.process.processNumber} —{" "}
                    {event.process.client.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={handleToggleStatus}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isDone ? "Reabrir" : "Concluir"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setDeleteError(null);
                  setShowDeleteDialog(true);
                }}
                title="Excluir compromisso"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {event.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </CardContent>
        )}
        {statusError ? (
          <CardContent className="pt-0">
            <p role="alert" className="text-sm font-medium text-destructive">
              {statusError}
            </p>
          </CardContent>
        ) : null}
      </Card>

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteError(null);
        }}
        title="Excluir Compromisso"
        description={`Deseja realmente remover o compromisso "${event.title}" da sua agenda?`}
        isPending={isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

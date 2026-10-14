import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";

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
  EVENT_TYPE_LABELS,
} from "@/lib/validations/agenda";

type UpcomingEvent = {
  id: string;
  title: string;
  type: "AUDIENCIA" | "PRAZO" | "REUNIAO";
  eventDate: Date;
  process: { processNumber: string; client: { name: string } } | null;
};

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

const typeVariant = {
  AUDIENCIA: "default",
  PRAZO: "warning",
  REUNIAO: "secondary",
} as const;

const formatEventDate = new Intl.DateTimeFormat("pt-BR", {
  timeZone: EVENT_TIME_ZONE,
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Próximos compromissos</CardTitle>
            <CardDescription>Audiências, prazos e reuniões pendentes</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/agenda">
            Ver agenda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum compromisso pendente nos próximos dias.
          </p>
        ) : (
          <div className="divide-y rounded-lg border">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{event.title}</p>
                    <Badge variant={typeVariant[event.type]}>
                      {EVENT_TYPE_LABELS[event.type]}
                    </Badge>
                  </div>
                  {event.process && (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {event.process.client.name} · {event.process.processNumber}
                    </p>
                  )}
                </div>
                <p className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatEventDate.format(event.eventDate)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

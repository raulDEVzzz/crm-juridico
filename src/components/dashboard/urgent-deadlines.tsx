import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EVENT_TIME_ZONE } from "@/lib/validations/agenda";
import { getBrasiliaDateParts } from "@/lib/dates";

export interface UrgentDeadline {
  id: string;
  title: string;
  eventDate: Date;
  status: "PENDENTE" | "CONCLUIDO";
  type: "AUDIENCIA" | "PRAZO" | "REUNIAO";
  process: {
    id: string;
    processNumber: string;
    client: {
      id: string;
      name: string;
    };
  } | null;
}

interface UrgentDeadlinesProps {
  deadlines: UrgentDeadline[];
}

const formatDeadlineDate = new Intl.DateTimeFormat("pt-BR", {
  timeZone: EVENT_TIME_ZONE,
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function UrgentDeadlines({ deadlines }: UrgentDeadlinesProps) {
  // Caso 1: Sem prazos urgentes (mensagem tranquilizadora)
  if (deadlines.length === 0) {
    return (
      <Card className="border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <CardContent className="flex items-center gap-4 py-4 sm:py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-emerald-950 dark:text-emerald-100">
              Prazos processuais sob controle
            </p>
            <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80">
              Não há prazos fatais vencidos ou com vencimento para hoje e próximas 48 horas. Sua esteira processual está em dia!
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden sm:inline-flex border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 dark:border-emerald-800 dark:text-emerald-200"
          >
            <Link href="/agenda">
              Agenda completa
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Obter partes de data em Brasília para determinar o grau de urgência
  const now = new Date();
  const todayParts = getBrasiliaDateParts(now);
  const todayUtcMidnight = Date.UTC(
    todayParts.year,
    todayParts.month,
    todayParts.day
  );

  const hasOverdue = deadlines.some((d) => new Date(d.eventDate) < now);

  return (
    <Card
      className={`border-2 ${
        hasOverdue
          ? "border-destructive/60 bg-destructive/5 dark:bg-destructive/10"
          : "border-amber-400/70 bg-amber-50/40 dark:border-amber-700/60 dark:bg-amber-950/20"
      }`}
    >
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              hasOverdue
                ? "bg-destructive/15 text-destructive"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }`}
          >
            {hasOverdue ? (
              <AlertOctagon className="h-5 w-5 animate-pulse" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold">
                {hasOverdue ? "Prazos Fatais e Atrasados" : "Prazos dos Próximos 2 Dias"}
              </CardTitle>
              <Badge
                variant={hasOverdue ? "destructive" : "warning"}
                className="font-mono text-xs"
              >
                {deadlines.length} {deadlines.length === 1 ? "alerta" : "alertas"}
              </Badge>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Acompanhamento prioritário de prazos processuais para evitar preclusão.
            </CardDescription>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="self-start sm:self-auto gap-1 border-current"
        >
          <Link href="/agenda">
            Abrir Agenda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-border/60 rounded-lg border bg-background/80">
          {deadlines.map((deadline) => {
            const deadlineDate = new Date(deadline.eventDate);
            const isOverdue = deadlineDate < now;

            const deadlineParts = getBrasiliaDateParts(deadlineDate);
            const deadlineUtcMidnight = Date.UTC(
              deadlineParts.year,
              deadlineParts.month,
              deadlineParts.day
            );
            const diffDays = Math.round(
              (deadlineUtcMidnight - todayUtcMidnight) / (24 * 60 * 60 * 1000)
            );

            const isToday = diffDays === 0;
            const isTomorrow = diffDays === 1;

            return (
              <div
                key={deadline.id}
                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base">
                      {deadline.title}
                    </span>

                    {isOverdue ? (
                      <Badge variant="destructive" className="text-[11px] font-bold">
                        VENCIDO / ATRASADO
                      </Badge>
                    ) : isToday ? (
                      <Badge variant="warning" className="text-[11px] font-bold bg-amber-500 text-white">
                        VENCE HOJE
                      </Badge>
                    ) : isTomorrow ? (
                      <Badge variant="secondary" className="text-[11px] font-semibold border-amber-300">
                        VENCE AMANHÃ
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px]">
                        PRÓXIMAS 48H
                      </Badge>
                    )}
                  </div>

                  {deadline.process ? (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Processo:</span>
                      <Link
                        href={`/processes/${deadline.process.id}`}
                        className="font-mono font-medium text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        {deadline.process.processNumber}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <span>·</span>
                      <span>Cliente: {deadline.process.client.name}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Compromisso avulso sem processo vinculado
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium shrink-0 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDeadlineDate.format(deadlineDate)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { CalendarDays, Plus, Users } from "lucide-react";

import { getUpcomingEvents } from "@/actions/agenda";
import { getClients, getClientsWithBirthDate } from "@/actions/clients";
import { BirthdayList } from "@/components/dashboard/birthday-list";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { filterUpcomingBirthdays } from "@/lib/birthdays";

export default async function DashboardPage() {
  const [clients, birthdayClients, upcomingEvents] = await Promise.all([
    getClients(),
    getClientsWithBirthDate(),
    getUpcomingEvents(),
  ]);
  const upcomingBirthdays = filterUpcomingBirthdays(birthdayClients, 7);
  
  // Filtramos garantindo que o birthDate não seja null para satisfazer a tipagem do componente
  const todayBirthdays = upcomingBirthdays
    .filter((client) => client.isToday && client.birthDate !== null) as Array<
      Omit<typeof upcomingBirthdays[number], "birthDate"> & { birthDate: Date }
    >;

  const nextBirthdays = upcomingBirthdays
    .filter((client) => !client.isToday && client.birthDate !== null) as Array<
      Omit<typeof upcomingBirthdays[number], "birthDate"> & { birthDate: Date }
    >;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe compromissos, aniversariantes e seus clientes.
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Novo cliente
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aniversariantes hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{todayBirthdays.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compromissos pendentes</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{upcomingEvents.length}</p>
          </CardContent>
        </Card>
      </div>

      <UpcomingEvents events={upcomingEvents.slice(0, 3)} />

      <BirthdayList
        title="Aniversariantes de hoje"
        description="Envie uma mensagem de parabéns pelo WhatsApp"
        clients={todayBirthdays}
        emptyMessage="Nenhum cliente faz aniversário hoje."
        icon="today"
      />

      <BirthdayList
        title="Próximos 7 dias"
        description="Planeje seus contatos antecipadamente"
        clients={nextBirthdays}
        emptyMessage="Nenhum aniversário nos próximos 7 dias."
        icon="upcoming"
      />
    </div>
  );
}

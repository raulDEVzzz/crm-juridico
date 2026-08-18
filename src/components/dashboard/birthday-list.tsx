import { Cake, PartyPopper } from "lucide-react";

import { BirthdayCard } from "@/components/dashboard/birthday-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BirthdayClient {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  birthDate: Date;
  daysUntil: number;
  isToday: boolean;
}

interface BirthdayListProps {
  title: string;
  description: string;
  clients: BirthdayClient[];
  emptyMessage: string;
  icon?: "today" | "upcoming";
}

export function BirthdayList({
  title,
  description,
  clients,
  emptyMessage,
  icon = "upcoming",
}: BirthdayListProps) {
  const Icon = icon === "today" ? PartyPopper : Cake;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <BirthdayCard key={client.id} {...client} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

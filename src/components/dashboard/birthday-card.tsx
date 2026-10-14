import Link from "next/link";
import { MessageCircle } from "lucide-react";

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
  formatBirthDateShort,
  formatBirthdayLabel,
} from "@/lib/birthdays";
import { formatPhone } from "@/lib/validations/client";
import { buildBirthdayWhatsAppLink } from "@/lib/whatsapp";

interface BirthdayCardProps {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  birthDate: Date;
  daysUntil: number;
  isToday: boolean;
}

export function BirthdayCard({
  name,
  phone,
  whatsapp,
  birthDate,
  daysUntil,
  isToday,
}: BirthdayCardProps) {
  const whatsappLink = buildBirthdayWhatsAppLink(name, phone, whatsapp);

  // `isToday` já é calculado com fuso de Brasília em birthdays.ts (getBrasiliaDateParts).
  // Não é necessário refazer a comparação de data aqui.
  const isBirthdayToday = isToday;

  return (
    <Card
      className={
        isBirthdayToday
          ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
          : ""
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>{formatPhone(phone)}</CardDescription>
          </div>
          <Badge variant={isBirthdayToday ? "success" : "warning"}>
            {formatBirthdayLabel(daysUntil)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Aniversário em {formatBirthDateShort(birthDate)}
        </p>
        {isBirthdayToday ? (
          <Button variant="whatsapp" size="sm" asChild>
            <Link
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Link>
          </Button>
        ) : (
          <Badge
            variant="outline"
            className="text-xs font-normal text-muted-foreground"
          >
            Em breve
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

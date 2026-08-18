import {
  addDays,
  endOfDay,
  isWithinInterval,
  setYear,
  startOfDay,
} from "date-fns";

import { formatDateShortBR, toLocalEquivalent } from "@/lib/dates";

export interface BirthdayClient {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  birthDate: Date;
  daysUntil: number;
  isToday: boolean;
}

export function getBirthdayWindow(daysAhead = 7): { start: Date; end: Date } {
  const today = startOfDay(new Date());
  const end = endOfDay(addDays(today, daysAhead));

  return { start: today, end };
}

export function calculateDaysUntilBirthday(birthDate: Date, referenceDate = new Date()): number {
  const today = startOfDay(referenceDate);
  const currentYear = today.getFullYear();

  // Normaliza o birthDate UTC para hora local antes de usar date-fns
  const localBirthDate = toLocalEquivalent(birthDate);

  let nextBirthday = startOfDay(
    setYear(localBirthDate, currentYear)
  );

  if (nextBirthday < today) {
    nextBirthday = startOfDay(setYear(localBirthDate, currentYear + 1));
  }

  const diffMs = nextBirthday.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function isBirthdayToday(birthDate: Date, referenceDate = new Date()): boolean {
  return calculateDaysUntilBirthday(birthDate, referenceDate) === 0;
}

export function filterUpcomingBirthdays<T extends { birthDate: Date | null }>(
  clients: T[],
  daysAhead = 7,
  referenceDate = new Date()
): Array<T & { daysUntil: number; isToday: boolean }> {
  const { start, end } = getBirthdayWindow(daysAhead);

  return clients
    .filter((client): client is T & { birthDate: Date } => client.birthDate !== null)
    .map((client) => {
      const daysUntil = calculateDaysUntilBirthday(client.birthDate, referenceDate);
      const isToday = daysUntil === 0;

      return { ...client, daysUntil, isToday };
    })
    .filter((client) => {
      if (client.isToday) return true;

      const currentYear = referenceDate.getFullYear();
      // Normaliza o birthDate UTC para hora local antes de comparar
      const localBirthDate = toLocalEquivalent(client.birthDate);
      let nextBirthday = setYear(localBirthDate, currentYear);

      if (nextBirthday < startOfDay(referenceDate)) {
        nextBirthday = setYear(localBirthDate, currentYear + 1);
      }

      return isWithinInterval(nextBirthday, { start, end });
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function formatBirthdayLabel(daysUntil: number): string {
  if (daysUntil === 0) return "Hoje";
  if (daysUntil === 1) return "Amanhã";
  return `Em ${daysUntil} dias`;
}

/**
 * Exibe dia/mês do aniversário usando getters UTC para evitar
 * o deslocamento de fuso horário na exibição (ex: 16/08 em vez de 15/08).
 */
export function formatBirthDateShort(date: Date): string {
  return formatDateShortBR(date);
}

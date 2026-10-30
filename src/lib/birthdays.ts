import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  startOfDay,
} from "date-fns";

import { formatDateShortBR, getBrasiliaDateParts } from "@/lib/dates";

export interface BirthdayClient {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  birthDate: Date;
  daysUntil: number;
  isToday: boolean;
}

/**
 * Retorna a janela de tempo (start/end) para buscar aniversariantes.
 * Usa o "hoje" de Brasília para garantir que o servidor em UTC não
 * desvie a janela nas últimas 3h do dia.
 */
export function getBirthdayWindow(
  daysAhead = 7,
  referenceDate = new Date()
): { start: Date; end: Date } {
  const { year, month, day } = getBrasiliaDateParts(referenceDate);
  // Cria a referência em hora local (onde date-fns opera corretamente)
  const today = startOfDay(new Date(year, month, day));
  const end = endOfDay(addDays(today, daysAhead));
  return { start: today, end };
}

export interface BirthdayMonthDayWindow {
  startMd: number;
  endMd: number;
  wrapsYear: boolean;
  referenceYear: number;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Converte o aniversário para o ano de referência, tratando 29/02. */
function birthdayInYear(year: number, month: number, day: number): Date {
  if (month === 1 && day === 29 && !isLeapYear(year)) {
    return startOfDay(new Date(year, 1, 28));
  }

  return startOfDay(new Date(year, month, day));
}

/**
 * Janela de aniversários como inteiros MM-DD (ex: 28/12 = 1228).
 * `wrapsYear` indica que a janela atravessa de dezembro para janeiro.
 */
export function getBirthdayMonthDayWindow(
  daysAhead = 7,
  referenceDate = new Date()
): BirthdayMonthDayWindow {
  const { year, month, day } = getBrasiliaDateParts(referenceDate);
  const start = new Date(year, month, day);
  const end = new Date(year, month, day + daysAhead);
  const startMd = (start.getMonth() + 1) * 100 + start.getDate();
  const endMd = (end.getMonth() + 1) * 100 + end.getDate();

  return {
    startMd,
    endMd,
    wrapsYear: startMd > endMd,
    referenceYear: year,
  };
}

/** Próximo aniversário (local), considerando 29/02 como 28/02 quando preciso. */
export function getNextBirthdayDate(
  birthDate: Date,
  referenceDate = new Date()
): Date {
  const { year, month, day } = getBrasiliaDateParts(referenceDate);
  const today = startOfDay(new Date(year, month, day));
  const birthMonth = birthDate.getUTCMonth();
  const birthDay = birthDate.getUTCDate();

  let nextBirthday = birthdayInYear(year, birthMonth, birthDay);

  if (nextBirthday < today) {
    nextBirthday = birthdayInYear(year + 1, birthMonth, birthDay);
  }

  return nextBirthday;
}

/**
 * Calcula quantos dias faltam para o próximo aniversário do cliente.
 * O "hoje" é determinado pelo fuso de Brasília, não pelo UTC do servidor.
 */
export function calculateDaysUntilBirthday(birthDate: Date, referenceDate = new Date()): number {
  const { year, month, day } = getBrasiliaDateParts(referenceDate);
  const today = startOfDay(new Date(year, month, day));

  return differenceInCalendarDays(
    getNextBirthdayDate(birthDate, referenceDate),
    today
  );
}

export function isBirthdayToday(birthDate: Date, referenceDate = new Date()): boolean {
  return calculateDaysUntilBirthday(birthDate, referenceDate) === 0;
}

export function filterUpcomingBirthdays<T extends { birthDate: Date | null }>(
  clients: T[],
  daysAhead = 7,
  referenceDate = new Date()
): Array<T & { birthDate: Date; daysUntil: number; isToday: boolean }> {
  return clients
    .filter((client): client is T & { birthDate: Date } => client.birthDate !== null)
    .map((client) => {
      const daysUntil = calculateDaysUntilBirthday(client.birthDate, referenceDate);
      return {
        ...client,
        daysUntil,
        isToday: daysUntil === 0,
      };
    })
    .filter((client) => client.daysUntil >= 0 && client.daysUntil <= daysAhead)
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

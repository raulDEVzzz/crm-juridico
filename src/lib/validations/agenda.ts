import { z } from "zod";

export const eventTypeEnum = z.enum(["AUDIENCIA", "PRAZO", "REUNIAO"]);
export const eventStatusEnum = z.enum(["PENDENTE", "CONCLUIDO"]);
export const EVENT_TIME_ZONE = "America/Sao_Paulo";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const timeZoneFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function isValidCalendarDate(value: string): boolean {
  if (!datePattern.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getTimeZoneParts(value: Date) {
  const parts = timeZoneFormatter.formatToParts(value);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
}

function getTimeZoneOffsetMilliseconds(value: Date): number {
  const parts = getTimeZoneParts(value);
  const zonedTimeAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return zonedTimeAsUtc - value.getTime();
}

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(2, "Título deve ter pelo menos 2 caracteres")
    .max(200, "Título muito longo"),
  description: z.string().max(2000, "Descrição muito longa").optional(),
  eventDate: z
    .string()
    .min(1, "Data é obrigatória")
    .refine(isValidCalendarDate, "Informe uma data válida no formato AAAA-MM-DD"),
  eventTime: z
    .string()
    .regex(timePattern, "Informe um horário válido no formato HH:mm")
    .optional(),
  type: eventTypeEnum,
  status: eventStatusEnum.default("PENDENTE"),
  processId: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventFormSchema>;

export const EVENT_TYPE_LABELS: Record<z.infer<typeof eventTypeEnum>, string> = {
  AUDIENCIA: "Audiência",
  PRAZO: "Prazo",
  REUNIAO: "Reunião",
};

export const EVENT_STATUS_LABELS: Record<
  z.infer<typeof eventStatusEnum>,
  string
> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
};

export function parseEventDateTime(date: string, time?: string): Date | null {
  const timePart = time && time.length > 0 ? time : "09:00";
  if (!isValidCalendarDate(date) || !timePattern.test(timePart)) return null;

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const localTimeAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  let parsed = new Date(
    localTimeAsUtc - getTimeZoneOffsetMilliseconds(new Date(localTimeAsUtc))
  );
  const correctedOffset = getTimeZoneOffsetMilliseconds(parsed);
  parsed = new Date(localTimeAsUtc - correctedOffset);

  const parsedParts = getTimeZoneParts(parsed);
  const matchesRequestedDateTime =
    parsedParts.year === year &&
    parsedParts.month === month &&
    parsedParts.day === day &&
    parsedParts.hour === hour &&
    parsedParts.minute === minute;

  return matchesRequestedDateTime ? parsed : null;
}

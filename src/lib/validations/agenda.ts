import { z } from "zod";

export const eventTypeEnum = z.enum(["AUDIENCIA", "PRAZO", "REUNIAO"]);
export const eventStatusEnum = z.enum(["PENDENTE", "CONCLUIDO"]);

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(2, "Título deve ter pelo menos 2 caracteres")
    .max(200, "Título muito longo"),
  description: z.string().max(2000, "Descrição muito longa").optional(),
  eventDate: z.string().min(1, "Data é obrigatória"),
  eventTime: z.string().optional(),
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

export function parseEventDateTime(date: string, time?: string): Date {
  const timePart = time && time.length > 0 ? time : "09:00";
  const parsed = new Date(`${date}T${timePart}:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

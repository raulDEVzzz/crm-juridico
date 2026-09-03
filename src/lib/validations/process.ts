import { z } from "zod";

const CNJ_REGEX = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

export const processStatusEnum = z.enum(["ATIVO", "CONCLUIDO", "SUSPENSO"]);
export const legalAreaEnum = z.enum([
  "CIVEL",
  "CRIMINAL",
  "TRABALHISTA",
  "FAMILIA",
  "TRIBUTARIO",
  "CONSUMIDOR",
  "IMOBILIARIO",
  "MARITIMO_PORTUARIO_ADUANEIRO",
  "EMPRESARIAL",
  "OUTROS",
]);

export function stripCnj(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCnj(value: string): string {
  const digits = stripCnj(value).slice(0, 20);

  if (digits.length === 0) return "";

  let formatted = digits.slice(0, 7);
  if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`;
  if (digits.length > 9) formatted += `.${digits.slice(9, 13)}`;
  if (digits.length > 13) formatted += `.${digits.slice(13, 14)}`;
  if (digits.length > 14) formatted += `.${digits.slice(14, 16)}`;
  if (digits.length > 16) formatted += `.${digits.slice(16, 20)}`;

  return formatted;
}

export function isValidCnj(value: string): boolean {
  return CNJ_REGEX.test(formatCnj(value));
}

export const processFormSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  processNumber: z
    .string()
    .min(1, "Número do processo é obrigatório")
    .transform((val) => formatCnj(val))
    .refine((val) => isValidCnj(val), {
      message: "Número CNJ inválido. Use o formato NNNNNNN-DD.AAAA.J.TR.OOOO",
    }),
  court: z
    .string()
    .min(2, "Informe a vara/tribunal")
    .max(200, "Nome muito longo"),
  area: legalAreaEnum,
  status: processStatusEnum.default("ATIVO"),
  value: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      
      let cleaned = val.replace(/[R$\s]/gi, "");
      
      const lastCommaIndex = cleaned.lastIndexOf(",");
      const lastDotIndex = cleaned.lastIndexOf(".");
      
      if (lastCommaIndex > lastDotIndex) {
        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
      } else if (lastDotIndex > lastCommaIndex) {
        cleaned = cleaned.replace(/,/g, "");
      }
      
      const parsed = parseFloat(cleaned);
      return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed;
    }),
  notes: z.string().max(2000, "Observações muito longas").optional(),
});

export const timelineFormSchema = z.object({
  title: z
    .string()
    .min(2, "Título deve ter pelo menos 2 caracteres")
    .max(200, "Título muito longo"),
  description: z.string().max(2000, "Descrição muito longa").optional(),
  date: z.string().min(1, "Data é obrigatória"),
});

export type ProcessFormData = z.infer<typeof processFormSchema>;
export type TimelineFormData = z.infer<typeof timelineFormSchema>;

export const LEGAL_AREA_LABELS: Record<z.infer<typeof legalAreaEnum>, string> = {
  CIVEL: "Cível",
  CRIMINAL: "Criminal",
  TRABALHISTA: "Trabalhista",
  FAMILIA: "Família e Sucessões",
  TRIBUTARIO: "Tributário",
  CONSUMIDOR: "Consumidor",
  IMOBILIARIO: "Direito Imobiliário",
  MARITIMO_PORTUARIO_ADUANEIRO: "Marítimo, Portuário e Aduaneiro",
  EMPRESARIAL: "Direito Empresarial",
  OUTROS: "Outros",
};

export const PROCESS_STATUS_LABELS: Record<
  z.infer<typeof processStatusEnum>,
  string
> = {
  ATIVO: "Ativo",
  CONCLUIDO: "Concluído",
  SUSPENSO: "Suspenso",
};

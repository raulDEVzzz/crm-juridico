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
  const formatted = formatCnj(value);
  if (!CNJ_REGEX.test(formatted)) return false;

  const digits = stripCnj(value);
  if (digits.length !== 20) return false;
  if (/^(\d)\1{19}$/.test(digits)) return false;

  const n = digits.slice(0, 7);
  const d = digits.slice(7, 9);
  const a = digits.slice(9, 13);
  const j = digits.slice(13, 14);
  const tr = digits.slice(14, 16);
  const o = digits.slice(16, 20);

  const baseNumber = BigInt(`${n}${a}${j}${tr}${o}00`);
  const remainder = Number(baseNumber % BigInt(97));
  const expectedDv = String(98 - remainder).padStart(2, "0");

  return d === expectedDv;
}

/**
 * Converte um valor monetário digitado para número.
 *
 * Aceita `"1.234,56"` (milhar com ponto e decimal com vírgula), `"1234.56"`
 * (ponto decimal) e inteiros. Rejeita letras, separadores malformados
 * (`"1,2,3"`), múltiplos sinais e valores negativos. Retorna `null` quando o
 * valor não é válido — o schema transforma isso em erro de validação.
 */
export function parseCurrencyAmount(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;

  const cleaned = trimmed
    .replace(/^R\$\s*/i, "")
    .replace(/\s/g, "");

  if (cleaned === "" || cleaned.startsWith("-")) return null;
  if (!/^\d[\d.,]*$/.test(cleaned)) return null;

  const commaIndex = cleaned.indexOf(",");

  if (commaIndex !== -1) {
    if (commaIndex !== cleaned.lastIndexOf(",")) return null;

    const [integerPart, decimalPart] = cleaned.split(",");

    if (!integerPart || !decimalPart) return null;
    if (!/^\d{1,3}(\.\d{3})*$/.test(integerPart) && !/^\d+$/.test(integerPart)) {
      return null;
    }
    if (!/^\d{1,2}$/.test(decimalPart)) return null;

    const parsed = Number(`${integerPart.replace(/\./g, "")}.${decimalPart}`);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (cleaned.includes(".")) {
    const parts = cleaned.split(".");

    if (parts.some((part) => part === "")) return null;

    if (parts.length === 2) {
      const [integerPart, decimalPart] = parts;

      if (!/^\d+$/.test(integerPart) || !/^\d+$/.test(decimalPart)) {
        return null;
      }

      // "1.234" é milhar; "1234.56" é decimal.
      if (decimalPart.length === 3) {
        if (integerPart.length > 3) return null;
        const parsed = Number(`${integerPart}${decimalPart}`);
        return Number.isFinite(parsed) ? parsed : null;
      }

      if (decimalPart.length > 2) return null;

      const parsed = Number(`${integerPart}.${decimalPart}`);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (!/^\d{1,3}$/.test(parts[0])) return null;
    if (!parts.slice(1).every((part) => /^\d{3}$/.test(part))) return null;

    const parsed = Number(parts.join(""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (!/^\d+$/.test(cleaned)) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
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
    .transform((val, ctx) => {
      if (!val || val.trim() === "") return undefined;

      const trimmed = val.trim();
      const withoutPrefix = trimmed.replace(/^R\$\s*/i, "");

      if (withoutPrefix.startsWith("-")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valor da causa não pode ser negativo",
        });
        return z.NEVER;
      }

      const parsed = parseCurrencyAmount(trimmed);

      if (parsed === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um valor válido",
        });
        return z.NEVER;
      }

      return parsed;
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

import { z } from "zod";

export const personTypeEnum = z.enum(["PF", "PJ"]);

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome muito longo"),
  personType: personTypeEnum,
  document: z
    .string()
    .min(11, "Documento inválido")
    .max(18, "Documento inválido")
    .transform((val) => val.replace(/\D/g, "")),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .max(15, "Telefone inválido")
    .transform((val) => val.replace(/\D/g, "")),
  whatsapp: z
    .string()
    .max(15, "WhatsApp inválido")
    .optional()
    .transform((val) => (val ? val.replace(/\D/g, "") : undefined)),
  birthDate: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  notes: z.string().max(2000, "Observações muito longas").optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

export function formatDocument(document: string, personType: "PF" | "PJ"): string {
  const digits = document.replace(/\D/g, "");

  if (personType === "PF" && digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (personType === "PJ" && digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  return document;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

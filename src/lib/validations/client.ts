import { z } from "zod";
import { parseDateUTC } from "@/lib/dates";

export const personTypeEnum = z.enum(["PF", "PJ"]);

function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidBrazilianPhoneLength(value: string): boolean {
  return value.length === 10 || value.length === 11;
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeDigits(value);

  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateCheckDigit = (digits: string, initialWeight: number) => {
    const sum = digits.split("").reduce(
      (total, digit, index) => total + Number(digit) * (initialWeight - index),
      0
    );
    const remainder = (sum * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateCheckDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateCheckDigit(cpf.slice(0, 10), 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}

export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeDigits(value);

  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weightsSecond = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const calcDigit = (sliceLength: number, weights: number[]) => {
    const sum = cnpj
      .slice(0, sliceLength)
      .split("")
      .reduce((acc, digit, idx) => acc + Number(digit) * weights[idx], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcDigit(12, weightsFirst);
  const secondDigit = calcDigit(13, weightsSecond);

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}

export const clientFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(200, "Nome muito longo"),
    personType: personTypeEnum,
    document: z.string().transform(normalizeDigits),
    phone: z.string().transform(normalizeDigits),
    whatsapp: z
      .string()
      .optional()
      .transform((value) =>
        value === undefined || value.trim() === "" ? undefined : normalizeDigits(value)
      ),
    birthDate: z
      .string()
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    notes: z.string().max(2000, "Observações muito longas").optional(),
  })
  .superRefine((data, context) => {
    const requiredDocumentLength = data.personType === "PF" ? 11 : 14;
    const documentLabel = data.personType === "PF" ? "CPF" : "CNPJ";

    if (data.document.length !== requiredDocumentLength) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["document"],
        message: `${documentLabel} deve ter ${requiredDocumentLength} dígitos.`,
      });
    }

    if (
      data.personType === "PF" &&
      data.document.length === 11 &&
      !isValidCpf(data.document)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["document"],
        message: "CPF inválido.",
      });
    }

    if (
      data.personType === "PJ" &&
      data.document.length === 14 &&
      !isValidCnpj(data.document)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["document"],
        message: "CNPJ inválido.",
      });
    }

    if (!isValidBrazilianPhoneLength(data.phone)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Telefone deve ter 10 ou 11 dígitos.",
      });
    }

    if (
      data.whatsapp !== undefined &&
      !isValidBrazilianPhoneLength(data.whatsapp)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsapp"],
        message: "WhatsApp deve ter 10 ou 11 dígitos.",
      });
    }

    if (data.birthDate) {
      const parsedDate = parseDateUTC(data.birthDate);
      if (!parsedDate) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["birthDate"],
          message: "Data de nascimento inválida.",
        });
      } else if (parsedDate > new Date()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["birthDate"],
          message: "Data de nascimento não pode ser no futuro.",
        });
      }
    }
  });

export type ClientFormData = z.infer<typeof clientFormSchema>;

export function formatDocument(document: string, personType: "PF" | "PJ"): string {
  const digits = normalizeDigits(document);

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
  const digits = normalizeDigits(phone);

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

import { z } from "zod";
import { parseDateUTC } from "@/lib/dates";

export const personTypeEnum = z.enum(["PF", "PJ"]);

function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

const VALID_BRAZILIAN_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/**
 * Valida telefone brasileiro já normalizado (somente dígitos).
 * Retorna a mensagem de erro em português ou null quando válido.
 */
export function getBrazilianPhoneValidationError(
  value: string,
  label: "Telefone" | "WhatsApp"
): string | null {
  if (!/^\d{10,11}$/.test(value)) {
    return `${label} deve ter 10 ou 11 dígitos.`;
  }

  if (/^(\d)\1+$/.test(value)) {
    return `${label} não pode ter todos os dígitos iguais.`;
  }

  const ddd = Number(value.slice(0, 2));
  if (!VALID_BRAZILIAN_DDDS.has(ddd)) {
    return `DDD do ${label === "Telefone" ? "telefone" : "WhatsApp"} inválido.`;
  }

  if (value.length === 11) {
    if (value[2] !== "9") {
      return `${label} de celular deve começar com 9 após o DDD.`;
    }
  } else if (!/[2-5]/.test(value[2])) {
    return `${label} fixo deve começar com 2, 3, 4 ou 5 após o DDD.`;
  }

  return null;
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
    email: z
      .string()
      .optional()
      .transform((value) => {
        const trimmed = value?.trim();
        return trimmed ? trimmed : undefined;
      })
      .pipe(z.string().email("E-mail inválido").optional()),
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

    const phoneError = getBrazilianPhoneValidationError(
      data.phone,
      "Telefone"
    );
    if (phoneError) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: phoneError,
      });
    }

    if (data.whatsapp !== undefined) {
      const whatsappError = getBrazilianPhoneValidationError(
        data.whatsapp,
        "WhatsApp"
      );
      if (whatsappError) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["whatsapp"],
          message: whatsappError,
        });
      }
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

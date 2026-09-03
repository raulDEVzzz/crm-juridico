import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { toLocalEquivalent } from "@/lib/dates";

const BIRTHDAY_MESSAGE =
  "Tudo bem? Passando para desejar um feliz aniversário! Que este novo ciclo seja repleto de saúde, prosperidade e realizações. Um forte abraço!";

export function getWhatsAppNumber(phone: string, whatsapp?: string | null): string {
  const number = (whatsapp || phone).replace(/\D/g, "");

  if (!number) return "";

  // 10 ou 11 dígitos = número brasileiro com DDD, precisa do DDI 55
  if (number.length === 10 || number.length === 11) {
    return `55${number}`;
  }

  // 12 ou 13 dígitos começando com 55 = já contém o DDI
  if (number.length >= 12 && number.startsWith("55")) {
    return number;
  }

  return `55${number}`;
}

export function buildBirthdayWhatsAppLink(
  clientName: string,
  phone: string,
  whatsapp?: string | null
): string {
  const number = getWhatsAppNumber(phone, whatsapp);
  const message = `Olá, ${clientName}! ${BIRTHDAY_MESSAGE}`;
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${number}?text=${encodedMessage}`;
}

export function getBirthdayGreeting(clientName: string): string {
  return `Feliz aniversário, ${clientName}! 🎂`;
}

export function formatBirthDate(date: Date): string {
  // Normaliza o Date UTC para hora local antes de formatar com date-fns
  const localDate = toLocalEquivalent(date);
  return format(localDate, "dd 'de' MMMM", { locale: ptBR });
}

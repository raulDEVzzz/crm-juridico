/**
 * Utilitários para tratamento consistente de datas puras (sem componente de horário)
 * e date-times, prevenindo deslocamentos de timezone (UTC vs horário local).
 */

/**
 * Converte uma string 'YYYY-MM-DD' (vinda de formulários / <input type="date">)
 * em um objeto Date fixado em UTC meia-noite (T00:00:00.000Z).
 */
export function parseDateUTC(value?: string | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const cleaned = value.trim();
  // Se contiver horário (ex: '2026-08-17T14:30'), extrai apenas a parte da data
  const datePart = cleaned.includes("T") ? cleaned.split("T")[0] : cleaned;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

/**
 * Converte uma string de data e hora (ex: 'YYYY-MM-DDTHH:mm' de <input type="datetime-local">
 * ou ISO string) para um objeto Date válido com fuso de Brasília (America/Sao_Paulo / UTC-3).
 */
export function parseDateTime(value?: string | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const cleaned = value.trim();

  // Se for datetime-local sem fuso explícito (ex: '2026-08-27T14:30' ou '2026-08-27T14:30:00')
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(cleaned)) {
    const withOffset = `${cleaned.slice(0, 16)}:00-03:00`;
    const date = new Date(withOffset);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(cleaned);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formata um Date do banco (UTC meia-noite) para o formato 'YYYY-MM-DD'
 * exigido por campos <input type="date">.
 */
export function formatDateInput(date: Date | null | undefined): string {
  if (!date) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formata um Date (armazenado em UTC meia-noite) para exibição
 * no formato padrão brasileiro 'DD/MM/YYYY', sem sofrer conversão de fuso.
 */
export function formatDateBR(date: Date | null | undefined): string {
  if (!date) return "—";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata um timestamp completo (ex: createdAt, updatedAt) no fuso de Brasília.
 */
export function formatTimestampBR(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formata data e hora no padrão brasileiro (DD/MM/YYYY às HH:mm).
 */
export function formatDateTimeBR(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Formata um Date (UTC) para o formato curto 'DD/MM'.
 */
export function formatDateShortBR(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/**
 * Converte um Date em UTC meia-noite para um Date em horário local equivalente
 * (mantendo ano, mês e dia idênticos) para operações com bibliotecas como date-fns.
 */
export function toLocalEquivalent(utcDate: Date): Date {
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate()
  );
}

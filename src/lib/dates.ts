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
  const date = new Date(`${datePart}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Converte uma string de data e hora (ex: 'YYYY-MM-DDTHH:mm' de <input type="datetime-local">
 * ou ISO string) para um objeto Date válido.
 */
export function parseDateTime(value?: string | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const cleaned = value.trim();
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
 * Formata um Date (armazenado em UTC meia-noite ou createdAt) para exibição
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

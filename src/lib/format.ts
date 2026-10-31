/** Formata valores monetários em reais; `null`/`undefined` viram travessão. */
export function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";

  // O Intl usa espaço não separável após "R$"; normalizamos para espaço comum
  // para manter a saída igual no servidor e no navegador.
  return value
    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    .replace(/\u00a0/g, " ");
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  cursor?: string | null;
  take?: number | null;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export function normalizePagination(
  params: PaginationParams = {},
  defaultTake = DEFAULT_PAGE_SIZE
): { take: number; cursor?: string } {
  const requested = params.take ?? defaultTake;
  const take = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), MAX_PAGE_SIZE)
    : defaultTake;
  const cursor = params.cursor?.trim() || undefined;

  return { take, cursor };
}

/**
 * Converte as linhas buscadas com `take + 1` em uma página por cursor.
 * O cursor é o id do último item retornado e a ordenação de cada consulta
 * precisa ter o id como desempate para não pular nem repetir registros.
 */
export function buildPage<T extends { id: string }>(
  rows: T[],
  take: number
): Page<T> {
  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}

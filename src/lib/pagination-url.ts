export type PaginationSearchParams = Record<
  string,
  string | string[] | undefined
>;

interface BuildPaginationHrefOptions {
  basePath: string;
  cursorParam: string;
  cursor?: string | null;
  params?: PaginationSearchParams;
}

/**
 * Monta o link de paginação preservando todos os parâmetros atuais, exceto o
 * cursor da seção que está sendo navegada.
 */
export function buildPaginationHref({
  basePath,
  cursorParam,
  cursor,
  params = {},
}: BuildPaginationHrefOptions): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === cursorParam || value === undefined) continue;

    if (Array.isArray(value)) {
      for (const item of value) searchParams.append(key, item);
      continue;
    }

    searchParams.set(key, value);
  }

  if (cursor) searchParams.set(cursorParam, cursor);

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

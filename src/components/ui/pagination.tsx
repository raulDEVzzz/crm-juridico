import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  basePath: string;
  nextCursor: string | null;
  currentCursor?: string;
  /** Filtros que precisam sobreviver à navegação entre páginas. */
  filters?: Record<string, string | undefined>;
}

export function Pagination({
  basePath,
  nextCursor,
  currentCursor,
  filters = {},
}: PaginationProps) {
  if (!nextCursor && !currentCursor) return null;

  function buildHref(cursor?: string) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }

    if (cursor) params.set("cursor", cursor);

    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {currentCursor ? (
        <Button variant="ghost" size="sm" asChild>
          <Link href={buildHref()}>
            <ChevronLeft className="h-4 w-4" />
            Primeira página
          </Link>
        </Button>
      ) : (
        <span />
      )}

      {nextCursor ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={buildHref(nextCursor)}>
            Próxima página
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildPaginationHref,
  type PaginationSearchParams,
} from "@/lib/pagination-url";

interface PaginationProps {
  basePath: string;
  nextCursor: string | null;
  currentCursor?: string;
  /** Nome do parâmetro de cursor usado por esta listagem. */
  cursorParam?: string;
  /** Parâmetros que precisam sobreviver à navegação entre páginas. */
  filters?: PaginationSearchParams;
}

export function Pagination({
  basePath,
  nextCursor,
  currentCursor,
  cursorParam = "cursor",
  filters = {},
}: PaginationProps) {
  if (!nextCursor && !currentCursor) return null;

  function buildHref(cursor?: string) {
    return buildPaginationHref({
      basePath,
      cursorParam,
      cursor,
      params: filters,
    });
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

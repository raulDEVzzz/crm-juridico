import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPaginationHref } from "../../src/lib/pagination-url";

test("paginação preserva todos os parâmetros e substitui apenas o cursor da seção", () => {
  const href = buildPaginationHref({
    basePath: "/agenda",
    cursorParam: "cursorAtrasados",
    cursor: "novo-cursor",
    params: {
      q: "prazo",
      cursorAtrasados: "cursor-antigo",
      cursorProximos: "proximo-2",
      cursorConcluidos: "concluido-3",
      tags: ["urgente", "audiencia"],
      vazio: "",
      ignorado: undefined,
    },
  });

  assert.equal(
    href,
    "/agenda?q=prazo&cursorProximos=proximo-2&cursorConcluidos=concluido-3&tags=urgente&tags=audiencia&vazio=&cursorAtrasados=novo-cursor"
  );
});

test("primeira página remove somente o cursor da seção e mantém o restante", () => {
  const href = buildPaginationHref({
    basePath: "/agenda",
    cursorParam: "cursorProximos",
    params: {
      q: "audiência",
      cursorAtrasados: "atrasado-2",
      cursorProximos: "proximo-2",
      cursorConcluidos: "concluido-3",
    },
  });

  assert.equal(
    href,
    "/agenda?q=audi%C3%AAncia&cursorAtrasados=atrasado-2&cursorConcluidos=concluido-3"
  );
});

test("sem parâmetros a paginação aponta para o caminho base", () => {
  assert.equal(
    buildPaginationHref({
      basePath: "/agenda",
      cursorParam: "cursorConcluidos",
    }),
    "/agenda"
  );
});

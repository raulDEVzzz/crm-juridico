import assert from "node:assert/strict";
import { test } from "node:test";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { EventList } from "../../src/components/agenda/event-list";

// O tsx compila JSX no modo clássico; o componente depende do React global.
(globalThis as typeof globalThis & { React: typeof React }).React = React;

const emptySections = [
  {
    title: "Nenhum compromisso atrasado.",
    description: "Compromissos pendentes vencidos aparecerão aqui.",
  },
  {
    title: "Nenhum compromisso futuro.",
    description: "Seus próximos compromissos aparecerão aqui.",
  },
  {
    title: "Nenhum compromisso concluído.",
    description: "Compromissos concluídos aparecerão aqui.",
  },
];

test("cada seção vazia usa seu próprio texto curto", () => {
  for (const section of emptySections) {
    const html = renderToStaticMarkup(
      createElement(EventList, {
        events: [],
        emptyTitle: section.title,
        emptyDescription: section.description,
      })
    );

    assert.match(html, new RegExp(section.title.replace(".", "\\.")));
    assert.match(html, new RegExp(section.description.replace(".", "\\.")));
  }
});

test("evento pendente na seção de atrasados exibe o destaque Atrasado", () => {
  const html = renderToStaticMarkup(
    createElement(EventList, {
      events: [
        {
          id: "evento-atrasado",
          title: "Prazo vencido",
          description: null,
          eventDate: new Date("2026-01-01T10:00:00.000Z"),
          type: "PRAZO" as const,
          status: "PENDENTE" as const,
          userId: "usuario-teste",
          processId: null,
          process: null,
        },
      ],
      highlightOverdue: true,
    })
  );

  assert.match(html, /Atrasado/);
});

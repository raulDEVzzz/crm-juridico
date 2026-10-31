import assert from "node:assert/strict";
import test from "node:test";

import {
  formatDateBR,
  formatTimestampBR,
} from "../src/lib/dates";

// 31/10/2026 01:00 UTC = 30/10/2026 22:00 em America/Sao_Paulo.
const LATE_NIGHT_BRASILIA = new Date("2026-10-31T01:00:00.000Z");

test("formatTimestampBR mostra o dia de Brasília para timestamp criado às 22h", () => {
  assert.equal(formatTimestampBR(LATE_NIGHT_BRASILIA), "30/10/2026");
});

test("formatTimestampBR com hora preserva o horário de Brasília", () => {
  assert.equal(
    formatTimestampBR(LATE_NIGHT_BRASILIA, { withTime: true }),
    "30/10/2026 às 22:00"
  );
});

test("formatTimestampBR aceita string ISO e mantém o fuso de Brasília", () => {
  assert.equal(
    formatTimestampBR("2026-10-31T01:00:00.000Z", { withTime: true }),
    "30/10/2026 às 22:00"
  );
});

test("formatTimestampBR trata valores ausentes e inválidos", () => {
  assert.equal(formatTimestampBR(null), "—");
  assert.equal(formatTimestampBR(undefined), "—");
  assert.equal(formatTimestampBR("data-invalida"), "—");
});

test("formatDateBR continua correto para data pura de nascimento", () => {
  assert.equal(
    formatDateBR(new Date("1990-05-15T00:00:00.000Z")),
    "15/05/1990"
  );
  assert.equal(formatDateBR(null), "—");
});

test("formatTimestampBR não depende do fuso local do processo", () => {
  const originalTz = process.env.TZ;

  try {
    for (const tz of ["UTC", "America/Sao_Paulo", "Asia/Tokyo"]) {
      process.env.TZ = tz;
      assert.equal(
        formatTimestampBR(LATE_NIGHT_BRASILIA, { withTime: true }),
        "30/10/2026 às 22:00",
        `formatação divergiu com TZ=${tz}`
      );
    }
  } finally {
    if (originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTz;
    }
  }
});

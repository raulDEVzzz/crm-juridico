import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { decideDuplicateProcessNumber } from "../src/lib/processes/duplicate-number";

const duplicate = {
  id: "process-1",
  clientId: "client-1",
  clientName: "Maria Silva",
};

test("sem duplicado, segue com o salvamento", () => {
  assert.deepEqual(
    decideDuplicateProcessNumber(null, "client-2", false),
    { action: "proceed" }
  );
});

test("mesmo CNJ no mesmo cliente continua bloqueado", () => {
  assert.deepEqual(decideDuplicateProcessNumber(duplicate, "client-1", false), {
    action: "block",
    message: "Este número CNJ já está cadastrado para este cliente.",
  });

  assert.deepEqual(decideDuplicateProcessNumber(duplicate, "client-1", true), {
    action: "block",
    message: "Este número CNJ já está cadastrado para este cliente.",
  });
});

test("mesmo CNJ em outro cliente avisa e exige confirmação", () => {
  assert.deepEqual(decideDuplicateProcessNumber(duplicate, "client-2", false), {
    action: "warn",
    message:
      "Já existe um processo com este número para o cliente Maria Silva.",
  });
});

test("confirmação explícita permite salvar em outro cliente", () => {
  assert.deepEqual(decideDuplicateProcessNumber(duplicate, "client-2", true), {
    action: "proceed",
  });
});

test("formulário só exibe a confirmação quando o servidor retorna aviso", () => {
  const source = readFileSync(
    path.resolve("src/components/processes/process-form.tsx"),
    "utf8"
  );

  assert.match(source, /\{state\.warning && warningIsCurrent && \(/);
  assert.match(source, /name="confirmDuplicateCnj"/);
  assert.match(source, /Salvar mesmo assim/);

  // Campos controlados sobrevivem ao reset automático do React 19 antes da
  // action, então a confirmação salva os valores que o usuário digitou.
  for (const field of [
    "clientId",
    "processNumber",
    "court",
    "area",
    "status",
    "value",
    "notes",
  ]) {
    assert.match(source, new RegExp(`value=\\{values\\.${field}\\}`), field);
  }
});

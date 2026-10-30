import assert from "node:assert/strict";
import test from "node:test";

import { loginSchema } from "../../src/lib/validations/auth";
import { clientFormSchema } from "../../src/lib/validations/client";
import { processFormSchema } from "../../src/lib/validations/process";
import { documentUploadSchema } from "../../src/lib/validations/upload";

function fieldErrors(result: {
  success: boolean;
  error?: { flatten(): { fieldErrors: Record<string, string[] | undefined> } };
}) {
  assert.equal(result.success, false);
  return result.error!.flatten().fieldErrors;
}

test("login mantém mensagens em português", () => {
  const errors = fieldErrors(
    loginSchema.safeParse({ username: "ab", password: "" })
  );

  assert.deepEqual(errors.username, [
    "Usuário deve ter ao menos 3 caracteres",
  ]);
  assert.ok(errors.password?.includes("Senha é obrigatória"));
});

test("cliente mantém mensagens em português", () => {
  const errors = fieldErrors(
    clientFormSchema.safeParse({
      name: "A",
      personType: "PF",
      document: "123",
      phone: "123",
    })
  );

  assert.deepEqual(errors.name, ["Nome deve ter pelo menos 2 caracteres"]);
  assert.deepEqual(errors.document, ["CPF deve ter 11 dígitos."]);
  assert.deepEqual(errors.phone, ["Telefone deve ter 10 ou 11 dígitos."]);
});

test("processo mantém mensagens em português", () => {
  const errors = fieldErrors(
    processFormSchema.safeParse({
      clientId: "",
      processNumber: "123",
      court: "",
      area: "CIVEL",
      status: "ATIVO",
      value: "",
    })
  );

  assert.deepEqual(errors.clientId, ["Selecione um cliente"]);
  assert.deepEqual(errors.court, ["Informe a vara/tribunal"]);
  assert.deepEqual(errors.processNumber, [
    "Número CNJ inválido. Use o formato NNNNNNN-DD.AAAA.J.TR.OOOO",
  ]);
});

test("upload mantém mensagens em português", () => {
  const errors = fieldErrors(
    documentUploadSchema.safeParse({ category: "x".repeat(101) })
  );

  assert.deepEqual(errors.category, ["Categoria muito longa"]);
});

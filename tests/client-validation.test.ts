import assert from "node:assert/strict";
import test from "node:test";

import {
  clientFormSchema,
  getBrazilianPhoneValidationError,
} from "../src/lib/validations/client";

const BASE_CLIENT = {
  name: "Maria Silva",
  personType: "PF" as const,
  document: "52998224725",
  phone: "11999887766",
};

function parseWithPhone(phone: string, whatsapp?: string) {
  return clientFormSchema.safeParse({
    ...BASE_CLIENT,
    phone,
    ...(whatsapp === undefined ? {} : { whatsapp }),
  });
}

function parseWithEmail(email?: string) {
  return clientFormSchema.safeParse({
    ...BASE_CLIENT,
    ...(email === undefined ? {} : { email }),
  });
}

function phoneErrors(phone: string) {
  const result = parseWithPhone(phone);
  assert.equal(result.success, false);
  return result.error!.flatten().fieldErrors.phone;
}

test("aceita celular e telefone fixo com DDD válido", () => {
  for (const phone of [
    "11999887766",
    "(11) 99988-7766",
    "1133445566",
    "2123456789",
    "85987654321",
  ]) {
    assert.equal(parseWithPhone(phone).success, true, phone);
  }
});

test("rejeita DDD inexistente", () => {
  assert.deepEqual(phoneErrors("10999887766"), [
    "DDD do telefone inválido.",
  ]);
  assert.deepEqual(phoneErrors("00999887766"), [
    "DDD do telefone inválido.",
  ]);
});

test("rejeita celular sem o nono dígito", () => {
  assert.deepEqual(phoneErrors("11899887766"), [
    "Telefone de celular deve começar com 9 após o DDD.",
  ]);
});

test("rejeita telefone fixo com nono dígito", () => {
  assert.deepEqual(phoneErrors("1199988776"), [
    "Telefone fixo deve começar com 2, 3, 4 ou 5 após o DDD.",
  ]);
});

test("rejeita sequências repetidas", () => {
  for (const phone of ["0000000000", "11111111111", "99999999999"]) {
    assert.deepEqual(phoneErrors(phone), [
      "Telefone não pode ter todos os dígitos iguais.",
    ]);
  }
});

test("rejeita tamanho inválido", () => {
  assert.deepEqual(phoneErrors("119998877"), [
    "Telefone deve ter 10 ou 11 dígitos.",
  ]);
});

test("WhatsApp segue as mesmas regras com mensagem própria", () => {
  const result = parseWithPhone("11999887766", "10999887766");

  assert.equal(result.success, false);
  assert.deepEqual(result.error!.flatten().fieldErrors.whatsapp, [
    "DDD do WhatsApp inválido.",
  ]);
});

test("helper expõe a mensagem para uso direto", () => {
  assert.equal(
    getBrazilianPhoneValidationError("11899887766", "Telefone"),
    "Telefone de celular deve começar com 9 após o DDD."
  );
  assert.equal(
    getBrazilianPhoneValidationError("11999887766", "Telefone"),
    null
  );
});

test("e-mail é opcional e vazio vira ausente", () => {
  for (const email of [undefined, "", "   "]) {
    const result = parseWithEmail(email);
    assert.equal(result.success, true);
    assert.equal(result.success && result.data.email, undefined);
  }
});

test("e-mail válido é normalizado com trim", () => {
  const result = parseWithEmail("  maria@example.com  ");

  assert.equal(result.success, true);
  assert.equal(result.success && result.data.email, "maria@example.com");
});

test("e-mail inválido retorna mensagem em português", () => {
  for (const email of ["invalido", "maria@", "@example.com", "a b@example.com"]) {
    const result = parseWithEmail(email);
    assert.equal(result.success, false);
    assert.deepEqual(result.error!.flatten().fieldErrors.email, [
      "E-mail inválido",
    ]);
  }
});

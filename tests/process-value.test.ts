import assert from "node:assert/strict";
import test from "node:test";

import { formatCurrencyBRL } from "../src/lib/format";
import {
  parseCurrencyAmount,
  processFormSchema,
} from "../src/lib/validations/process";

const VALID_PROCESS = {
  clientId: "client-1",
  processNumber: "0001234-71.2024.8.26.0100",
  court: "1ª Vara Cível de São Paulo",
  area: "CIVEL",
  status: "ATIVO",
};

function parseValue(value: string | undefined) {
  return processFormSchema.safeParse({
    ...VALID_PROCESS,
    ...(value === undefined ? {} : { value }),
  });
}

function valueErrors(value: string) {
  const result = parseValue(value);

  assert.equal(result.success, false);
  return result.error!.flatten().fieldErrors.value;
}

test("parser aceita valor no formato brasileiro com milhar", () => {
  assert.equal(parseCurrencyAmount("1.234,56"), 1234.56);
  assert.equal(parseCurrencyAmount("R$ 1.234,56"), 1234.56);
});

test("parser aceita valor com ponto decimal", () => {
  assert.equal(parseCurrencyAmount("1234.56"), 1234.56);
  assert.equal(parseCurrencyAmount("0.01"), 0.01);
});

test("parser aceita inteiros e zero", () => {
  assert.equal(parseCurrencyAmount("1234"), 1234);
  assert.equal(parseCurrencyAmount("0"), 0);
});

test("parser rejeita vírgulas repetidas, letras e negativos", () => {
  assert.equal(parseCurrencyAmount("1,2,3"), null);
  assert.equal(parseCurrencyAmount("12abc"), null);
  assert.equal(parseCurrencyAmount("abc"), null);
  assert.equal(parseCurrencyAmount("-1"), null);
  assert.equal(parseCurrencyAmount("-0,01"), null);
});

test("schema converte os formatos aceitos em número", () => {
  const brazilian = parseValue("1.234,56");
  const decimal = parseValue("1234.56");
  const zero = parseValue("0");

  assert.equal(brazilian.success, true);
  assert.equal(brazilian.success && brazilian.data.value, 1234.56);
  assert.equal(decimal.success, true);
  assert.equal(decimal.success && decimal.data.value, 1234.56);
  assert.equal(zero.success, true);
  assert.equal(zero.success && zero.data.value, 0);
});

test("schema trata campo vazio como valor ausente", () => {
  const empty = parseValue("");
  const missing = parseValue(undefined);

  assert.equal(empty.success, true);
  assert.equal(empty.success && empty.data.value, undefined);
  assert.equal(missing.success, true);
  assert.equal(missing.success && missing.data.value, undefined);
});

test("schema rejeita valor inválido com mensagem em português", () => {
  assert.deepEqual(valueErrors("abc"), ["Informe um valor válido"]);
  assert.deepEqual(valueErrors("12abc"), ["Informe um valor válido"]);
  assert.deepEqual(valueErrors("1,2,3"), ["Informe um valor válido"]);
});

test("schema rejeita valor negativo com mensagem em português", () => {
  assert.deepEqual(valueErrors("-1"), ["Valor da causa não pode ser negativo"]);
  assert.deepEqual(valueErrors("-0,01"), [
    "Valor da causa não pode ser negativo",
  ]);
});

test("exibição mostra R$ 0,00 para zero e travessão apenas para ausente", () => {
  assert.equal(formatCurrencyBRL(0), "R$ 0,00");
  assert.equal(formatCurrencyBRL(1234.56), "R$ 1.234,56");
  assert.equal(formatCurrencyBRL(null), "—");
  assert.equal(formatCurrencyBRL(undefined), "—");
});

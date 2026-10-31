import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_CALLBACK_URL,
  getSafeCallbackUrl,
} from "../src/lib/auth/callback-url";

test("aceita caminhos internos e preserva query string", () => {
  assert.equal(getSafeCallbackUrl("/dashboard"), "/dashboard");
  assert.equal(getSafeCallbackUrl("/clients?q=maria"), "/clients?q=maria");
  assert.equal(getSafeCallbackUrl("/dashboard#agenda"), "/dashboard#agenda");
  assert.equal(getSafeCallbackUrl(" /dashboard "), "/dashboard");
});

test("rejeita callback externo, protocol-relative e barra invertida", () => {
  assert.equal(getSafeCallbackUrl("https://evil"), DEFAULT_CALLBACK_URL);
  assert.equal(getSafeCallbackUrl("//evil"), DEFAULT_CALLBACK_URL);
  assert.equal(getSafeCallbackUrl("/\\evil"), DEFAULT_CALLBACK_URL);
  assert.equal(getSafeCallbackUrl("javascript:alert(1)"), DEFAULT_CALLBACK_URL);
});

test("rejeita caminho que vira protocol-relative após normalizar pontos", () => {
  for (const value of [
    "/dashboard/..//evil.com",
    "/%2e%2e//evil.com",
    "/a/..//evil.com?x=1",
    "/a/b/../../..//evil.com",
  ]) {
    assert.equal(getSafeCallbackUrl(value), DEFAULT_CALLBACK_URL, value);
  }
});

test("rejeita caracteres de controle crus e codificados", () => {
  assert.equal(getSafeCallbackUrl("/%0d%0a"), DEFAULT_CALLBACK_URL);
  assert.equal(getSafeCallbackUrl("/dashboard\r\nLocation: https://evil"), DEFAULT_CALLBACK_URL);
  assert.equal(getSafeCallbackUrl("/dashboard\t"), DEFAULT_CALLBACK_URL);
  assert.equal(getSafeCallbackUrl("/dashboard%09"), DEFAULT_CALLBACK_URL);
});

test("rejeita valores ausentes e caminho raiz", () => {
  assert.equal(getSafeCallbackUrl(null), DEFAULT_CALLBACK_URL);
  assert.equal(getSafeCallbackUrl(""), DEFAULT_CALLBACK_URL);
  assert.equal(getSafeCallbackUrl("/"), DEFAULT_CALLBACK_URL);
});

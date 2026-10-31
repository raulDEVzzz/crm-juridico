import assert from "node:assert/strict";
import test from "node:test";

import { config } from "../src/middleware";

const matcher = new RegExp(`^${config.matcher[0]}$`);

function runsMiddleware(pathname: string) {
  return matcher.test(pathname);
}

test("middleware roda em rotas comuns, inclusive com ponto no nome", () => {
  assert.equal(runsMiddleware("/dashboard"), true);
  assert.equal(runsMiddleware("/clients/abc"), true);
  assert.equal(runsMiddleware("/dashboard/foo.bar"), true);
});

test("middleware ignora assets estáticos específicos", () => {
  assert.equal(runsMiddleware("/api/auth/session"), false);
  assert.equal(runsMiddleware("/_next/static/chunks/app.js"), false);
  assert.equal(runsMiddleware("/_next/image"), false);
  assert.equal(runsMiddleware("/favicon.ico"), false);
  assert.equal(runsMiddleware("/robots.txt"), false);
  assert.equal(runsMiddleware("/sitemap.xml"), false);
});

test("middleware ignora extensões de imagem comuns", () => {
  for (const extension of [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "ico",
    "avif",
  ]) {
    assert.equal(runsMiddleware(`/assets/logo.${extension}`), false);
  }
});

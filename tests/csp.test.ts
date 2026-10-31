import assert from "node:assert/strict";
import test from "node:test";

import { buildContentSecurityPolicy } from "../src/lib/security/csp";

const S3_ENDPOINT =
  "https://cd3ce8a686cb6f1dea14191e76efcbfc.r2.cloudflarestorage.com";

function directive(csp: string, name: string): string {
  const found = csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `));

  assert.ok(found, `diretiva ${name} ausente`);
  return found;
}

test("produção remove unsafe-eval do script-src", () => {
  const csp = buildContentSecurityPolicy({
    isProduction: true,
    s3Endpoint: S3_ENDPOINT,
  });

  const scriptSrc = directive(csp, "script-src");
  assert.doesNotMatch(scriptSrc, /unsafe-eval/);
  assert.match(scriptSrc, /'self'/);
  assert.match(scriptSrc, /'unsafe-inline'/);
});

test("desenvolvimento mantém unsafe-eval para o HMR do Next.js", () => {
  const csp = buildContentSecurityPolicy({
    isProduction: false,
    s3Endpoint: S3_ENDPOINT,
  });

  assert.match(directive(csp, "script-src"), /unsafe-eval/);
});

test("connect-src permite apenas a própria origem e a origem do S3", () => {
  const csp = buildContentSecurityPolicy({
    isProduction: true,
    s3Endpoint: `${S3_ENDPOINT}/bucket/prefixo?x=1`,
  });

  assert.equal(
    directive(csp, "connect-src"),
    `connect-src 'self' ${S3_ENDPOINT}`
  );
  assert.doesNotMatch(
    directive(csp, "connect-src"),
    /(^|\s)https:(\s|$)/
  );
});

test("connect-src não abre https: genérico quando o endpoint é inválido", () => {
  const csp = buildContentSecurityPolicy({
    isProduction: true,
    s3Endpoint: "endpoint-invalido",
  });

  assert.equal(directive(csp, "connect-src"), "connect-src 'self'");
});

test("CSP mantém as demais proteções e frame-ancestors none", () => {
  const csp = buildContentSecurityPolicy({
    isProduction: true,
    s3Endpoint: S3_ENDPOINT,
  });

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.match(csp, /form-action 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
});

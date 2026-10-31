import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

test("not-found aponta o link para o dashboard", () => {
  const source = readFileSync(
    path.resolve("src/app/not-found.tsx"),
    "utf8"
  );

  assert.match(source, /href="\/dashboard"/);
  assert.match(source, /Voltar ao dashboard/);
});

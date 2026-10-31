import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

test("src/app/favicon.ico existe e tem cabeçalho ICO válido", () => {
  const icon = readFileSync(path.resolve("src/app/favicon.ico"));

  assert.ok(icon.length > 0);
  assert.equal(icon.readUInt16LE(0), 0);
  assert.equal(icon.readUInt16LE(2), 1);
  assert.equal(icon.readUInt16LE(4), 1);
});

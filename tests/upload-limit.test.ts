import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../next.config";
import { MAX_FILE_SIZE_BYTES } from "../src/lib/validations/upload";

test("limite do Server Action cobre o overhead do multipart sem afrouxar o arquivo", () => {
  assert.equal(
    nextConfig.experimental?.serverActions?.bodySizeLimit,
    "12mb"
  );
  assert.equal(MAX_FILE_SIZE_BYTES, 10 * 1024 * 1024);
});

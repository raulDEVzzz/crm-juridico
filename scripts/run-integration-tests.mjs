import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadEnvFile } from "node:process";

import {
  getSafeDatabaseLabel,
  requireTestDatabaseUrl,
} from "./reset-test-db.mjs";

try {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch {
  // Environment variables may already be exported.
}

let testUrl;
try {
  testUrl = requireTestDatabaseUrl();
} catch (error) {
  console.error(`[test-db] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

const storageDir = mkdtempSync(path.join(tmpdir(), "crm-juridico-tests-"));

// O reset precisa enxergar DATABASE_URL de desenvolvimento separada da URL
// de teste. O processo de testes, por outro lado, recebe DATABASE_URL
// apontando para o banco de teste, para que nenhum import acidental do
// singleton do Prisma consiga tocar no banco de desenvolvimento.
const resetEnv = {
  ...process.env,
  DATABASE_URL_TEST: testUrl,
  STORAGE_DRIVER: "local",
  STORAGE_LOCAL_PATH: storageDir,
  NODE_ENV: "test",
};

delete resetEnv.DATABASE_URL;

const testEnv = {
  ...resetEnv,
  DATABASE_URL: testUrl,
  DATABASE_URL_TEST_OVERRIDE: "1",
};

function run(command, args, useShell = false, env = resetEnv) {
  const result = spawnSync(command, args, {
    env,
    stdio: "inherit",
    shell: useShell,
  });
  return result.status ?? 1;
}

let exitCode = 1;
try {
  console.log(`[test-db] Banco de teste: ${getSafeDatabaseLabel(testUrl)}`);

  exitCode = run(process.execPath, ["scripts/reset-test-db.mjs"], false);
  if (exitCode !== 0) {
    throw new Error("Falha ao preparar o banco de teste.");
  }

  const testFiles = readdirSync(path.resolve("tests/integration"))
    .filter((file) => file.endsWith(".test.ts"))
    .map((file) => path.resolve("tests/integration", file));

  if (!testFiles.length) {
    throw new Error("Nenhum teste de integração encontrado.");
  }

  exitCode = run(
    "npx",
    ["tsx", "--test", "--test-concurrency=1", ...testFiles],
    process.platform === "win32",
    testEnv
  );
} catch (error) {
  console.error(
    `[test-db] ${error instanceof Error ? error.message : String(error)}`
  );
} finally {
  rmSync(storageDir, { recursive: true, force: true });
}

process.exit(exitCode);

import { spawnSync } from "node:child_process";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

try {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch {
  // Allows CI to provide the variables directly through the environment.
}

export function requireTestDatabaseUrl() {
  const testUrl = process.env.DATABASE_URL_TEST;
  const developmentUrl = process.env.DATABASE_URL;

  if (!testUrl) {
    throw new Error("DATABASE_URL_TEST não está definida.");
  }

  if (!testUrl.toLowerCase().includes("test")) {
    throw new Error(
      "DATABASE_URL_TEST precisa conter 'test' no nome/host do banco. Reset recusado."
    );
  }

  if (developmentUrl && testUrl === developmentUrl) {
    throw new Error(
      "DATABASE_URL_TEST é igual a DATABASE_URL. Reset recusado para não destruir o banco de desenvolvimento."
    );
  }

  return testUrl;
}

export function getSafeDatabaseLabel(url) {
  const parsed = new URL(url);
  return `${parsed.hostname}${parsed.pathname}`;
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  try {
    const testUrl = requireTestDatabaseUrl();
    console.log(`[test-db] Resetando ${getSafeDatabaseLabel(testUrl)} ...`);

    const result = spawnSync(
      "npx",
      ["prisma", "migrate", "reset", "--force", "--skip-seed"],
      {
        env: { ...process.env, DATABASE_URL: testUrl },
        stdio: "inherit",
        shell: process.platform === "win32",
      }
    );

    process.exit(result.status ?? 1);
  } catch (error) {
    console.error(`[test-db] ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

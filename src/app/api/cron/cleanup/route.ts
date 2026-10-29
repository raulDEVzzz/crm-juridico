import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { purgeExpiredAttempts } from "@/lib/rate-limit";
import {
  drainStorageDeletionJobs,
  purgeCompletedStorageJobs,
} from "@/lib/storage/cleanup";

export async function GET() {
  const headerList = await headers();
  const authHeader = headerList.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // This endpoint bypasses session authentication, so it must always fail
  // closed when its secret is missing or does not match.
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    // 1. Drena fila de exclusão pendente de arquivos no storage
    const storageResult = await drainStorageDeletionJobs(50, { maxAttempts: 10 });

    // 2. Purga jobs de exclusão já concluídos com mais de 24 horas
    const purgedStorageJobs = await purgeCompletedStorageJobs(24, 24 * 7);

    // 3. Purga tentativas de login expiradas com mais de 24 horas
    const purgedAttempts = await purgeExpiredAttempts(24);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      storage: storageResult,
      purgedStorageJobs,
      purgedLoginAttempts: purgedAttempts,
    });
  } catch (error) {
    console.error("Erro ao executar cron de limpeza:", error);
    return NextResponse.json(
      { error: "Erro interno durante execução da rotina de limpeza." },
      { status: 500 }
    );
  }
}

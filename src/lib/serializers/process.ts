import type { Prisma } from "@prisma/client";

/** Converts Prisma Decimal values before crossing a Server/Client boundary. */
export function serializeProcess<T extends { value: Prisma.Decimal | null }>(
  process: T
) {
  return { ...process, value: process.value?.toNumber() ?? null };
}

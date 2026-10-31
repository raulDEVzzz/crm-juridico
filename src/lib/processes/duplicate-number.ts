export interface DuplicateProcessNumber {
  id: string;
  clientId: string;
  clientName: string;
}

export type DuplicateProcessNumberDecision =
  | { action: "proceed" }
  | { action: "block"; message: string }
  | { action: "warn"; message: string };

/**
 * Decide o que fazer quando o mesmo CNJ já existe para o usuário.
 * O bloqueio vale apenas para o mesmo cliente; em outro cliente, o salvamento
 * exige confirmação explícita do usuário.
 */
export function decideDuplicateProcessNumber(
  duplicate: DuplicateProcessNumber | null,
  selectedClientId: string,
  confirmed: boolean
): DuplicateProcessNumberDecision {
  if (!duplicate) return { action: "proceed" };

  if (duplicate.clientId === selectedClientId) {
    return {
      action: "block",
      message: "Este número CNJ já está cadastrado para este cliente.",
    };
  }

  if (!confirmed) {
    return {
      action: "warn",
      message: `Já existe um processo com este número para o cliente ${duplicate.clientName}.`,
    };
  }

  return { action: "proceed" };
}

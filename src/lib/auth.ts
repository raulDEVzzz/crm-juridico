import { auth } from "@/auth";

export async function getSession() {
  return auth();
}

export async function getCurrentUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Não autenticado");
  }

  return session.user.id;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

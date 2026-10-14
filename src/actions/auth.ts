"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";

export type LoginActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const DEFAULT_CALLBACK_URL = "/dashboard";

function getSafeCallbackUrl(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return DEFAULT_CALLBACK_URL;

  const callbackUrl = value.trim();

  // Aceita somente caminhos absolutos internos. Barras invertidas também são
  // rejeitadas porque alguns navegadores as normalizam como barras normais.
  if (
    callbackUrl === "/" ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("\\")
  ) {
    return DEFAULT_CALLBACK_URL;
  }

  return callbackUrl;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const callbackUrl = getSafeCallbackUrl(formData.get("callbackUrl"));
  const headerList = await headers();
  const clientIp =
    headerList.get("cf-connecting-ip")?.trim() ||
    headerList.get("x-real-ip")?.trim() ||
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";

  try {
    await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      clientIp,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          success: false,
          message: "Usuário ou senha inválidos.",
        };
      }
      return {
        success: false,
        message: "Erro ao fazer login. Tente novamente.",
      };
    }
    throw error;
  }

  redirect(callbackUrl);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

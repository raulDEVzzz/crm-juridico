"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";

export type LoginActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const rawCallbackUrl = formData.get("callbackUrl")?.toString();
  // Se o callback for a raiz "/", redireciona para o "/dashboard"
  const callbackUrl =
    !rawCallbackUrl || rawCallbackUrl === "/" ? "/dashboard" : rawCallbackUrl;

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          success: false,
          message: "E-mail ou senha inválidos.",
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
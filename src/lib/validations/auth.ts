import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(
      z
        .string()
        .min(3, "Usuário deve ter ao menos 3 caracteres")
        .max(32, "Usuário deve ter no máximo 32 caracteres")
        .regex(
          /^[a-z0-9][a-z0-9._-]*$/,
          "Use apenas letras minúsculas, números, ponto, hífen ou sublinhado"
        )
    ),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(128, "Senha muito longa"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

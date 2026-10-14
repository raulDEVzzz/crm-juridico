import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import {
  clearAttempts,
  isKeyBlocked,
  recordFailedAttempt,
  ACCOUNT_MAX_ATTEMPTS,
  IP_MAX_ATTEMPTS,
} from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
        clientIp: { label: "Client IP", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const username = parsed.data.username;
        const rawIp =
          typeof credentials?.clientIp === "string"
            ? credentials.clientIp.trim()
            : "";
        const clientIp = rawIp.length > 0 ? rawIp : "unknown";

        const userKey = `user:${username}`;
        const ipKey = clientIp !== "unknown" ? `ip:${clientIp}` : null;

        // 1. Verificação rápida atômica de bloqueio ativo antes de computar hash
        const [isUserBlocked, isIpBlocked] = await Promise.all([
          isKeyBlocked(userKey),
          ipKey ? isKeyBlocked(ipKey) : Promise.resolve(false),
        ]);

        if (isUserBlocked || isIpBlocked) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username },
        });

        // Hash fictício com custo 12 para garantir tempo de comparação constante
        const DUMMY_HASH =
          "$2a$12$e8k5sR7y4fO6N5k9h7rQce2eHk8U1x4E9m0F6g7H8i9J0k1L2m3N4";
        const isPasswordValid = await bcrypt.compare(
          parsed.data.password,
          user ? user.passwordHash : DUMMY_HASH
        );

        if (!user || !isPasswordValid) {
          // Incrementa atômica e simultaneamente contadores de conta e de IP
          await Promise.all([
            recordFailedAttempt(userKey, ACCOUNT_MAX_ATTEMPTS),
            ipKey ? recordFailedAttempt(ipKey, IP_MAX_ATTEMPTS) : Promise.resolve(),
          ]);
          return null;
        }

        // 2. Limpa o contador de tentativas da conta em caso de sucesso
        await clearAttempts(userKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const now = new Date();
        const attempt = await prisma.loginAttempt.findUnique({ where: { email } });
        if (attempt?.blockedUntil && attempt.blockedUntil > now) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Hash fictício com custo 12 para garantir tempo de comparação constante
        const DUMMY_HASH = "$2a$12$e8k5sR7y4fO6N5k9h7rQce2eHk8U1x4E9m0F6g7H8i9J0k1L2m3N4";
        const isPasswordValid = await bcrypt.compare(
          parsed.data.password,
          user ? user.passwordHash : DUMMY_HASH
        );

        if (!user || !isPasswordValid) {
          const resetWindow = !attempt || now.getTime() - attempt.windowStartedAt.getTime() > LOGIN_WINDOW_MS;
          const attempts = resetWindow ? 1 : (attempt?.attempts ?? 0) + 1;
          await prisma.loginAttempt.upsert({
            where: { email },
            create: { email, attempts, windowStartedAt: now, blockedUntil: attempts >= MAX_LOGIN_ATTEMPTS ? new Date(now.getTime() + LOGIN_WINDOW_MS) : null },
            update: { attempts, windowStartedAt: resetWindow ? now : undefined, blockedUntil: attempts >= MAX_LOGIN_ATTEMPTS ? new Date(now.getTime() + LOGIN_WINDOW_MS) : null },
          });
          return null;
        }

        await prisma.loginAttempt.delete({ where: { email } }).catch(() => undefined);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});

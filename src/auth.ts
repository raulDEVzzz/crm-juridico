import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { authorizeCredentialsFailClosed } from "@/lib/auth/credentials";
import { createRevalidatingJwtCallback } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    jwt: createRevalidatingJwtCallback({
      userExists: async (userId) => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        return user !== null;
      },
    }),
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        return authorizeCredentialsFailClosed(credentials, request.headers);
      },
    }),
  ],
});

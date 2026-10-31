import type { NextAuthConfig } from "next-auth";

import {
  SESSION_MAX_AGE_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from "@/lib/auth/session";

export const authConfig = {
  // AUTH_URL define a origem canônica dos redirects/callbacks. Mantemos
  // trustHost porque a Vercel envia o host correto; sem AUTH_URL configurada,
  // um header Host forjado poderia influenciar URLs absolutas do Auth.js.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // 1. A página inicial "/" é a Landing Page pública
      if (pathname === "/") {
        return true;
      }

      // 2. Rotas de autenticação
      if (pathname.startsWith("/login")) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/cron")
      ) {
        return true;
      }

      // 3. Todas as demais rotas (/dashboard, /clients, /processes, /agenda) exigem login
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

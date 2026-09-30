import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

/**
 * The Prisma adapter reads from the database as soon as it is constructed,
 * and lib/prisma throws when DATABASE_URL is unset. Attaching it
 * unconditionally therefore made every /api/auth/* request fail on a
 * deployment with no database. Sessions are JWT-based either way, so the app
 * stays fully functional without one; setting DATABASE_URL re-enables
 * persistence with no code change.
 */
const hasDatabase = Boolean(process.env.DATABASE_URL);

/**
 * Sign-in is only real when Google credentials are present. next-auth also
 * refuses to start in production without a secret, which 500'd every
 * /api/auth/* call — and so every page load — on a deployment that simply had
 * not been configured yet.
 *
 * When OAuth is not configured we drop the provider and use a throwaway secret
 * so the endpoints answer cleanly (no session, no console errors). Nothing is
 * forgeable, because no session can be created: there is no provider to sign
 * in with. If Google credentials are set we never fall back — a missing
 * NEXTAUTH_SECRET alongside real credentials is a genuine misconfiguration and
 * must fail loudly rather than silently run on a guessable key.
 */
const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const UNCONFIGURED_SECRET =
  "aaharai-auth-not-configured-no-sign-in-is-possible";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== "production",
  ...(hasDatabase ? { adapter: PrismaAdapter(prisma) } : {}),
  session: {
    strategy: "jwt",
  },
  secret:
    process.env.NEXTAUTH_SECRET ??
    (hasGoogleCredentials ? undefined : UNCONFIGURED_SECRET),
  providers: hasGoogleCredentials
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as typeof user & { prakriti?: string | null };
        token.id = user.id;
        token.prakriti = authUser.prakriti;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & {
          id?: string;
          prakriti?: string | null;
        };
        sessionUser.id = typeof token.id === "string" ? token.id : undefined;
        sessionUser.prakriti =
          typeof token.prakriti === "string" ? token.prakriti : null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

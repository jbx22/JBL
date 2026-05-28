/**
 * NextAuth credentials provider that validates against Supabase Auth.
 *
 * Replaces the old Drizzle-based password verification with
 * supabase.auth.signInWithPassword().
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;

        // Use the anon key for auth (sign-in is a public endpoint)
        const anonClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await anonClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          console.warn("Supabase Auth sign-in failed:", error?.message);
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.display_name || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});

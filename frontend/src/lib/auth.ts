import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { userProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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
        
        const userRows = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        
        const user = userRows[0];
        if (!user) return null;
        
        const hashed = crypto
          .createHash("sha256")
          .update(password + user.password_salt)
          .digest("hex");
        
        if (hashed !== user.password_hash) return null;

        const [profile] = await db
          .select({
            account_status: userProfiles.account_status,
          })
          .from(userProfiles)
          .where(eq(userProfiles.user_id, user.id))
          .limit(1);

        if (profile?.account_status === "suspended" || profile?.account_status === "deleted") {
          return null;
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.display_name || null,
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

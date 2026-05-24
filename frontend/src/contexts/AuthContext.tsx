"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { signIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user ? { id: session.user.id as string, email: session.user.email as string } : null;

  const signOutFn = async () => {
    await nextAuthSignOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading: status === "loading",
        signOut: signOutFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

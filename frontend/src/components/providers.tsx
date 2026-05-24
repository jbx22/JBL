"use client";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <UserProfileProvider>{children}</UserProfileProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

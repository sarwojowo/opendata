'use client';

import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "./ui/chat/ChatProvider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </SessionProvider>
  );
}

import { SiweMessage } from "siwe";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByWallet, createUser } from "./lib/user";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null;
          }

          const siwe = new SiweMessage(JSON.parse(credentials.message));
          
          const result = await siwe.verify({
            signature: credentials.signature,
          });

          if (result.success) {
            const walletAddress = siwe.address.toLowerCase();
            let user = await getUserByWallet(walletAddress);
            
            if (!user) {
              user = await createUser({ wallet: walletAddress });
            }
            
            return {
              id: user.id.toString(),
              wallet: walletAddress,
            };
          }
          
          return null;
        } catch (e) {
          console.error("Auth error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.wallet = token.wallet as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.wallet = user.wallet;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
} as const;

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { getUserByWallet, createUser } from "@/lib/user";

export const authOptions: NextAuthOptions = {
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.wallet = user.wallet;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.wallet = token.wallet as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

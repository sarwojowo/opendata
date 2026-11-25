import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      wallet: string;
    };
  }

  interface User {
    id: string;
    wallet: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    wallet?: string;
  }
}

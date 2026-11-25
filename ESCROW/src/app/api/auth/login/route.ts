import { NextResponse } from "next/server";
import { getUserByWallet, createUser } from "@/lib/user";

// Legacy endpoint - kept for backward compatibility
// New authentication uses NextAuth at /api/auth/[...nextauth]
export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();
    console.log(wallet)

    if (!wallet) {
      return NextResponse.json({ error: "Wallet required" }, { status: 400 });
    }

    let user = await getUserByWallet(wallet);

    if (!user) {
      user = await createUser({ wallet });
    }

    const safeUser = {
      ...user,
      id: user.id.toString(),
    };

    return NextResponse.json({
      user: safeUser,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
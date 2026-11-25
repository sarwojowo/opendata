import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getUserByWallet } from "./user";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  console.log('getCurrentUser - session:', session);
  
  if (!session?.user?.wallet) {
    console.log('No session or wallet found');
    return null;
  }
  
  console.log('Looking up wallet:', session.user.wallet);
  const user = await getUserByWallet(session.user.wallet);
  console.log('Found user:', user);
  
  return user;
}

export async function getCurrentUserId(): Promise<number | null> {
  const user = await getCurrentUser();
  return user ? Number(user.id) : null;
}

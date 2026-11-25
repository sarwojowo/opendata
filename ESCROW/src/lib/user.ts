import { prisma } from "./prisma"; // singleton prisma

export interface UserData {
  id?: number;
  name?: string;
  wallet: string;
  profile_image_url?: string;
  background_image_url?: string;
  biodata?: string;
}

// =======================
// CREATE
// =======================
export async function createUser(data: UserData) {
  return await prisma.user.create({
    data,
  });
}

// =======================
// READ
// =======================
export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: { id: BigInt(id) },
  });
}

export async function getUserByWallet(wallet: string) {
  return await prisma.user.findUnique({
    where: { wallet: wallet.toLowerCase() },
  });
}

export async function getAllUsers() {
  return await prisma.user.findMany();
}

// =======================
// UPDATE
// =======================
export async function updateUser(id: number, data: Partial<UserData>) {
  return await prisma.user.update({
    where: { id: BigInt(id) },
    data,
  });
}

// =======================
// DELETE
// =======================
export async function deleteUser(id: number) {
  return await prisma.user.delete({
    where: { id: BigInt(id) },
  });
}
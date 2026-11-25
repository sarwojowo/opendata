import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { serializeBigInt } from "@/lib/serializer"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const wallet = session.user.wallet

  // 🔥 cek arbiter
  if (wallet.toLowerCase() !== process.env.ARBITER_ADDRESS?.toLowerCase()) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const orders = await prisma.order.findMany({
    where: {
      escrow: {
        status: "DISPUTED"
      }
    },
    include: {
      service: true,
      escrow: true,
      user: true
    },
    orderBy: {
      created_at: "desc"
    }
  })
  console.log(orders)

  return NextResponse.json({
    data: serializeBigInt(orders)
  })
}
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = BigInt(params.id)

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrow: true }
    })

    if (!order?.escrow) {
      return NextResponse.json(
        { message: "Escrow not found" },
        { status: 404 }
      )
    }

    // ❌ NO blockchain interaction
    // ❌ NO DB update

    return NextResponse.json({
      message: "Approve must be executed from frontend wallet"
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    )
  }
}
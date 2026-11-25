// app/api/orders/[id]/dispute/route.ts

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ethers } from "ethers"
import { getSigner, ESCROW_ABI } from "@/lib/contract"

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
      return NextResponse.json({ message: "Escrow not found" }, { status: 404 })
    }

    const signer = getSigner()

    const contract = new ethers.Contract(
      order.escrow.escrow_address,
      ESCROW_ABI,
      signer
    )

    const tx = await contract.raiseDispute()
    await tx.wait()

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "DISPUTED" }
    })

    return NextResponse.json({
      message: "Dispute raised",
      txHash: tx.hash
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Error", error: String(err) }, { status: 500 })
  }
}
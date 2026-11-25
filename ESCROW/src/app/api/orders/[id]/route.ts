import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { serializeBigInt } from "@/lib/serializer"
import { ethers } from "ethers"
import { getEscrowContract } from "@/lib/contract"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params
    const orderId = BigInt(id)

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        escrow: true,
        user: true,
        service: {
          include: {
            creator: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      )
    }

    let started = false
    let startDeadline: bigint | null = null
    let workDeadline: bigint | null = null


    // 🔥 AMBIL DATA ON-CHAIN
    if (order.escrow?.escrow_address) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

        const contract = getEscrowContract(
          order.escrow.escrow_address,
          provider
        )

        started = await contract.started()
        startDeadline = await contract.startDeadline()
        workDeadline = await contract.workDeadline()
      } catch (err) {
        console.error("Failed read contract:", err)
      }
    }

    // 🔥 inject ke response
    const result = {
      ...order,
      escrow: order.escrow
        ? {
            ...order.escrow,
            started,
            start_deadline: startDeadline,
            work_deadline: workDeadline,
          }
        : null,
    }

    return NextResponse.json({
      data: serializeBigInt(result),
    })

  } catch (err) {
    console.error("GET ORDER DETAIL ERROR:", err)
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const wallet = req.headers.get("x-wallet")

    if (!wallet) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderId = BigInt(params.id)
    const { ipfsHash } = await req.json()

    if (!ipfsHash) {
      return NextResponse.json({ message: "ipfsHash required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        escrow: true,
        service: {
          include: {
            creator: {
              include: { user: true }
            }
          }
        }
      }
    })

    if (!order || !order.escrow) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // 🔥 only artist
    if (order.service.creator.user.wallet.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // 🔥 VALIDASI STATUS
    if (order.escrow.status !== "IN_PROGRESS") {
      return NextResponse.json({ message: "Work not started" }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        escrow: {
          update: {
            submission_url: ipfsHash
          }
        }
      }
    })

    return NextResponse.json({
      message: "Submission saved",
      data: updatedOrder
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Error", error: String(err) }, { status: 500 })
  }
}
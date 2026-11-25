import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ethers } from "ethers"
import { getSigner, ESCROW_ABI } from "@/lib/contract"

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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        escrow: true,
        user: true,
        service: {
          include: {
            creator: {
              include: { user: true }
            }
          }
        }
      },
    })

    if (!order || !order.escrow) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const normalizedWallet = wallet.toLowerCase()
    const clientWallet = order.user.wallet.toLowerCase()
    const artistWallet = order.service.creator.user.wallet.toLowerCase()

    const isClient = normalizedWallet === clientWallet
    const isArtist = normalizedWallet === artistWallet

    if (!isClient && !isArtist) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // 🔥 VALIDASI ROLE
    if (order.escrow.status === "REFUNDED" && !isClient) {
      return NextResponse.json({ message: "Only client can withdraw" }, { status: 403 })
    }

    if (order.escrow.status === "RELEASED" && !isArtist) {
      return NextResponse.json({ message: "Only artist can withdraw" }, { status: 403 })
    }

    const signer = getSigner()

    const contract = new ethers.Contract(
      order.escrow.escrow_address,
      ESCROW_ABI,
      signer
    )

    // 🔥 FIX: CALL CONTRACT
    const tx = await contract.withdraw()
    await tx.wait()

    return NextResponse.json({
      message: "Withdraw success",
      txHash: tx.hash
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Error", error: String(err) }, { status: 500 })
  }
}
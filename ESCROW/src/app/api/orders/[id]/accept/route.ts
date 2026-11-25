import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { serializeBigInt } from "@/lib/serializer"
import { ethers } from "ethers"
import { getSigner, FACTORY_ADDRESS, FACTORY_ABI } from "@/lib/contract"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const did = req.headers.get("x-user-did")
    if (!did) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const wallet = did.replace("did:ethr:", "")

    const orderId = BigInt(id)

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        escrow: true,
        service: {
          include: {
            creator: {
              include: { user: true },
            },
          },
        },
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // 🔥 hanya artist boleh accept
    if (order.service.creator.user.wallet !== wallet) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    if (order.status !== "PENDING_ACCEPTANCE") {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    if (order.escrow) {
      return NextResponse.json({ message: "Escrow already exists" }, { status: 400 })
    }

    const clientAddress = order.user.wallet
    const artistAddress = order.service.creator.user.wallet
    const arbiterAddress = process.env.ARBITER_ADDRESS!

    const signer = getSigner()

    const factory = new ethers.Contract(
      FACTORY_ADDRESS,
      FACTORY_ABI,
      signer
    )

    const tx = await factory.createEscrow(
      artistAddress,
      arbiterAddress
    )

    const receipt = await tx.wait()

    // 🔥 parse event lebih aman
    let escrowAddress = ""

    for (const log of receipt.logs) {
      try {
        const parsed = factory.interface.parseLog(log)
        if (parsed?.name === "EscrowCreated") {
          escrowAddress = parsed.args[0] // escrow address
        }
      } catch {}
    }

    if (!escrowAddress) {
      throw new Error("Escrow address not found")
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "IN_PROGRESS",
        escrow: {
          create: {
            escrow_address: escrowAddress,
            client_address: clientAddress,
            artist_address: artistAddress,
            arbiter_address: arbiterAddress,
            amount: order.service.price,
            tx_hash: tx.hash, // 🔥 simpan tx
          },
        },
      },
    })

    return NextResponse.json({
      message: "Order accepted + escrow created",
      data: serializeBigInt(updatedOrder),
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    )
  }
}
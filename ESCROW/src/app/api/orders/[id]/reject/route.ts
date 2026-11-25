import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { order_status, order_history_type } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // =========================
    // 🔐 AUTH
    // =========================
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.wallet) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const wallet = session.user.wallet.toLowerCase()

    // =========================
    // 📦 BODY
    // =========================
    const body = await req.json()
    const { reason } = body

    if (!reason || reason.trim() === "") {
      return NextResponse.json({ message: "Reason required" }, { status: 400 })
    }

    // =========================
    // 🔥 GET ORDER
    // =========================
    const { id } = await context.params
    const orderId = BigInt(id)

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

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // =========================
    // 🚫 PREVENT DOUBLE CANCEL
    // =========================
    if (order.status === order_status.CANCELLED) {
      return NextResponse.json({ message: "Already cancelled" }, { status: 400 })
    }

    // =========================
    // 🔐 VALIDATE ARTIST
    // =========================
    const artistWallet =
      order.escrow?.artist_address ||
      order.service.creator.user.wallet

    if (!artistWallet) {
      return NextResponse.json({ message: "Artist not found" }, { status: 500 })
    }

    if (wallet !== artistWallet.toLowerCase()) {
      return NextResponse.json({ message: "Only artist can reject" }, { status: 403 })
    }

    // =========================
    // 🟢 OFF-CHAIN REJECT
    // =========================
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: order_status.CANCELLED,
        escrow: order.escrow
          ? {
              update: {
                reject_reason: reason,
                rejected_by: wallet,
                rejected_at: new Date()
              }
            }
          : undefined
      }
    })

    // =========================
    // 🧾 HISTORY (NO DUPLICATE)
    // =========================
    const existing = await prisma.orderHistorical.findFirst({
      where: {
        order_id: orderId,
        type: order_history_type.REJECT
      }
    })

    if (!existing) {
      await prisma.orderHistorical.create({
        data: {
          order_id: orderId,
          type: order_history_type.REJECT
        }
      })
    }

    // =========================
    // ✅ RESPONSE
    // =========================
    return NextResponse.json({
      message: "Order rejected (off-chain)"
    })

  } catch (err) {
    console.error("REJECT ERROR:", err)

    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    )
  }
}
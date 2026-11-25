import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ethers } from "ethers"
import { getEscrowContract } from "@/lib/contract"
import { serializeBigInt } from "@/lib/serializer"
import { escrow_status, order_status, order_history_type } from "@prisma/client"
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

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = BigInt(session.user.id)

    // =========================
    // 🔥 GET ORDER
    // =========================
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
              include: { user: true }
            }
          }
        }
      }
    })

    if (!order || !order.escrow) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // =========================
    // 🔐 AUTHORIZATION
    // =========================
    const isClient = order.user_id === userId
    const isArtist = order.service.creator.user.id === userId

    // 🔥 TAMBAH ARBITER
    const ARBITER_ADDRESS = process.env.NEXT_PUBLIC_ARBITER_ADDRESS?.toLowerCase()

    const isArbiter = session.user.wallet?.toLowerCase() === ARBITER_ADDRESS

    if (!isClient && !isArtist && !isArbiter) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // =========================
    // 🔥 CONNECT PROVIDER
    // =========================
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

    const contract = getEscrowContract(
      order.escrow.escrow_address,
      provider
    )

    // =========================
    // 🔥 ON-CHAIN DATA
    // =========================
    const status = Number(await contract.status())
    const amount = await contract.amount()
    const [ipfsHashRaw] = await contract.getSubmission()
    const started = await contract.started()
    const workDeadlineRaw = await contract.workDeadline()
    const reviewDeadlineRaw = await contract.reviewDeadline()

    const ipfsHash = ipfsHashRaw || null

    // =========================
    // 🔥 MAPPING STATUS
    // =========================
    let orderStatus = order.status
    let escrowStatus = order.escrow.status

    switch (status) {
      case 0: // Pending
        if (amount !== 0n) {
          escrowStatus = started
            ? escrow_status.IN_PROGRESS
            : escrow_status.FUNDED

          orderStatus = order_status.IN_PROGRESS
        } else {
          escrowStatus = escrow_status.CREATED
          orderStatus = order_status.PENDING_ACCEPTANCE
        }
        break

      case 1: // Submitted
        escrowStatus = escrow_status.SUBMITTED
        orderStatus = order_status.DELIVERED
        break

      case 2: // Disputed
        escrowStatus = escrow_status.DISPUTED
        orderStatus = order_status.DISPUTED
        break

      case 3: // Completed
        escrowStatus = escrow_status.RELEASED
        orderStatus = order_status.COMPLETED
        break

      case 4: // Refunded
        escrowStatus = escrow_status.REFUNDED
        orderStatus = order_status.CANCELLED
        break
    }

    // =========================
    // 🔥 PARSE DEADLINE
    // =========================
    const reviewDeadline =
      Number(reviewDeadlineRaw) > 0
        ? new Date(Number(reviewDeadlineRaw) * 1000)
        : null

    const workDeadline =
      Number(workDeadlineRaw) > 0
        ? new Date(Number(workDeadlineRaw) * 1000)
        : null

    // =========================
    // 🔥 HISTORY + REJECT DETECT
    // =========================
    let historyType: order_history_type | null = null
    let rejectReason: string | null = null
    let rejectedBy: string | null = null

    if (status === 3) {
      historyType = order_history_type.APPROVE
    } else if (status === 4) {
      historyType = order_history_type.REFUND

      if (!started && reviewDeadlineRaw === 0n) {
        rejectReason = "Rejected by artist"
        rejectedBy = order.escrow.artist_address
      }
    }

    // =========================
    // 🔥 UPDATE ONLY IF CHANGED
    // =========================
    const shouldUpdate =
      order.status !== orderStatus ||
      order.escrow.status !== escrowStatus ||
      order.escrow.submission_url !== ipfsHash ||
      order.escrow.reject_reason !== rejectReason ||
      order.escrow.rejected_by !== rejectedBy

    let updated = order

    if (shouldUpdate) {
      updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: orderStatus,
          escrow: {
            update: {
              status: escrowStatus,
              submission_url: ipfsHash,
              review_deadline: reviewDeadline,
              work_deadline: workDeadline,
              reject_reason: rejectReason,
              rejected_by: rejectedBy,
              rejected_at:
                rejectReason && !order.escrow.rejected_at
                  ? new Date()
                  : order.escrow.rejected_at
            }
          }
        },
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
        }
      })
    }

    // =========================
    // 🔥 HISTORY LOG
    // =========================
    if (historyType) {
      const existing = await prisma.orderHistorical.findFirst({
        where: {
          order_id: orderId,
          type: historyType
        }
      })

      if (!existing) {
        await prisma.orderHistorical.create({
          data: {
            order_id: orderId,
            tx_hash: order.escrow.tx_hash || null,
            type: historyType
          }
        })
      }
    }

    return NextResponse.json({
      message: "Synced",
      data: serializeBigInt(updated)
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    )
  }
}
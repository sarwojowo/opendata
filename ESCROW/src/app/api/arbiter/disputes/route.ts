import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const disputes = await prisma.order.findMany({
      where: {
        status: "DISPUTED"
      },
      include: {
        user: true,
        service: {
          include: {
            creator: {
              include: { user: true }
            }
          }
        },
        escrow: true
      },
      orderBy: {
        created_at: "desc"
      }
    })

    return NextResponse.json({
      data: disputes
    })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { message: "Failed to fetch disputes" },
      { status: 500 }
    )
  }
}
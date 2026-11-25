import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { serializeBigInt } from "@/lib/serializer"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    const users = await prisma.user.findMany({
      where: {
        deleted_at: null,
        name: search
          ? {
              contains: search,
              mode: "insensitive",
            }
          : undefined,
      },
      take: 10,
    })

    return NextResponse.json(serializeBigInt(users))
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { wallet, name, biodata, profile_image_url } = await req.json()

    if (!wallet || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { wallet: wallet.toLowerCase() },
      update: {
        name,
        biodata,
        profile_image_url,
      },
      create: {
        wallet: wallet.toLowerCase(),
        name,
        biodata,
        profile_image_url,
      },
    })

    return NextResponse.json(serializeBigInt(user))
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
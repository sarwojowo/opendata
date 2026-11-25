import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serializer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    // 🔥 ambil creator
    const creator = await prisma.creator.findFirst({
      where: { user_id: userId },
    });

    if (!creator) {
      return NextResponse.json(
        { message: "Not a creator" },
        { status: 403 }
      );
    }

    // 🔥 ambil order dari service milik creator
    const orders = await prisma.order.findMany({
      where: {
        service: {
          creator_id: creator.id,
        },
      },
      include: {
        service: true,
        user: true,
        escrow: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // 🔥 mapping ke UI
    const formatted = orders.map((o) => ({
      id: o.id.toString(),
      title: o.service.name,
      image: o.service.image_url,
      deadline: o.created_at.toISOString().split("T")[0],
      amount: Number(o.service.price),
      status: o.status,
    }));

    return NextResponse.json({
      data: serializeBigInt(formatted),
    });

  } catch (err) {
    console.error("CREATOR ORDERS ERROR:", err);
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serializer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const creator = await prisma.creator.findFirst({
      where: { user_id: userId },
    });

    if (!creator) {
      return NextResponse.json({ message: "Not a creator" }, { status: 403 });
    }

    const services = await prisma.service.findMany({
      where: { creator_id: creator.id },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({
      data: serializeBigInt(services),
    });

  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { serializeBigInt } from "@/lib/serializer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const room = await prisma.chattingRoom.findFirst({
      where: {
        id: BigInt(roomId),
        deleted_at: null,
        participants: {
          some: { user_id: BigInt(userId) }
        }
      }
    });

    if (!room) return NextResponse.json({ error: "Room not found or access denied" }, { status: 404 });

    const message = await prisma.message.create({
      data: {
        chatting_room_id: BigInt(roomId),
        user_id: BigInt(userId),
        content
      },
      include: { user: true }
    });

    return NextResponse.json(serializeBigInt(message));
  } catch (error: any) {
    console.error("Message POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

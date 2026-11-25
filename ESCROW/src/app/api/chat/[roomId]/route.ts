import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { serializeBigInt } from "@/lib/serializer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const messages = await prisma.message.findMany({
      where: {
        chatting_room_id: BigInt(roomId),
        deleted_at: null
      },
      include: { user: true },
      orderBy: { created_at: "asc" }
    });

    return NextResponse.json(serializeBigInt(messages));
  } catch (error: any) {
    console.error("Chat Messages GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

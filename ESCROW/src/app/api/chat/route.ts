import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { serializeBigInt } from "@/lib/serializer";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rooms = await prisma.chattingRoom.findMany({
      where: {
        deleted_at: null,
        participants: {
          some: { user_id: BigInt(userId) }
        }
      },
      include: {
        participants: {
          include: { user: true }
        },
        messages: {
          orderBy: { created_at: "desc" },
          take: 1
        }
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(serializeBigInt(rooms));
  } catch (error: any) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUserId, targetRole } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });

    if (String(userId) === String(targetUserId)) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    // Find rooms where current user participates
    const myParticipations = await prisma.chattingParticipant.findMany({
      where: { user_id: BigInt(userId) },
      select: { room_id: true }
    });
    const myRoomIds = myParticipations.map((p) => p.room_id);

    // Among those, find one where target also participates
    let room = await prisma.chattingRoom.findFirst({
      where: {
        id: { in: myRoomIds },
        deleted_at: null,
        participants: {
          some: { user_id: BigInt(targetUserId) }
        }
      },
      include: {
        participants: { include: { user: true } }
      }
    });

    if (!room) {
      room = await prisma.chattingRoom.create({
        data: {
          participants: {
            create: [
              { user_id: BigInt(userId), role: "USER" },
              { user_id: BigInt(targetUserId), role: targetRole ?? "CREATOR" }
            ]
          }
        },
        include: {
          participants: { include: { user: true } }
        }
      });
    }

    return NextResponse.json(serializeBigInt(room));
  } catch (error: any) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

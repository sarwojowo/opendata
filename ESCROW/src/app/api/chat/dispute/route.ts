import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { serializeBigInt } from "@/lib/serializer";

export async function POST(req: Request) {
  try {
    const arbiterId = await getCurrentUserId();
    if (!arbiterId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        user: true,
        service: {
          include: {
            creator: { include: { user: true } }
          }
        }
      }
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "DISPUTED") {
      return NextResponse.json({ error: "Order is not in dispute" }, { status: 400 });
    }

    const clientId = order.user_id;
    const artistId = order.service.creator.user_id;
    const arbBigInt = BigInt(arbiterId);

    // Find existing dispute room: all 3 must be participants
    const arbiterRoomIds = (
      await prisma.chattingParticipant.findMany({
        where: { user_id: arbBigInt },
        select: { room_id: true }
      })
    ).map((p) => p.room_id);

    const withClientRoomIds = (
      await prisma.chattingParticipant.findMany({
        where: { user_id: clientId, room_id: { in: arbiterRoomIds } },
        select: { room_id: true }
      })
    ).map((p) => p.room_id);

    let room = await prisma.chattingRoom.findFirst({
      where: {
        id: { in: withClientRoomIds },
        deleted_at: null,
        participants: { some: { user_id: artistId } }
      },
      include: { participants: { include: { user: true } } }
    });

    if (!room) {
      room = await prisma.chattingRoom.create({
        data: {
          participants: {
            create: [
              { user_id: arbBigInt, role: "ARBITER" },
              { user_id: clientId, role: "USER" },
              { user_id: artistId, role: "CREATOR" }
            ]
          }
        },
        include: { participants: { include: { user: true } } }
      });
    }

    return NextResponse.json(serializeBigInt(room));
  } catch (error: any) {
    console.error("Dispute chat POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

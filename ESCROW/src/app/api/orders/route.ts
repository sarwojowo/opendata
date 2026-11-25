import { NextResponse } from "next/server";
import { uploadImageToPinata } from "@/lib/pinata";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serializer";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function GET() {
  const user_id = await getCurrentUserId();

  if (!user_id) {
    return NextResponse.json(
      { error: "User session not found or expired" },
      { status: 401 }
    );
  }

  const orders = await prisma.order.findMany({
    where: { user_id: user_id },
    include: {
      service: true,
      escrow: true,
    },
  });

  return NextResponse.json({
    data: serializeBigInt(orders),
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const serviceId = formData.get("serviceId");
    const extraNotes = formData.get("extraNotes");
    const file = formData.get("imageRef");

    // =========================
    // 🔐 AUTH
    // =========================
    const user_id = await getCurrentUserId();

    if (!user_id) {
      return NextResponse.json(
          {error: "User session not found or expired"},
          {status: 401}
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // =========================
    // 🔥 VALIDATION
    // =========================
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "Reference image required" },
        { status: 400 }
      );
    }

    if (!serviceId || isNaN(Number(serviceId))) {
      return NextResponse.json(
        { message: "Invalid serviceId" },
        { status: 400 }
      );
    }

    // =========================
    // 🔥 GET SERVICE
    // =========================
    const service = await prisma.service.findUnique({
      where: {
        id: BigInt(serviceId as string),
      },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    // ❌ user tidak boleh beli service sendiri
    if (Number(service.creator.user_id) === user_id) {
      return NextResponse.json(
        { message: "You cannot buy your own service" },
        { status: 400 }
      );
    }

    // =========================
    // 🔥 UPLOAD IMAGE
    // =========================
    const imageUrl = await uploadImageToPinata(file);

    // =========================
    // 🔥 CREATE ORDER ONLY
    // =========================
    const order = await prisma.order.create({
      data: {
        service_id: service.id,
        user_id: user_id,
        note: extraNotes ? String(extraNotes) : null,
        reference_image_url: imageUrl,

        status: "PENDING_ACCEPTANCE", // 🔥 penting
        // ❌ NO ESCROW HERE
      },
    });

    return NextResponse.json(
      {
        message: "Order created",
        data: serializeBigInt(order),
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("Error creating order:", err);

    return NextResponse.json(
      {
        message: "Internal server error",
        error: String(err),
      },
      { status: 500 }
    );
  }
}
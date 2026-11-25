import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serializer";
import { createService, fetchServiceByCreatorId } from "@/lib/ServiceRepository";
import { uploadImageToPinata } from "@/lib/pinata";
import {getCurrentUserId} from "@/lib/getCurrentUser";
import {fetchCreatorByUserId} from "@/lib/CreatorRepository";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
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

  const services = await fetchServiceByCreatorId(Number(creator.id));

  return NextResponse.json({
    data: serializeBigInt(services),
  });
}

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const formData = await req.formData();

        // 1. users
        const user_id = await getCurrentUserId();

        if (!user_id) {
            return NextResponse.json(
                {error: "User session not found or expired"},
                {status: 401}
            );
        }
        // const did = formData.get("did")
        //
        // if (!did) {
        //     return NextResponse.json(
        //         { message: "DID is required", error: "Missing did"},
        //         { status: 400 }
        //     );
        // }


        // 2. Validate input
        const name = String(formData.get("name") || "").trim();
        // const description = String(formData.get("description") || "").trim();
        const price = parseFloat(String(formData.get("price")));

        if (!name) {
            return NextResponse.json(
                { message: "Name is required", error: "Invalid name" },
                { status: 400 }
            );
        }

        if (isNaN(price) || price <= 0) {
            return NextResponse.json(
                { message: "Invalid price", error: "Price must be > 0" },
                { status: 400 }
            );
        }


        // 4. Cari / buat creator
        let creator = await fetchCreatorByUserId(user_id)
        if (!creator) {
            return NextResponse.json(
                {message: "Make sure your creator account is active"},
                {status: 405}
                )
        }
        // 5. Upload image
        const file = formData.get("image");

        if (!file) {
            return NextResponse.json({ message: "No file provided", error: "Missing image" }, { status: 400 });
        }

        
        if (!(file instanceof File)) {
            return NextResponse.json({ message: "Invalid file", error: "Image must be a file" }, { status: 400 });
        }

        // Upload image to Pinata IPFS
        let imageUrl: string;
        try {
            imageUrl = await uploadImageToPinata(file);
        } catch (uploadError) {
            console.error("Pinata upload error:", uploadError);
            return NextResponse.json({message: "Failed to upload image", error: String(uploadError),}, { status: 500 });
        }

        await createService({
            name: String(formData.get("name")),
            description: String(formData.get("description")),
            price: parseFloat(String(formData.get("price"))),
            image_url: imageUrl,
            creator_id: creator.id
        });

        return NextResponse.json(
            {
                message: "Service created successfully",
                data: { image_url: imageUrl },
                error: {},},
            { status: 201 }
        );
    } catch (err) {
        console.error("Error creating service:", err);
        return NextResponse.json(
            { message: "Internal server error", error: String(err) },
            { status: 500 }
        );
    }
}
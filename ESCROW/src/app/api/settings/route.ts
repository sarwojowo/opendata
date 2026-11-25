import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { updateUser } from "@/lib/user";
import { serializeBigInt } from "@/lib/serializer";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(serializeBigInt(user));
  } catch (err: any) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, biodata, profile_image_url, background_image_url } = body;

    if (name !== undefined && typeof name === "string" && name.trim() === "") {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    const updated = await updateUser(Number(user.id), {
      ...(name !== undefined && { name: name.trim() }),
      ...(biodata !== undefined && { biodata }),
      ...(profile_image_url !== undefined && { profile_image_url }),
      ...(background_image_url !== undefined && { background_image_url }),
    });

    return NextResponse.json(serializeBigInt(updated));
  } catch (err: any) {
    console.error("PATCH /api/settings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

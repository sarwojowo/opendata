import { NextResponse } from "next/server"
import { uploadImageToPinata } from "@/lib/pinata"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      )
    }

    // 🔥 upload ke pinata
    const ipfsHash = await uploadImageToPinata(file)

    return NextResponse.json({
      message: "Upload success",
      ipfsHash
    })

  } catch (err) {
    console.error("UPLOAD ERROR:", err)

    return NextResponse.json(
      { message: "Upload failed", error: String(err) },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server";
import { likePosting } from "@/lib/PostingRepository";
import { serializeBigInt } from "@/lib/serializer";
import {getCurrentUserId} from "@/lib/getCurrentUser";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const { id } = await params;
        const postingId = parseInt(id);
        
        // TODO: Get real userId from session when auth is ready
        // const userId = 1;
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json(
                {message: "Pls login first"},
                {status: 401}
            )
        }

        const updatedPosting = await likePosting(postingId, userId);
        
        return NextResponse.json({
            success: true,
            message: "Like status updated successfully",
            data: serializeBigInt(updatedPosting)
        }, { status: 200 });
    } catch (err) {
        console.error("Error toggling like:", err);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            error: String(err)
        }, { status: 500 });
    }
}

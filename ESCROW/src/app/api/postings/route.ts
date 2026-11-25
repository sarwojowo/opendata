import { authOptions } from "@/lib/auth";
import { createPosting, fetchPostingDashboard, fetchPostingDashboardWithLikeStatus, fetchPostingProfileWithLikeStatus } from "@/lib/PostingRepository";
import { serializeBigInt } from "@/lib/serializer";
import { NextResponse, NextRequest } from "next/server";
import { uploadImageToPinata } from "@/lib/pinata";
import { getServerSession } from "next-auth";
import * as yup from "yup";

// Validation schema for POST request
const createPostingSchema = yup.object().shape({
    title: yup.string().required("Title is required").trim().min(1, "Title cannot be empty").max(255, "Title must be 255 characters or less"),
});

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function for consistent error responses
function errorResponse(message: string, error: string, status: number) {
    return NextResponse.json(
        { success: false, message, error },
        { status }
    );
}

// Helper function for consistent success responses
function successResponse(data: any, message: string = "", status: number = 200) {
    return NextResponse.json(
        { success: true, message, data },
        { status }
    );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const currentUserId = searchParams.get('currentUserId');
        
        // Profile page: fetch postings for specific user with like status
        if (userId && currentUserId) {
            const postings = await fetchPostingProfileWithLikeStatus(parseInt(userId), parseInt(currentUserId));
            return successResponse(serializeBigInt(postings), "", 200);
        }
        // Dashboard with like status
        else if (userId) {
            const postings = await fetchPostingDashboardWithLikeStatus(parseInt(userId));
            return successResponse(serializeBigInt(postings), "", 200);
        } 
        // Dashboard without like status
        else {
            const postings = await fetchPostingDashboard();
            return successResponse(serializeBigInt(postings), "", 200);
        }
    } catch (err) {
        console.error("Error fetching postings:", err);
        return errorResponse("Internal server error", String(err), 500);
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return errorResponse("Unauthorized", "You must be logged in to create a post", 401);
        }

        const userId = Number(session.user.id);

        const formData = await req.formData();
        const file = formData.get("image") as File | null;
        const title = formData.get("title") as string | null;

        // Validate required fields exist
        if (!file) {
            return errorResponse("No file provided", "Image file is required", 400);
        }

        if (!title) {
            return errorResponse("No title provided", "Title is required", 400);
        }

        // Validate file is actually a File object
        if (!(file instanceof File)) {
            return errorResponse("Invalid file", "Image must be a file", 400);
        }

        // Validate image MIME type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return errorResponse(
                "Invalid image format",
                `Allowed formats: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
                400
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return errorResponse(
                "File too large",
                `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
                413
            );
        }

        // Validate title input (BEFORE expensive operations)
        try {
            await createPostingSchema.validate({ title });
        } catch (validationError) {
            if (validationError instanceof yup.ValidationError) {
                return errorResponse("Validation error", validationError.message, 422);
            }
            throw validationError;
        }

        // Upload image to Pinata IPFS
        let imageUrl: string;
        try {
            imageUrl = await uploadImageToPinata(file);
        } catch (uploadError) {
            console.error("Pinata upload error:", uploadError);
            return errorResponse(
                "Failed to upload image",
                "There was an error uploading your image. Please try again.",
                500
            );
        }

        // Create posting with authenticated user
        const posting = await createPosting({
            user_id: userId,
            image_url: imageUrl,
            likes_count:0,
            title: title.trim(),
        });

        return successResponse(serializeBigInt(posting), "Post created successfully", 201);
    } catch (err) {
        console.error("Error creating posting:", err);
        return errorResponse(
            "Internal server error",
            "An unexpected error occurred while creating the post",
            500
        );
    }
}
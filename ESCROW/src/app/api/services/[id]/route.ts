import {deleteServiceById, fetchServiceByCreatorId, fetchServiceById, updateService} from "@/lib/ServiceRepository";
import {NextResponse} from "next/server";
import {serializeBigInt} from "@/lib/serializer";
import {uploadImageToPinata} from "@/lib/pinata";

export async function GET(req: Request, {params}: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const {id} = await params;
        const service = await fetchServiceById(parseInt(id));
        return NextResponse.json({message: "Successfully retrieved service", data: serializeBigInt(service)}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Internal server error", error: String(error)}, {status: 500});
    }
}

export async function DELETE(request: Request, {params}: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const {id} = await params;
        const del = await deleteServiceById(BigInt(id));
        console.log("delete data:",del)
        return NextResponse.json({message: "Service deleted successfully", data: serializeBigInt(del), error: {}}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error deleting service", data: {}, error: String(error),}, {status: 500});
    }
}

export async function PUT(req: Request, {params}: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const {id} = await params;
        const serviceId = parseInt(id);

        const formData = await req.formData();

        const serviceData: Record<string, any> = {};
        let imageUrl: string | undefined;

        for (const [key, value] of formData.entries()) {
            // Handle image file separately
            if (key === "image" && value instanceof File) {
                try {
                    imageUrl = await uploadImageToPinata(value);
                } catch (uploadError) {
                    console.error("Pinata upload error:", uploadError);
                    return NextResponse.json({message: "Failed to upload image", error: String(uploadError),}, {status: 500});
                }
                continue;
            }

            // Skip file fields that aren't actual files
            if (value instanceof File) continue;
            if (key === "price") {
                serviceData[key] = parseFloat(String(value));
            } else if (key !== "image") {
                serviceData[key] = String(value);
            }
        }
        // Include image URL if provided
        if (imageUrl) {
            serviceData.image_url = imageUrl;
        }
        await updateService(serviceId, serviceData);
        return NextResponse.json({message: "Service updated successfully", data: imageUrl ? {image_url: imageUrl} : {}, error: {},}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Internal server error", error: String(error)}, {status: 500});
    }
}
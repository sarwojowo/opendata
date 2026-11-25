import { PinataSDK } from "pinata";

// Initialize the Pinata client.
// Requires PINATA_JWT and NEXT_PUBLIC_PINATA_GATEWAY in your .env
export const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

/**
 * Upload an image file to Pinata IPFS
 * @param file - The image File object to upload
 * @returns The full IPFS gateway URL of the uploaded image
 */
export async function uploadImageToPinata(file: File): Promise<string> {
    try {
        // Upload to public IPFS network using Pinata
        const upload = await pinata.upload.public.file(file);
        const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";
        // Use 'cid' property from UploadResponse type
        const imageUrl = `https://${gateway}/ipfs/${upload.cid}`;
        return imageUrl;
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw new Error("Failed to upload image to Pinata");
    }
}

/**
 * Construct a full Pinata gateway URL from an IPFS hash/CID
 * @param hash - The IPFS hash or CID
 * @returns The full gateway URL
 */
export function getPinataImageUrl(hash: string): string {
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";
    return `https://${gateway}/ipfs/${hash}`;
}

"use server"

import prisma from "@/lib/prisma";

export async function getCreatorByUserId(userId: number) {
    try {
        const creator = await prisma.creator.findFirst({
            where: {
                user_id: userId,
            },
        });
        return { success: true, data: creator };
    } catch (error) {
        console.error("Error fetching creator:", error);
        return { success: false, error: "Failed to fetch creator" };
    }
}

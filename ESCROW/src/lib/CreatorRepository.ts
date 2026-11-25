import prisma from "@/lib/prisma";

export async function fetchCreatorByUserId(userId: number | bigint) {
    return prisma.creator.findFirst({
        where: {
            user_id: userId,
        },
    })
}
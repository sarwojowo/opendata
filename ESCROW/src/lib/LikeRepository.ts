import prisma from "@/lib/prisma";

interface createLike{
    user_id: number;
    posting_id: number;
}

// this for know what user like and show in profile
export async function fetchLikeByUserId(userId: number | bigint) {
    const likes = await prisma.like.findMany({
        where: {
            user_id: userId,
            deleted_at: null
        },
        include:{
            posting: true,
            user: true
        }
    });

    // Add is_liked field to posting objects - since these are user's likes, they're always liked
    return Promise.all(likes.map(async(like) => {
        const isLiked = await existingLike(like.user_id, like.posting_id);
        return {
            ...like,
            posting: {
                ...like.posting,
                is_liked: !!isLiked
            }
        };
    }));
}

export async function existingLike(userId: number | bigint, postingId: number | bigint) {
    return prisma.like.findFirst({
        where: {
            user_id: userId,
            posting_id: postingId,
            deleted_at: null
        }
    })
}

export async function existingLikeBool(userId: number | bigint, postingId: number | bigint) {
    return prisma.like.findFirst({
        where: {
            user_id: userId,
            posting_id: postingId,
            deleted_at: null
        }
    }).then(Boolean);
}

// soft delete like
export async function deletedLike(id:number) {
    return prisma.like.update({
        where: {
            id: id
        },
        data:{
            deleted_at:new Date(),
        }
    })
}

export async function createLike(data:createLike ):Promise<any> {
    return prisma.like.create({
        data: data
    })
}

export async function fetchLikeByPostingId(id:number){
    return prisma.like.findMany({
        where: {
            posting_id: id,
            deleted_at: null
        }
    }).then(Boolean);
}
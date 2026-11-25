import prisma from './prisma'
import {existingLike} from "@/lib/LikeRepository";

interface CreatePostingInput {
    user_id: number;
    image_url: string;
    title: string;
    like_count: number;
}

export async function fetchPostingById(postId: number | bigint): Promise<any> {
    return prisma.posting.findFirst({
        where: {
            id: postId,
            deleted_at: null
        }
    })
}

export async function fetchPostingDashboard(searchQuery?: string): Promise<any> {
    return prisma.posting.findMany({
        where: {
            deleted_at: null,
            title: searchQuery ? {
                contains: searchQuery,
                mode: 'insensitive'
            } : undefined
        },
        include: {
            user: true
        }
    });
}

// Note this is very bad practice and its should at lib/service but its only 1 so i put here...
export async function fetchPostingDashboardWithLikeStatus(userId: number | null, searchQuery?: string): Promise<any> {
    const postings = await prisma.posting.findMany({
        where: {
            deleted_at: null,
            title: searchQuery ? {
                contains: searchQuery,
                mode: 'insensitive'
            } : undefined
        },
        include: {
            user: true
        }
    });

    // If no userId provided, return postings with is_liked = false
    if (!userId) {
        return postings.map(post => ({
            ...post,
            is_liked: false
        }));
    }

    // Add is_liked status for each posting
    const postingsWithLikeStatus = await Promise.all(
        postings.map(async (post) => {
            const isLiked = await existingLike (userId, post.id);
            return {
                ...post,
                is_liked: !!isLiked
            };
        })
    );

    return postingsWithLikeStatus;
}

export async function fetchPostingProfile(id: number | bigint): Promise<any> {
    return prisma.posting.findMany({
        where: {
            user_id: id,
            deleted_at: null
        }
    });
}

export async function fetchPostingProfileWithLikeStatus(profileUserId: number | bigint, currentUserId: number | bigint | null): Promise<any> {
    const postings = await prisma.posting.findMany({
        where: {
            user_id: profileUserId,
            deleted_at: null
        },
        include: {
            user: true
        }
    });

    // If no currentUserId provided, return postings with is_liked = false
    if (!currentUserId) {
        return postings.map(post => ({
            ...post,
            is_liked: false
        }));
    }

    // Add is_liked status for each posting
    const postingsWithLikeStatus = await Promise.all(
        postings.map(async (post) => {
            const isLiked = await existingLike(currentUserId, post.id);
            return {
                ...post,
                is_liked: !!isLiked
            };
        })
    );

    return postingsWithLikeStatus;
}

export async function deletePosting(id: number): Promise<any> {
    return prisma.posting.delete({
        where: {
            id: id
        }
    });
}

export async function createPosting(data: { user_id: number; image_url: string; likes_count: number; title: string }): Promise<any> {
    const posting = await prisma.posting.create({
        data: data
    });
    return posting;
}

export async function updatePosting(id: number, data: Partial<CreatePostingInput>): Promise<any> {
    return prisma.posting.update({
        where: {
            id: id,
        },
        data: data,
    });
}

export async function likePosting(postingId: number, userId: number): Promise<any> {
    const IsexistingLike = await existingLike(userId,postingId);

    if (IsexistingLike) {
        // Unlike: Update deleted_at or delete the record
        // For simplicity and based on schema, we might just delete it or set deleted_at
        await prisma.like.update({
            where: { id: IsexistingLike.id },
            data: { deleted_at: new Date() }
        });

        // Decrement likes_count
        return prisma.posting.update({
            where: { id: postingId },
            data: {
                likes_count: {
                    decrement: 1
                }
            }
        });
    } else {
        // Like: Create new record
        await prisma.like.create({
            data: {
                posting_id: postingId,
                user_id: userId
            }
        });

        // Increment likes_count
        return prisma.posting.update({
            where: { id: postingId },
            data: {
                likes_count: {
                    increment: 1
                }
            }
        });
    }
}

export async function deletePostingAndLike(id: number): Promise<any> {
    return prisma.$transaction([
        // Delete ALL likes (including soft-deleted ones) to avoid foreign key constraint
        prisma.like.updateMany({
            where: {
                posting_id: id,
                deleted_at: null
            },
            data:{
                deleted_at: new Date()
            }
        }),
        prisma.posting.update({
            where: {
                id: id
            },
            data: {
                deleted_at: new Date()
            }
        })
    ])
}
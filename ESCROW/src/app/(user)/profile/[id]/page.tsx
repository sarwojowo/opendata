import ProfileClient from '../ProfileClient';
import { fetchServiceByCreatorId } from "@/lib/ServiceRepository";
import {fetchPostingProfileWithLikeStatus} from "@/lib/PostingRepository";
import {serializeBigInt} from "@/lib/serializer";
import {fetchLikeByUserId} from "@/lib/LikeRepository";
import {getCurrentUser} from "@/lib/getCurrentUser";
import { redirect, notFound } from 'next/navigation';
import {fetchCreatorByUserId} from "@/lib/CreatorRepository";
import { getUserById } from "@/lib/user";

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    const {id} = await params;
    
    if (!user) {
        redirect('/login');
    }

    const currentUserId = Number(user.id);
    const profileUserId = Number(id);

    if (isNaN(profileUserId)) {
        // console.log("dooar")
        notFound();
    }

    const profileUser = await getUserById(profileUserId);
    
    if (!profileUser) {
        // console.log("door")
        notFound();
    }

    const creatorId = await fetchCreatorByUserId(profileUserId);

    // Fetch data on server with correct like status
    const [services, postings, likes] = await Promise.all([
        creatorId ? fetchServiceByCreatorId(creatorId.id) : Promise.resolve([]),
        fetchPostingProfileWithLikeStatus(profileUserId, currentUserId),
        fetchLikeByUserId(profileUserId)
    ]);

    // Add timestamp key to force re-render on router.refresh()
    const key = Date.now();

    return (
        <ProfileClient
            key={key}
            initialUser={serializeBigInt(profileUser)}
            initialPostings={serializeBigInt(postings)}
            initialServices={serializeBigInt(services)}
            initialLikes={serializeBigInt(likes)}
            currentUserId={currentUserId}
            profileUserId={profileUserId}
            profileCreatorId={creatorId ? String(creatorId.id) : null}
        />
    );
}

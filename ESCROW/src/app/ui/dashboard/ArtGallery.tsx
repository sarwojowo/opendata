'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Art from "@/app/ui/dashboard/Art/art";
import PostingPopUp from "@/app/ui/components/PostingPopUp";
import styles from './dashboard.module.css';

interface Posting {
    id: number;
    title: string;
    image_url: string;
    likes_count?: number | null;
    is_liked?: boolean;
    user: {
        name: string;
    };
}

export default function ArtGallery({ postings }: { postings: Posting[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Posting | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleOpenModal = (post: Posting) => {
        // Check if user is authenticated before opening popup
        if (status === 'unauthenticated') {
            // User is not logged in, could show a message or redirect
            alert('Please login to view and interact with posts');
            return;
        }
        
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };

    return (
        <>
            <div className={styles.service}>
                {postings.map((post) => (
                    <Art
                        key={post.id}
                        title={post.title}
                        owner={post.user.name}
                        imageUrl={post.image_url}
                        onClick={() => handleOpenModal(post)}
                    />
                ))}
            </div>

            <PostingPopUp 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                post={selectedPost}
            />
        </>
    );
}

"use client"

import Modal from "./Modal";
import { FaRegHeart, FaHeart, FaRegTrashAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import {useRouter} from "next/navigation";

interface Posting {
    id: number;
    title: string;
    image_url: string;
    likes_count?: number | null;
    user_id?: number | bigint;
    user: {
        name: string;
    };
    is_liked?: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    post: Posting | null;
    currentUserId: number; // The logged-in user's ID
    onDelete?: () => void; // Callback after successful delete
    onLikeUpdate?: () => void; // Callback after like/unlike
}

export default function ProfilePostingPopUp({ isOpen, onClose, post, currentUserId, onDelete, onLikeUpdate }: Props) {
    const [likesCount, setLikesCount] = useState<number>(0);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        if (post) {
            setLikesCount(post.likes_count || 0);
            // ✅ is_liked comes from server with correct initial value
            setIsLiked(post.is_liked || false);
        }
    }, [post]);

    if (!post) return null;

    // Check if current user is the owner
    const isOwner = Number(post.user_id) === currentUserId;

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

        try {
            const response = await axios.post(`/api/postings/${post.id}/like`);
            if (response.data.success) {
                // Confirm with data from server
                setLikesCount(response.data.data.likes_count || 0);
                // Trigger parent component to refresh both postings and likes
                if (onLikeUpdate) {
                    onLikeUpdate();
                }
            }
        } catch (error) {
            console.error("Failed to like posting:", error);
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikesCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!isOwner) return;
        
        const confirmed = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const response = await axios.delete(`/api/postings/${post.id}`);
            if (response.data.success) {
                alert("Post deleted successfully!");
                onClose();
                if (onDelete) onDelete(); // Trigger parent refresh
            }
        } catch (error) {
            console.error("Failed to delete posting:", error);
            alert("Failed to delete post. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={post.title}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', minHeight: '400px' }}>
                {/* Left Column: Image Area */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#111', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: '1px solid #333'
                }}>
                    <img 
                        src={post.image_url}
                        alt={post.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '500px' }}
                    />
                </div>

                {/* Right Column: Info & Interaction */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 0' }}>
                    <div>
                        <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>{post.title}</h2>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                            Artist: <span style={{ color: '#f0b90b' }}>{post.user?.name || 'Unknown'}</span>
                        </p>
                        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                This artwork is part of the portfolio. You can show your appreciation by liking the post or following the artist.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                        {/* Like Button */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                            <button 
                                onClick={handleLike}
                                disabled={isLiking}
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    border: `1px solid ${isLiked ? '#ff4d4d' : '#444'}`, 
                                    borderRadius: '50%', 
                                    width: '56px', 
                                    height: '56px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    cursor: isLiking ? 'not-allowed' : 'pointer',
                                    color: isLiked ? '#ff4d4d' : '#fff',
                                    transition: 'all 0.2s ease',
                                    opacity: isLiking ? 0.6 : 1,
                                }}
                                onMouseOver={(e) => {
                                    if (!isLiking && !isLiked) {
                                        e.currentTarget.style.borderColor = '#ff4d4d';
                                        e.currentTarget.style.color = '#ff4d4d';
                                    }
                                    if (!isLiking) {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isLiked) {
                                        e.currentTarget.style.borderColor = '#444';
                                        e.currentTarget.style.color = '#fff';
                                    }
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {isLiked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
                            </button>
                            <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
                                {likesCount} Likes
                            </span>
                        </div>

                        {/* Delete Button (Only for Owner) */}
                        {isOwner && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                                <button 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    style={{ 
                                        backgroundColor: 'transparent', 
                                        border: '1px solid #ff4444',
                                        borderRadius: '50%', 
                                        width: '56px', 
                                        height: '56px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                                        color: '#ff4444',
                                        transition: 'all 0.2s ease',
                                        opacity: isDeleting ? 0.6 : 1,
                                    }}
                                    onMouseOver={(e) => {
                                        if (!isDeleting) {
                                            e.currentTarget.style.backgroundColor = '#ff4444';
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#ff4444';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <FaRegTrashAlt size={20} />
                                </button>
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
                                    Delete
                                </span>
                            </div>
                        )}
                        
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                backgroundColor: 'transparent',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                height: '56px',
                                fontWeight: 'bold'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

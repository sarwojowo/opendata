'use client';

import styles from './profile.module.css';
import Servs from '@/app/ui/profile/servs/servs';
import {useRef, useState, useEffect} from 'react';
import axios from "axios";
import { IoMdAdd, IoMdChatbubbles } from "react-icons/io";
import Modal from '@/app/ui/components/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import CreatePostModal from "@/app/ui/profile/postings/CreatePostModal";
import ProfilePostingPopUp from "@/app/ui/components/ProfilePostingPopUp";
import Art from "@/app/ui/dashboard/Art/art";
import {useRouter} from "next/navigation";
import { useChat } from '@/app/ui/chat/ChatProvider';

interface UserProfile {
  id: string
  wallet: string
  name?: string
  biodata?: string
  profile_image_url?: string
  background_image_url?: string
}

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    creator_id: string;
    creator:{
        user:{
            id: string;
            name: string;
        }
    }
}

interface Posting {
    id: number;
    title: string;
    image_url: string;
    likes_count: number | null;
    user_id?: number | bigint;
    user: {
        name: string;
    };
    is_liked?: boolean;
}

interface Like {
    id: number;
    user: {
        id: number;
        name: string;
    };
    posting: {
        id: number;
        title: string;
        image_url: string;
        likes_count: number | null;
        user_id: number;
        is_liked?: boolean;
    }
    user_id: number | string; // Serialized BigInt becomes string
    posting_id: number | string; // Serialized BigInt becomes string
}

interface FormValues {
    imageRef: File | null;
    extraNotes: string;
    isSure: boolean;
}

const BuyServiceSchema = Yup.object().shape({
    extraNotes: Yup.string().max(500, 'Notes are too long'),
    isSure: Yup.boolean().oneOf([true], 'Required'),
    imageRef: Yup.mixed().required('Reference image is required'),
});

interface Props {
    initialUser: UserProfile;
    initialPostings: Posting[];
    initialServices: Service[];
    initialLikes: Like[];
    currentUserId: number;
    profileUserId: number;
    profileCreatorId: string | null;
}

export default function ProfileClient({ initialUser, initialPostings, initialServices, initialLikes, currentUserId, profileUserId, profileCreatorId }: Props) {
    const [user, setUser] = useState<UserProfile | null>(initialUser)
    const [activeSection, setActiveSection] = useState('portfolio');
    const [services, setServices] = useState<Service[]>(initialServices);
    const [postings, setPostings] = useState<Posting[]>(initialPostings);
    const [likes, setLikes] = useState<Like[]>(initialLikes);
    const router = useRouter();
    const { openChat } = useChat();

    // Sync state when props change (after router.refresh())
    useEffect(() => {
        setPostings(initialPostings);
    }, [initialPostings]);

    useEffect(() => {
        setLikes(initialLikes);
    }, [initialLikes]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    // Post Modal state
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Posting | null>(null);

    // Create Post Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (!user) return <p>Loading profile...</p>

    const fetchPostings = async() => {
        // Refresh postings data from server
        try {
            const response = await axios.get(`/api/postings?userId=${profileUserId}&currentUserId=${currentUserId}`);
            if (response.data.success) {
                setPostings(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch postings:", error);
        }
    }

    const fetchLikes = async() => {
        // Refetch from server - call the same data the server component fetches
        router.refresh();
    }

    const handleLikeUpdate = () => {
        // Refresh server data which will trigger useEffect to update state
        router.refresh();
    }

    const handleOpenModal = (service: Service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
        setPreviewUrl(null);
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
    };

    const handleOpenPostModal = (post: Posting) => {
        setSelectedPost(post);
        setIsPostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
        setSelectedPost(null);
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
        try {
            if (!selectedService) return;

            const data = new FormData();
            data.append('serviceId', selectedService.id.toString());
            data.append('extraNotes', values.extraNotes);

            if (values.imageRef) {
                data.append('imageRef', values.imageRef);
            }

            const response = await axios.post('/api/orders', data);
            console.log("Order created:", response.data);

            handleCloseModal();
            alert("Order placed successfully!");
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to create order. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    // @ts-ignore
    return(
      <div>
          {/* Upper side with full-width background image */}
          <div className={styles.profileHeader}>
              <img src={user.background_image_url || "/Hutao.jpg"} alt="background" className={styles.backgroundImage} />
          </div>

          {/* Bottom side with page content */}
          <div className={styles.content}>
              {/* -- Left Column: Profile Sidebar -- */}
              <div className={styles.profile}>
                    <div className={styles.image_profile}>
                        <img
                        src={user.profile_image_url || "/noavatar.png"}
                        alt="profile"
                        />
                    </div>
                    <div className={styles.nameRow}>
                        <h2>{user.name || "Anonymous"}</h2>
                        {currentUserId !== profileUserId && (
                            <button
                                className={styles.chatBtn}
                                onClick={() => openChat(String(profileUserId))}
                            >
                                <IoMdChatbubbles size={24} color="white" />
                            </button>
                        )}
                    </div>

                    {/* about / biodata */}
                    <div className={styles.about}>
                        <p>{user.biodata || "Belum ada biodata."}</p>
                    </div>
                </div>

              {/* -- Right Column: Main Content -- */}
              <div className={styles.mainContent}>
                  <div className={styles.tabs}>
                      <button
                        onClick={() => setActiveSection('portfolio')}
                        className={activeSection === 'portfolio' ? styles.activeTab : ''}
                      >
                        Portfolio
                      </button>
                      <button
                        onClick={() => setActiveSection('commissions')}
                        className={activeSection === 'commissions' ? styles.activeTab : ''}
                      >
                        Commissions
                      </button>
                      <button
                        onClick={() => setActiveSection('saved')}
                        className={activeSection === 'saved' ? styles.activeTab : ''}
                      >
                        Likes
                      </button>
                  </div>
                  <hr/>

                  <div className={styles.sectionContent}>
                      {activeSection === 'portfolio' && (
                          <div className={styles.gallery}>
                              {currentUserId === profileUserId && (
                                  <button
                                      className={styles.addPostBtn}
                                      onClick={() => setIsCreateModalOpen(true)}
                                  >
                                      <IoMdAdd size={18} /> Add Post
                                  </button>
                              )}
                              {/*button for adding post */}
                              <div className={styles.art}>
                                  {postings.map(post => (
                                      <Art
                                          key={post.id}
                                          title={post.title}
                                          owner={post.user.name}
                                          imageUrl={post.image_url}
                                          hideOwner
                                          onClick={() => handleOpenPostModal(post)}
                                      />
                                  ))}
                              </div>
                              {/*<p>Displaying your amazing artworks here...</p>*/}
                          </div>
                      )}

                      {activeSection === 'commissions' && (
                          <div className={styles.commissions}>
                              {services.map((service) => {
                                  const isOwner = currentUserId === profileUserId;
                                  return (
                                      <Servs
                                          key={service.id}
                                          title={service.name}
                                          desc={service.description}
                                          price={service.price}
                                          image_url={service.image_url}
                                          onClick={isOwner ? undefined : () => handleOpenModal(service)}
                                          onClickBuy={isOwner ? undefined : () => handleOpenModal(service)}
                                          onClickChat={isOwner ? undefined : () => openChat(service.creator.user.id)}
                                          hideActions={isOwner}
                                      />
                                  );
                              })}
                          </div>
                      )}

                      {activeSection === 'saved' && (
                          <div className={styles.saved}>
                              {likes.map((like) => (
                                  <Art
                                      key={like.id}
                                      title={like.posting.title}
                                      owner={like.user.name}
                                      imageUrl={like.posting.image_url}
                                      onClick={() => handleOpenPostModal(like.posting as Posting)}
                                  />
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Modal Implementation */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedService?.name}
          >
            {selectedService && (
                <Formik
                    initialValues={{
                        extraNotes: '',
                        imageRef: null,
                        isSure: false
                    }}
                    validationSchema={BuyServiceSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue, isSubmitting, isValid, dirty, errors, touched }) => (
                        <Form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: '400px' }}>
                            {/* Left Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Service Image</label>
                                    <img
                                        src={selectedService.image_url}
                                        alt={selectedService.name}
                                        style={{ width: '100%', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover' }}
                                    />
                                </div>
                                {previewUrl && (
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Your Reference Image</label>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{ width: '100%', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover', border: '2px solid #f0b90b' }}
                                        />
                                    </div>
                                )}
                                <div>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{selectedService.description}</p>
                                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#f0b90b' }}>{selectedService.price} ETH</p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                                        Upload Image Reference {errors.imageRef && touched.imageRef && <span style={{color: 'red'}}>*</span>}
                                    </label>
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.currentTarget.files?.[0] ?? null;
                                            setFieldValue("imageRef", file);

                                            if (previewUrlRef.current) {
                                                URL.revokeObjectURL(previewUrlRef.current);
                                            }

                                            if (file) {
                                                const newUrl = URL.createObjectURL(file);
                                                previewUrlRef.current = newUrl;
                                                setPreviewUrl(newUrl);
                                            } else {
                                                previewUrlRef.current = null;
                                                setPreviewUrl(null);
                                            }
                                        }}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.5rem', 
                                            backgroundColor: '#222', 
                                            border: '1px solid #444', 
                                            borderRadius: '4px',
                                            color: '#fff',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    {errors.imageRef && touched.imageRef && (
                                        <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.imageRef as string}</div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                                        Extra Notes
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="extraNotes"
                                        placeholder="Add any special requirements..."
                                        style={{ 
                                            width: '100%', 
                                            height: '100px',
                                            padding: '0.5rem', 
                                            backgroundColor: '#222', 
                                            border: '1px solid #444', 
                                            borderRadius: '4px',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            resize: 'none'
                                        }}
                                    />
                                    {errors.extraNotes && touched.extraNotes && (
                                        <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.extraNotes as string}</div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                                    <Field 
                                        type="checkbox" 
                                        name="isSure" 
                                        id="isSure"
                                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                    />
                                    <label htmlFor="isSure" style={{ fontSize: '0.9rem', color: '#ccc', cursor: 'pointer' }}>
                                        I am sure about this purchase
                                    </label>
                                </div>
                                {errors.isSure && touched.isSure && (
                                    <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.isSure as string}</div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isValid || !dirty}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: (isValid && dirty) ? '#f0b90b' : '#333',
                                            color: (isValid && dirty) ? '#000' : '#666',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: (isValid && dirty) ? 'pointer' : 'not-allowed',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Buy Now'}
                                    </button>
                                    {currentUserId !== profileUserId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (selectedService) {
                                                    openChat(selectedService.creator.user.id);
                                                    handleCloseModal();
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                backgroundColor: '#393e46',
                                                color: '#eeeeee',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Chat
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        style={{
                                            flex: 0.5,
                                            padding: '0.75rem',
                                            backgroundColor: 'transparent',
                                            color: '#fff',
                                            border: '1px solid #444',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
          </Modal>

          {/* Post Modal - Using ProfilePostingPopUp with delete functionality */}
          <ProfilePostingPopUp 
            isOpen={isPostModalOpen}
            onClose={handleClosePostModal}
            post={selectedPost}
            currentUserId={currentUserId}
            onDelete={fetchPostings}
            onLikeUpdate={handleLikeUpdate}
          />

          <CreatePostModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={fetchPostings}
          />
      </div>
    );
}

"use client"

import { useState, useRef } from 'react';
import Modal from '@/app/ui/components/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const CreatePostSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').max(100, 'Title is too long'),
    image: Yup.mixed().required('Image is required'),
});

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreatePostModal({ isOpen, onClose, onSuccess }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('image', values.image);

            // Assuming you have a POST endpoint for postings
            await axios.post('/api/postings', formData);
            
            // alert('Post created successfully!');
            // resetForm();
            // setPreviewUrl(null);
            // onSuccess();
            // onClose();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Post">
            <Formik
                initialValues={{ title: '', image: null }}
                validationSchema={CreatePostSchema}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue, isSubmitting, errors, touched }) => (
                    <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Title</label>
                            <Field
                                name="title"
                                placeholder="Enter a title for your artwork..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#222',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                            {errors.title && touched.title && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.title as string}</div>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Artwork Image</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    border: '2px dashed #444',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    backgroundColor: '#111'
                                }}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: '#666' }}>Click to upload image</span>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    const file = e.currentTarget.files?.[0];
                                    if (file) {
                                        setFieldValue('image', file);
                                        setPreviewUrl(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            {errors.image && touched.image && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.image as string}</div>}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: '#f0b90b',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? 'Posting...' : 'Post Artwork'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
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
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

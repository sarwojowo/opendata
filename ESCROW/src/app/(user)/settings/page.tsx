'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './settings.module.css';
import Skeleton from '@/app/ui/components/Skeleton';

export default function GeneralSettings() {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState('Profile');

    const profileInputRef = useRef<HTMLInputElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                if (!res.ok) throw new Error('Failed to load settings');
                const data = await res.json();
                setName(data.name ?? '');
                setBio(data.biodata ?? '');
                setProfilePreview(data.profile_image_url ?? null);
                setBackgroundPreview(data.background_image_url ?? null);
            } catch (err: any) {
                setToast({ message: err.message || 'Failed to load settings.', type: 'error' });
            } finally {
                setIsFetching(false);
            }
        }
        fetchSettings();
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        return data.ipfsHash as string;
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const performSave = async () => {
        setShowConfirm(false);
        setIsSaving(true);

        try {
            let profile_image_url: string | undefined;
            let background_image_url: string | undefined;

            if (profileImageFile) {
                profile_image_url = await uploadImage(profileImageFile);
            }
            if (backgroundImageFile) {
                background_image_url = await uploadImage(backgroundImageFile);
            }

            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    biodata: bio,
                    ...(profile_image_url && { profile_image_url }),
                    ...(background_image_url && { background_image_url }),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? 'Failed to save settings');
            }

            setProfileImageFile(null);
            setBackgroundImageFile(null);
            setToast({ message: 'Profile updated successfully.', type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to save settings.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'background') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'profile') {
                setProfileImageFile(file);
                setProfilePreview(reader.result as string);
            } else {
                setBackgroundImageFile(file);
                setBackgroundPreview(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const menuItems = [
        { title: "Profile", icon: "👤" },
        { title: "Account", icon: "🔒" },
    ];

    return (
        <>
        <div className={styles.container}>
            <aside className={styles.menu}>
                <ul className={styles.list}>
                    {menuItems.map((item) => (
                        <li key={item.title} className={styles.listItem}>
                            <button
                                className={`${styles.link} ${activeTab === item.title ? styles.linkActive : ''}`}
                                onClick={() => setActiveTab(item.title)}
                            >
                                <span style={{ marginRight: '10px' }}>{item.icon}</span>
                                {item.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            <main className={styles.content}>
                <div className={styles.section}>
                    <h2 className={styles.title}>{activeTab} Settings</h2>

                    {activeTab === 'Profile' ? (
                        isFetching ? (
                            <SettingsSkeleton />
                        ) : (
                            <form onSubmit={handleSave} className={styles.form}>

                                <div className={styles.imageUploadGrid}>
                                    <div className={styles.imageBox}>
                                        <label className={styles.label}>Profile Picture</label>
                                        <div
                                            className={`${styles.previewWrapper} ${styles.profile}`}
                                            onClick={() => profileInputRef.current?.click()}
                                        >
                                            {profilePreview ? (
                                                <img src={profilePreview} alt="Profile Preview" className={styles.previewImage} />
                                            ) : (
                                                <div className={styles.placeholder}>
                                                    <span>📷</span>
                                                    <p>Upload</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={profileInputRef}
                                            className={styles.fileInput}
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'profile')}
                                        />
                                    </div>

                                    <div className={styles.imageBox}>
                                        <label className={styles.label}>Background Image</label>
                                        <div
                                            className={`${styles.previewWrapper} ${styles.background}`}
                                            onClick={() => backgroundInputRef.current?.click()}
                                        >
                                            {backgroundPreview ? (
                                                <img src={backgroundPreview} alt="Background Preview" className={styles.previewImage} />
                                            ) : (
                                                <div className={styles.placeholder}>
                                                    <span>🖼️</span>
                                                    <p>Click to upload cover image</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={backgroundInputRef}
                                            className={styles.fileInput}
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'background')}
                                        />
                                    </div>
                                </div>

                                <div className={styles.item}>
                                    <label htmlFor="name" className={styles.label}>Display Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={styles.input}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div className={styles.item}>
                                    <label htmlFor="bio" className={styles.label}>Bio</label>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className={styles.textarea}
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <button type="submit" className={styles.button} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        )
                    ) : (
                        <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px' }}>
                            Section &quot;{activeTab}&quot; is coming soon.
                        </div>
                    )}
                </div>
            </main>
        </div>

        {/* Confirm Dialog */}
        {showConfirm && (
            <div className={styles.confirmOverlay}>
                <div className={styles.confirmBox}>
                    <p className={styles.confirmText}>Are you sure you want to save these changes?</p>
                    <div className={styles.confirmButtons}>
                        <button className={styles.confirmYes} onClick={performSave}>Yes, Save</button>
                        <button className={styles.confirmNo} onClick={() => setShowConfirm(false)}>No, Cancel</button>
                    </div>
                </div>
            </div>
        )}

        {/* Toast */}
        {toast && (() => {
            const t = toast;
            return (
                <div className={`${styles.toast} ${t.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
                    {t.message}
                </div>
            );
        })()}
        </>
    );
}

function SettingsSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Skeleton variant="text" width="100px" />
                    <Skeleton variant="circle" width={150} height={150} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Skeleton variant="text" width="130px" />
                    <Skeleton width="100%" height="160px" style={{ borderRadius: '12px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton variant="text" width="110px" />
                <Skeleton variant="input" width="100%" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton variant="text" width="40px" />
                <Skeleton width="100%" height="100px" style={{ borderRadius: '8px' }} />
            </div>
            <Skeleton variant="button" />
        </div>
    );
}

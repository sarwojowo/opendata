import Skeleton from '@/app/ui/components/Skeleton';
import styles from './profile.module.css';

export default function ProfileLoading() {
    return (
        <div>
            {/* Banner */}
            <Skeleton variant="banner" />

            <div className={styles.content}>
                {/* Left: profile sidebar */}
                <div className={styles.profile}>
                    <div className={styles.image_profile}>
                        <Skeleton variant="circle" width={160} height={160} />
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <Skeleton variant="text" width="140px" height="18px" />
                        <Skeleton variant="text" width="180px" />
                        <Skeleton variant="text" width="160px" />
                    </div>
                </div>

                {/* Right: main content */}
                <div className={styles.mainContent}>
                    {/* Tabs */}
                    <div className={styles.tabs} style={{ gap: '15px' }}>
                        <Skeleton width="80px" height="36px" style={{ borderRadius: '6px' }} />
                        <Skeleton width="100px" height="36px" style={{ borderRadius: '6px' }} />
                        <Skeleton width="60px" height="36px" style={{ borderRadius: '6px' }} />
                    </div>
                    <hr />

                    {/* Art grid placeholders */}
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', paddingTop: '20px' }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} width="180px" height="180px" style={{ borderRadius: '10px' }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

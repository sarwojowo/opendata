import Skeleton from '@/app/ui/components/Skeleton';
import styles from './settings.module.css';

export default function SettingsLoading() {
    return (
        <div className={styles.container}>
            {/* Sidebar skeleton */}
            <aside className={styles.menu}>
                <ul className={styles.list} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Skeleton width="100%" height="44px" style={{ borderRadius: '8px' }} />
                    <Skeleton width="100%" height="44px" style={{ borderRadius: '8px' }} />
                </ul>
            </aside>

            {/* Content skeleton */}
            <main className={styles.content}>
                <div className={styles.section}>
                    <Skeleton variant="text" width="160px" height="28px" style={{ marginBottom: '24px' }} />
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
                </div>
            </main>
        </div>
    );
}

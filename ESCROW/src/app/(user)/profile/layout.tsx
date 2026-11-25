import styles from './profile.module.css'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.wrapper}>
            {children}
        </div>
    );
}

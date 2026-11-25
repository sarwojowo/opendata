"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../settings/settings.module.css';

const SettingsMenu = [
    {
        title: "Commission",
        path: "/dashboard/commission",
    },
    {
        title: "Services",
        path: "/dashboard/services",
    },
    {
        title: "History",
        path: "/dashboard/history",
    }
];

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className={styles.container}>
            <aside className={styles.menu}>
                <ul className={styles.list}>
                    {SettingsMenu.map((item) => (
                        <li key={item.path} className={styles.listItem}>
                            <Link 
                                href={item.path} 
                                className={`${styles.link} ${pathname === item.path ? styles.linkActive : ''}`}
                            >
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}

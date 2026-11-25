'use client';

import { usePathname } from 'next/navigation';
import styles from '.././ui/page.module.css';
import Navbar from '@/app/ui/dashboard/Navbar/navbar';
import {Suspense} from 'react';
import {Toaster} from "react-hot-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isProfilePage = pathname === '/profile' || pathname.startsWith('/profile/');

    return (
        <div>
            <Toaster position="bottom-left"/>
            {/*/!*Navbar*!/*/}
            <div className={styles.navbar}>
                <Suspense fallback={<div>Loading...</div>}>
                    <Navbar />
                </Suspense>
            </div>
            {/*Core*/}
            <div className={isProfilePage ? undefined : styles.content}>
                {children}
            </div>
        </div>
    );
}
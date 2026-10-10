import { APP_VERSION } from '@/lib/constant';
import { type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

type Props = {};

const MainLayout: FC<Props> = () => {
    return (
        <>
            <main className='flex flex-col w-full max-w-[1080px] mx-auto font-jakarta text-sm lg:text-4xl relative'>
                <Outlet />

                <div className='absolute bottom-6 right-7 lg:bottom-12 lg:right-14 font-semibold text-zinc-400 text-xs lg:text-3xl cursor-pointer z-0' onDoubleClick={() => window.location.reload()}>{APP_VERSION}</div>
            </main>

            <ScrollRestoration />
        </>
    );
}

export default MainLayout;
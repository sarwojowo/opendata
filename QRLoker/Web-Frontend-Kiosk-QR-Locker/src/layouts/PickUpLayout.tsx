import { type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

type Props = {};

const PickupLayout: FC<Props> = () => {
    return (
        <>
            <main className='flex flex-col w-full max-w-[1080px] mx-auto font-jakarta text-4xl relative'>
                <Outlet />
            </main>

            <ScrollRestoration />
        </>
    );
}

export default PickupLayout;
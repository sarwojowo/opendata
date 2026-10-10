import { type FC } from 'react';
import TruckLoader from './TruckLoader';

type Props = {};

const FullLoader: FC<Props> = () => {
    return (
        <>
            <div className='z-[99999] fixed inset-0 w-full h-screen overflow-hidden bg-white/30 backdrop-blur-sm'>
                <TruckLoader />
            </div>
        </>
    );
}

export default FullLoader;
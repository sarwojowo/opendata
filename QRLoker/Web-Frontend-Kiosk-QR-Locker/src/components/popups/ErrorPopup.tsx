import { type FC } from 'react';
import ErrorIC from '@/assets/img/error.svg'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Button } from '../ui/button';

type Props = {
    title?: string
    desc?: string
    other_msg?: string
    error_ic?: any
    btn_title?: any
    onClick?: () => any
};

const ErrorPopup: FC<Props> = ({ title, desc, other_msg, error_ic, btn_title, onClick }) => {
    return (
        <>
            <div className='z-50 fixed inset-0 w-full h-screen overflow-hidden bg-black/40 backdrop-blur-sm flex-center px-8 lg:px-20'>
                <div className='bg-white rounded-xl lg:rounded-[40px] p-10 lg:p-24 py-12 lg:py-28 w-full'>
                    <div className='space-y-6 lg:space-y-16 flex-center flex-col text-center'>
                        <LazyLoadImage alt='error' className='w-8/12 lg:w-1/2' src={error_ic || ErrorIC} />
                        <div>
                            <div className='text-lg lg:text-5xl font-bold leading-tight text-center'>{title || 'Ups, transaksi gagal!'}</div>
                            <div className='text-sm lg:text-4xl my-2 lg:my-6 font-medium text-center leading-tight'>{desc || 'Ada kesalahan nih di transaksi kamu, silakan coba lagi ya!'}</div>
                            <div className='text-xs lg:text-[26px] text-muted-foreground italic'>{other_msg || ''}</div>
                        </div>
                        <Button className='w-full' onClick={onClick}>{btn_title || 'Kembali'}</Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ErrorPopup;
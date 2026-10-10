import { type FC } from 'react';
import ConfirmIC from '@/assets/img/question.svg'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

type Props = {
    title?: string
    desc?: string
    other_msg?: string
    yes_title?: any
    no_title?: any
    onYes?: () => any
    onNo?: () => any
    icon?: any
    isLoading?: boolean
};

const ConfirmPopup: FC<Props> = ({ icon, title, desc, other_msg, yes_title, no_title, onYes, onNo, isLoading }) => {
    return (
        <>
            <div className='z-50 fixed inset-0 w-full h-screen overflow-hidden bg-black/40 backdrop-blur-sm flex-center px-8 lg:px-20'>
                <div className='bg-white rounded-xl lg:rounded-[40px] p-10 lg:p-24 py-12 lg:py-28 w-full'>
                    <div className='space-y-4 lg:space-y-16 flex-center flex-col text-center'>
                        <LazyLoadImage alt='error' className='w-10/12 lg:w-2/3 rounded-3xl' src={icon || ConfirmIC} />
                        <div>
                            <div className='text-lg lg:text-5xl font-bold leading-tight text-center pt-3 lg:pt-0'>{title || 'Apakah kamu yakin?'}</div>
                            <div className='text-sm lg:text-4xl my-3 lg:my-6 font-medium text-center leading-tight'>{desc}</div>
                            <div className='text-xs lg:text-[26px] text-muted-foreground italic'>{other_msg || ''}</div>
                        </div>
                        <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6'>
                            <Button onClick={onNo} variant='outline' disabled={isLoading}>{no_title || 'Tidak'}</Button>
                            <Button onClick={onYes} disabled={isLoading}>{isLoading ? <Loader2 className='lg:size-16 animate-spin' /> : null} {yes_title || 'Ya, saya yakin'}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ConfirmPopup;
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ScreenSaver from '@/assets/img/screensaver/select-station.webp'
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import BottomSheetStation from '@/components/BottomSheetStation';
import { Button } from '@/components/ui/button';
import { useStationStore } from '@/stores/useStationStore';

export default function SelectStationPage() {
    const [isOpen, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()
    const station = useStationStore((state) => state.station);
    const timerRef = useRef<any>(null);

    const handleHome = () => {
        setIsLoading(true)
        navigate('/home')
    }


    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                navigate("/");
            }, 20000); // 20 seconds
        };

        // List of events to consider as interaction
        const events = ["mousedown", "touchstart", "keydown"];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer(); // Start timer on mount

        return () => {
            clearTimeout(timerRef?.current);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [navigate]);

    return (
        <>
            <div className="w-full h-screen flex flex-col overflow-hidden" >
                <div className='w-full h-[45vh] relative'>
                    <LazyLoadImage src={ScreenSaver} alt='screensaver' className='w-full h-full object-cover' />
                    <div className='w-full h-full absolute inset-0 bg-gradient-to-t from-black/80 to-black/10' />
                    <div className='absolute top-28 lg:top-52 left-6 lg:left-16 z-10 text-white w-full space-y-4 lg:space-y-8'>
                        <div onDoubleClick={() => navigate('/pick-up')}>#OnTheGoShopping</div>
                        <div className='w-9/12 lg:w-10/12 text-3xl lg:text-8xl font-bold leading-snug lg:leading-tight'>
                            Pilih stasiun tujuan kamu dulu yuk sebelum mulai
                        </div>
                    </div>
                </div>
                <div className='bg-white relative h-3 lg:h-8 w-full'>
                    <div className='bg-teal-800 h-3 lg:h-8 w-full'></div>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className='h-full w-full flex flex-col relative px-6 lg:px-16 pt-8 lg:pt-20 gap-4 lg:gap-8'>
                        <div className="outline-none bg-white border-2 border-border w-full h-12 lg:h-32 rounded-lg lg:rounded-4xl focus:border-primary duration-300 lg:focus:ring-2 focus:ring-primary flex justify-between items-center px-4 lg:px-12" onClick={() => setOpen(true)}>
                            <p>{station ? station.name : 'Pilih stasiun tujuan kamu'}</p>
                            <ChevronDown className="lg:size-12" />
                        </div>
                        <div className='text-xs lg:text-3xl lg:leading-tight'>Kami akan menampilkan rekomendasi barang yang ada di stasiun tujuan kamu jadi kamu tidak perlu susah untuk mencari barang yang kamu mau</div>
                    </div>
                    <div className='z-10 p-6 lg:p-16'>
                        <Button className='w-full' disabled={!station || isLoading} onClick={handleHome}>{isLoading ? <Loader2 className='animate-spin lg:size-16 lg:mr-4' /> : null} Selanjutnya</Button>
                    </div>
                </div>
            </div>

            <BottomSheetStation isOpen={isOpen} onClose={() => setOpen(false)} />
        </>
    );
}
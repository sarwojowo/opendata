import ScanQRIC from '@/assets/img/scan-qr.png'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ShoppingCart } from 'lucide-react';
import FullLoader from '@/components/loader/FullLoader';

export default function PickUpHomePage() {
    const [isFullLoading, setIsFullLoading] = useState(false)
    const [qrInput, setQRInput] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const navigate = useNavigate()

    useEffect(() => {
        const input = inputRef.current;

        const focusInput = () => input?.focus();

        // Initial focus
        setTimeout(focusInput, 250);

        // Re-focus on blur
        input?.addEventListener('blur', focusInput);

        return () => {
            input?.removeEventListener('blur', focusInput);
        };
    }, []);

    const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()

        // window.location.href = '/pick-up/verification?trxid=' + qrInput
        handleMove('/pick-up/verification?trxid=' + qrInput)
        setQRInput('')
        inputRef.current?.focus()
    }

    const handleMove = (path: string) => {
        setIsFullLoading(true)
        navigate(path)
    }

    return (
        <>
            {/* <div className="w-full h-screen bg-white flex-center p-24">
                <div className="bg-white rounded-4xl flex-center flex-col h-full p-16 space-y-28">
                    <h1 className="text-7xl text-center font-semibold leading-tight">Pindai <span className='text-primary'>QR Code</span> Pesanan Kamu</h1>
                    <p className="text-center font-medium text-4xl">Arahakan QR Code pada struk pesanan kamu ke area pemindai di bawah.</p>
                    <LazyLoadImage alt='scanner' src={ScannerIC} className='w-full' />
                </div>
            </div> */}
            <div className="w-full h-screen font-medium">
                <header className="grid grid-cols-12 items-center text-5xl font-semibold gap-8 px-16 pt-14">
                    <div className="col-span-3" onDoubleClick={() => handleMove('/')}>
                        <div className='size-20 rounded-3xl flex items-center justify-center bg-primary text-white'>
                            <ShoppingCart className="size-12" />
                        </div>
                    </div>
                    <h1 className='col-span-6 justify-self-center font-bold text-[42px]'>Pengambilan Barang</h1>
                    <div className='col-span-3 justify-self-end underline text-primary text-3xl font-bold'></div>
                </header >

                <div className='text-7xl font-semibold px-24 pt-28 space-y-16'>
                    <div className='w-4/5 leading-tight'>Siap Mengambil Pesanan Kamu?</div>
                    <p className="text-4xl leading-tight">Arahakan <strong className='text-primary'>QR Code</strong> pada struk pesanan kamu ke area pemindai di bawah.</p>
                </div>
                <LazyLoadImage alt='logo' src={ScanQRIC} className='w-full' onDoubleClick={() => handleMove('/app-config')} />
                <div className='flex-center pt-[6.5rem]'>Butuh Bantuan ? <Link to='#' className='text-primary font-semibold underline ml-2'>Sentuh di sini</Link>.</div>
            </div >

            <form onSubmit={handleSubmit} className='absolute bottom-0 left-0 opacity-0'>
                <input ref={inputRef} name='qr_input' autoFocus value={qrInput} onChange={(e) => setQRInput(e.target.value)} autoComplete='false' />
            </form>
            {isFullLoading ? <FullLoader /> : null}
        </>
    );
}
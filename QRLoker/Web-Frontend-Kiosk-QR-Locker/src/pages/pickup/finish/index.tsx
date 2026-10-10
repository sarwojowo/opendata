import { LazyLoadImage } from "react-lazy-load-image-component";
import CheckIC from '@/assets/img/check-success.svg'
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function FinishOrderPage() {
    const [timeoutCountdown, setTimeoutCountdown] = useState(31);

    const [searchParams] = useSearchParams()
    const trxid = searchParams.get('trxid')
    const loker = searchParams.get('loker')
    const isMobile = searchParams.get('is_mobile')

    const navigate = useNavigate()
    const timeoutRef = useRef<any>(null);

    const handleBackToHome = () => {
        navigate(isMobile ? '/' : '/pick-up', { replace: true })
    }

    useEffect(() => {
        timeoutRef.current = setInterval(() => {
            setTimeoutCountdown((prev) => (prev > 0 ? prev - 1 : prev));
        }, 1000);

        return () => {
            clearInterval(timeoutRef.current!);
        }
    }, []);

    useEffect(() => {
        if (timeoutCountdown <= 0) {
            handleBackToHome()
            // window.location.reload()
        }
    }, [timeoutCountdown, navigate, isMobile]);

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <header className="sticky top-0 z-20 bg-white border-b-2 border-border flex-center px-16 h-44">
                    <h1 className='col-span-6 justify-self-center font-bold text-[42px]'>Transaksi Berhasil</h1>
                </header>

                <div className="flex flex-col items-center gap-20 mt-28 px-20 pb-24 mb-20">
                    <LazyLoadImage alt="check" src={CheckIC} className="w-96" />
                    <div className="text-center space-y-8">
                        <div className="text-5xl font-bold">Terima Kasih!</div>
                        <div className="text-[42px] leading-tight">Pesanan kamu telah diambil. Pastikan semua barang kamu sudah diambil dan jangan sampai ada yang tertinggal yaa!</div>
                    </div>

                    <div className="w-full space-y-10">
                        <div className="w-full flex justify-between items-center">
                            <div className='space-y-4'>
                                <div className='font-normal text-muted-foreground'>Nomor Pesanan</div>
                                <div className='font-bold'>{trxid}</div>
                            </div>
                            <div className='font-bold text-3xl text-primary'>Salin kode</div>
                        </div>
                        <div className="w-full flex justify-between items-center">
                            <div className='space-y-4'>
                                <div className='font-normal text-muted-foreground'>Loker</div>
                                <div className='font-bold'>{loker}</div>
                            </div>
                            <div className='font-bold text-3xl text-primary'>Salin kode</div>
                        </div>
                    </div>

                </div>
                <div className='w-full flex flex-col gap-12 p-16 mt-auto'>
                    <Button variant='outline' className='font-semibold' onClick={handleBackToHome}>Kembali ke Menu Utama</Button>
                    <div className="italic text-2xl flex items-start w-full gap-3">Durasi layar <strong>{timeoutCountdown}</strong></div>
                </div>
            </div>

        </>
    );
}
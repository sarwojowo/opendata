import { LazyLoadImage } from "react-lazy-load-image-component";
import CheckIC from '@/assets/img/check-success.svg'
import { useCartStore } from "@/stores/useCartStore";
import { useShallow } from "zustand/shallow";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatRupiah } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { useAppConfigStore } from "@/stores/useAppConfigStore";
import { useStationStore } from "@/stores/useStationStore";
import axios from "@/lib/axios";

export default function FinishOrderPage() {
    const [timeoutCountdown, setTimeoutCountdown] = useState(31);

    const navigate = useNavigate()
    const timeoutRef = useRef<any>(null);

    const serviceFee = useAppConfigStore((state) => state.serviceFee);
    const { item_checkout, clearCart } = useCartStore(
        useShallow((state) => ({
            item_checkout: state.item_checkout,
            clearCart: state.clearCart,
        }))
    );
    const transaction = useTransactionStore((state) => state.transaction);
    const setStation = useStationStore((state) => state.setStation);

    const totalPrice = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.disc_price * item.quantity!, 0);
    }, [item_checkout]);

    const originalPrice = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.price * item.quantity!, 0);
    }, [item_checkout]);

    const totalItem = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.quantity!, 0);
    }, [item_checkout]);

    const handleBackToBrowseProduct = () => {
        navigate('/browse-product', { replace: true })
    }

    const handleBackToHome = () => {
        navigate('/', { replace: true })
    }

    useEffect(() => {
        timeoutRef.current = setInterval(() => {
            setTimeoutCountdown((prev) => (prev > 0 ? prev - 1 : prev));
        }, 1000);

        return () => {
            setStation(undefined)
            clearCart()
            clearInterval(timeoutRef.current!);
        }
    }, []);

    useEffect(() => {
        if (timeoutCountdown <= 0) {
            navigate('/', { replace: true });
        }
    }, [timeoutCountdown, navigate]);

    useEffect(() => {
        async function submitTrxDuration() {
            try {
                await axios.get(`/kiosk/transaction/${transaction?.pickupCode}/duration`)
            } catch (error) {
                console.log(error)
            }
        }

        submitTrxDuration()
    }, [])

    return (
        <>
            <header className="sticky top-0 z-20 bg-white border-b-2 border-border flex-center px-6 lg:px-16 h-20 lg:h-44">
                <h1 className='col-span-6 justify-self-center font-bold text-base lg:text-[42px]'>Transaksi Berhasil</h1>
            </header>

            <div className="flex flex-col items-center gap-8 lg:gap-20 mt-12 lg:mt-28 px-6 lg:px-16 pb-10 lg:pb-24 mb-20">
                <LazyLoadImage alt="check" src={CheckIC} className="w-40 lg:w-96" />
                <div className="text-center space-y-3 lg:space-y-8">
                    <div className="text-lg lg:text-5xl font-bold">Pembayaran berhasil!</div>
                    <div className="text-base lg:text-[42px]">Jangan lupa ambil QR code kamu yaa</div>
                </div>
                <div className="w-full space-y-4 lg:space-y-8">
                    <div className="w-full flex justify-between items-center">
                        <div className='space-y-1 lg:space-y-4'>
                            <div className='font-normal text-muted-foreground'>Kode Pesanan</div>
                            <div className='font-bold'>{transaction?.pickupCode}</div>
                        </div>
                        <div className='font-bold text-xs lg:text-3xl text-primary'>Salin kode</div>
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <div className='space-y-1 lg:space-y-4'>
                            <div className='font-normal text-muted-foreground'>Kode Loker</div>
                            <div className='font-bold'>[{transaction?.locker.code}] {transaction?.locker.name}</div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-5 lg:gap-12">
                    <div className='font-bold'>Ringkasan belanja</div>
                    <div className='space-y-3 lg:space-y-8'>
                        <div className='flex justify-between items-center'>
                            <div className='text-muted-foreground'>Total Harga ({totalItem}) Barang</div>
                            {item_checkout.find(item => item.discount > 0) ?
                                <div className="flex items-center gap-1 lg:gap-4">
                                    <div className="text-xs lg:text-2xl line-through text-muted-foreground">{formatRupiah(originalPrice)}</div>
                                    <div className="font-bold">{formatRupiah(totalPrice)}</div>
                                </div>
                                :
                                <div className='font-bold'>{formatRupiah(totalPrice)}</div>
                            }
                        </div>
                        <div className='flex justify-between items-center'>
                            <div className='text-muted-foreground'>Biaya Layanan</div>
                            <div className='font-bold'>{formatRupiah(serviceFee)}</div>
                        </div>
                        <div className='flex justify-between items-center'>
                            <div className='text-muted-foreground'>Total Bayar</div>
                            <div className='font-bold'>{formatRupiah(totalPrice + serviceFee)}</div>
                        </div>
                    </div>
                </div>
                <div className='w-full flex flex-col gap-5 lg:gap-12'>
                    <Button className='font-semibold' onClick={handleBackToBrowseProduct}>Beli barang lainnya</Button>
                    <Button variant='outline' className='font-semibold' onClick={handleBackToHome}>Kembali ke Menu Utama</Button>
                </div>

                <div className="italic text-xs lg:text-2xl flex items-start w-full gap-3">Durasi layar <strong>{timeoutCountdown}</strong></div>
            </div>

        </>
    );
}
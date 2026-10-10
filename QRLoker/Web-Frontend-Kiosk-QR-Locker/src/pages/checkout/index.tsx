import ArrowLeftIC from '@/assets/img/vector-icon/arrow-left.svg'
import { Button } from '@/components/ui/button';
import { PAYMENT_LIST } from '@/lib/data';
import { formatRupiah, groupProductsByMerchant } from '@/lib/helper';
import { useCartStore } from '@/stores/useCartStore';
import { useEffect, useMemo, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import EmptyCartIC from '@/assets/img/empty-cart.svg';
import { Loader2, MapPin } from 'lucide-react';
import { useStationStore } from '@/stores/useStationStore';
import { useAppConfigStore } from '@/stores/useAppConfigStore';
import { websocket } from '@/lib/socket';
import ErrorPopup from '@/components/popups/ErrorPopup';
import ErrorIC from '@/assets/img/credit-card.svg'


export default function CheckoutPage() {
    const [selectedPayment, setSelectedPayment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isWWSConnected, setIsWWSConnected] = useState(websocket.readyState === WebSocket.OPEN)
    const [error, setError] = useState({
        title: "",
        desc: "",
        other_msg: ''
    })

    const navigate = useNavigate()
    const station = useStationStore((state) => state.station);
    const serviceFee = useAppConfigStore((state) => state.serviceFee);
    const { item_checkout } = useCartStore(
        useShallow((state) => ({
            item_checkout: state.item_checkout,
        }))
    );

    const groupedData = groupProductsByMerchant(item_checkout)

    const totalPrice = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.disc_price * item.quantity!, 0);
    }, [item_checkout]);

    const originalPrice = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.price * item.quantity!, 0);
    }, [item_checkout]);

    const totalItem = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.quantity!, 0);
    }, [item_checkout]);

    useEffect(() => {

        const initSendCommand = () => {
            if (websocket.readyState === WebSocket.OPEN) {
                console.log("WS OPEN")
                setIsWWSConnected(true)
            } else if (websocket.readyState === WebSocket.CONNECTING) {
                console.log("WS CONNECTING")
                websocket.addEventListener('open', () => {
                    console.log("WS OPEN")
                    setIsWWSConnected(true)
                }, { once: true });
            } else {
                console.log("WS CLOSED")
                setIsWWSConnected(false)
            }
        };

        initSendCommand();

        const handleWSError = () => {
            console.log("WS ERROR")
            setIsWWSConnected(false)
        };

        const handleWSClose = () => {
            console.log("WS CLOSED")
            setIsWWSConnected(false)
        };

        websocket.addEventListener('error', handleWSError);
        websocket.addEventListener('close', handleWSClose);

        return () => {
            websocket.removeEventListener('error', handleWSError);
            websocket.removeEventListener('close', handleWSClose);
            websocket.onmessage = null;
        };
    }, [websocket]);

    const handleCheckout = () => {
        if (selectedPayment === 'KMT' && !isWWSConnected) {
            setError({
                title: "Metode pembayaran KMT tidak dapat digunakan",
                desc: "Silahkan pilih metode pembayaran lain atau coba lagi beberapa saat",
                other_msg: ''
            })
            return
        }

        setIsLoading(true)

        if (selectedPayment === 'KMT') {
            navigate('/payment-kmt')
        } else if (selectedPayment === 'QRIS') {
            navigate('/payment-qris')
        } else {
            return
        }
    }
    return (
        <>
            <header className="sticky top-0 z-20 bg-white border-b-2 border-border grid grid-cols-12 items-center px-6 lg:px-16 h-20 lg:h-44">
                <button className="col-span-3" onClick={() => navigate(-1)}>
                    <img alt="arrow-left" src={ArrowLeftIC} className='w-6 lg:w-16' />
                </button>
                <div className='col-span-6 justify-self-center font-bold text-base lg:text-[42px]'>Check out</div>
                <div className='col-span-3 justify-self-end underline text-primary text-3xl font-bold'></div>
            </header>

            {item_checkout?.length && item_checkout?.length > 0 ?
                <div className="flex flex-col gap-8 lg:gap-20 mt-8 lg:mt-16 px-6 lg:px-16 pb-10 lg:pb-24 mb-40 lg:mb-80">
                    <div className='space-y-1 lg:space-y-4'>
                        <div className='text-xs lg:text-[26px]'>Ambil barang di</div>
                        <div className='lg:text-3xl font-bold flex'><MapPin className='mr-1 lg:mr-2 size-5 lg:size-8' />Stasiun {station?.name || '-'}</div>
                    </div>

                    <div className="pb-8 lg:pb-16 space-y-8 lg:space-y-16 border-b lg:border-b-2 border-border">
                        {groupedData.map((item, key) => {
                            const merchant = item.products[0]
                            return (
                                <div key={key} className='space-y-5 lg:space-y-12'>
                                    <div className="flex items-center gap-4 lg:gap-8 font-bold">
                                        <div className={`flex-center rounded-full size-6 lg:size-14 border lg:border-2 border-border`}>
                                            <LazyLoadImage alt={merchant?.merchant} src={merchant?.merchant_image} className={`w-full object-contain rounded-full`} />
                                        </div>
                                        <div>{item.merchant}</div>
                                    </div>
                                    <div className='space-y-4 lg:space-y-10'>
                                        {item.products.map((prod, key1) => {
                                            return (
                                                <div className='flex items-center gap-4 lg:gap-8' key={key1}>
                                                    <div className='min-w-16 min-h-16 max-h-16 max-w-16 lg:min-w-36 lg:min-h-36 lg:max-h-36 lg:max-w-36'>
                                                        <LazyLoadImage alt={prod.title} src={prod.thumbnail} className='w-full h-full rounded-lg lg:rounded-xl' />
                                                    </div>
                                                    <div className='space-y-2 lg:space-y-5 text-base lg:text-[33px]'>
                                                        <div className='font-bold leading-tight'>{prod.title}</div>
                                                        {prod.discount > 0 ?
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-sm lg:text-3xl line-through text-muted-foreground">{formatRupiah(prod.price)}</div>
                                                                <div className="font-bold">{formatRupiah(prod.disc_price)}</div>
                                                                <div className='font-bold'>x{prod.quantity}</div>
                                                            </div>
                                                            :
                                                            <div className="flex items-center gap-4 font-bold">
                                                                <div>{formatRupiah(prod.price)}</div>
                                                                <div>x{prod.quantity}</div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex items-end justify-between">
                        <h3 className="font-bold">Metode Pembayaran</h3>
                    </div>
                    <div className="pb-8 lg:pb-16 border-b lg:border-b-2 border-border space-y-6 lg:space-y-16">
                        {PAYMENT_LIST.map((item, key) => {
                            return (
                                <div className='flex justify-between items-center gap-4 lg:gap-10 cursor-pointer' key={key} onClick={() => setSelectedPayment(item.type)}>
                                    <div className='flex items-center gap-4 lg:gap-8'>
                                        <div className='size-11 lg:size-24'>
                                            <LazyLoadImage alt={item.title} src={item.img} className='w-full h-full object-contain' />
                                        </div>
                                        <div className='space-y-1 lg:space-y-5 lg:text-[33px]'>
                                            <div className='font-bold leading-tight'>{item.title}</div>
                                            <div className='text-muted-foreground'>{item.desc}</div>
                                        </div>
                                    </div>
                                    {selectedPayment === item.type ?
                                        <div className='rounded-full bg-primary size-5 lg:size-12 flex-center'>
                                            <div className='bg-white size-4 lg:size-10 rounded-full flex-center'>
                                                <div className='rounded-full bg-primary size-3 lg:size-8' />
                                            </div>
                                        </div>
                                        :
                                        <div className='rounded-full bg-zinc-500 size-5 lg:size-12 flex-center'>
                                            <div className='bg-white size-4 lg:size-10 rounded-full flex-center'>
                                            </div>
                                        </div>
                                    }
                                </div>
                            )
                        })}
                    </div>

                    <div className='space-y-4 lg:space-y-10'>
                        <div className="flex items-end justify-between">
                            <h3 className="font-bold">Ringkasan Belanja</h3>
                        </div>
                        <div className='space-y-1 lg:space-y-5'>
                            <div className='flex justify-between items-center'>
                                <div className='text-muted-foreground'>Total Harga <strong>({totalItem})</strong> Barang</div>
                                {item_checkout.find(item => item.discount > 0) ?
                                    <div className="flex items-center gap-1 lg:gap-4">
                                        <div className="lg:text-3xl line-through text-muted-foreground">{formatRupiah(originalPrice)}</div>
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
                        </div>
                    </div>
                </div>
                :
                <div className='flex-center h-[75vh] flex-col px-16 gap-20'>
                    <LazyLoadImage alt='no-cart' src={EmptyCartIC} />
                    <div className='flex flex-col items-center gap-5'>
                        <div className='font-bold text-[42px]'>Ups, keranjang kamu masih kosong!</div>
                        <div className='text-3xl text-center w-8/12 leading-tight'>Temukan penawaran menarik dan tambahkan ke keranjang sekarang!</div>
                    </div>
                </div>
            }

            <div className="fixed bottom-0 w-full bg-white px-6 lg:px-16 py-5 lg:py-12 border-t lg:border-t-2 border-border z-10">
                <div className='space-y-4 lg:space-y-10'>
                    <div className='lg:text-3xl text-muted-foreground leading-normal'>Dengan melanjutkan pembayaran, kamu menyetujui <u>S&K pembelian barang</u></div>
                    <div className='flex items-center justify-between'>
                        <div className='lg:space-y-3'>
                            <div className='text-base lg:text-[42px] font-bold'>{formatRupiah(totalPrice + serviceFee)}</div>
                            <div className='text-muted-foreground text-xs lg:text-3xl'>Hemat {formatRupiah(originalPrice - totalPrice)}</div>
                        </div>
                        <Button disabled={!selectedPayment || !station || isLoading} className='w-40 lg:w-96 font-semibold' onClick={handleCheckout}>
                            Bayar Sekarang {isLoading ? <Loader2 className='ml-2 animate-spin lg:size-16 lg:mr-4' /> : null}
                        </Button>
                    </div>
                </div>
            </div>

            {error.title ? <ErrorPopup title={error.title} desc={error.desc} other_msg={error.other_msg} error_ic={ErrorIC} onClick={() => setError({ title: '', desc: '', other_msg: '' })} /> : null}
        </>
    );
}
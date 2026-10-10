import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCode as QRCodeLogo } from 'react-qrcode-logo';
import { useShallow } from 'zustand/shallow';
import { useReactToPrint } from 'react-to-print';

import { useCartStore } from '@/stores/useCartStore';
import { useStationStore } from '@/stores/useStationStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import axios from '@/lib/axios';
import { formatRupiah } from '@/lib/helper';

import TransactionReceipt from '@/components/receipt/TransactionReceipt';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import FullLoader from '@/components/loader/FullLoader';
import ErrorPopup from '@/components/popups/ErrorPopup';
import ErrorIC from '@/assets/img/payment-error.webp'
import ArrowLeftIC from '@/assets/img/vector-icon/arrow-left.svg'
import { useAppConfigStore } from '@/stores/useAppConfigStore';
import useMobileView from '@/hooks/useMobileView';
import { Loader2 } from 'lucide-react';
import ConfirmPopup from '@/components/popups/ConfirmPopup';
import imageConfirm from '@/assets/img/quit.svg'
import { generateReceiptPDF } from '@/components/receipt/TransactionPDFReceipt';

export default function PaymentQRISPage() {
    const TIMEOUT_PAGE = 300
    const TIMEOUT_POPUP = 30000

    const commonTitleError = 'Ups, pembayaran kamu belum berhasil'
    const commonDescError = 'Silakan coba lagi ya!'

    const [isLoading, setIsLoading] = useState(true)
    const [isSimulate, setIsSimulate] = useState(false)
    const [showGuide, setShowGuide] = useState(false)
    const [showConfirmBack, setShowConfirmBack] = useState(false)
    const [error, setError] = useState({
        title: "",
        desc: "",
        other_msg: ''
    })
    const [timeoutCountdown, setTimeoutCountdown] = useState<number | null>(null);
    const [printReceipt, setPrintReceipt] = useState(false)

    const intervalPageTimeoutRef = useRef<any>(null)
    const timeoutBackToHome = useRef<any>(null)
    const receiptRef = useRef<any>(null)
    const qrContentRef = useRef<string>('');
    const { windowWidth } = useMobileView()

    const station = useStationStore((state) => state.station);
    const serviceFee = useAppConfigStore((state) => state.serviceFee);
    const { transaction, setTransaction } = useTransactionStore(
        useShallow((state) => ({
            transaction: state.transaction,
            setTransaction: state.setTransaction,
        }))
    );
    const { item_checkout } = useCartStore(
        useShallow((state) => ({
            item_checkout: state.item_checkout,
        }))
    );

    const navigate = useNavigate()
    const { isMobile } = useMobileView()

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
        async function checkoutTrx() {
            try {
                setIsLoading(true)
                const { data } = await axios.post('/kiosk/transaction', {
                    "stationId": station?.id,
                    "paymentMethod": "QRIS",
                    "items": item_checkout.map(item => (
                        {
                            "productId": item.id,
                            "quantity": item.quantity,
                        }
                    ))
                })

                console.log(data)
                const baseUrl = import.meta.env.VITE_BASE_URL_API
                qrContentRef.current = `${baseUrl}/kiosk/transaction/${data?.data?.pickupCode}/pay`

                setTransaction(data.data)
                setTimeoutCountdown(TIMEOUT_PAGE)
            } catch (error: any) {
                handleError(commonTitleError, commonDescError, `(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`)
            } finally {
                setIsLoading(false)
            }
        }

        if (!qrContentRef.current) {
            checkoutTrx()
        }
    }, [item_checkout, serviceFee])

    // INTERVAL FOR TIMEOUT PAGE
    useEffect(() => {
        if (timeoutCountdown === null) return;

        intervalPageTimeoutRef.current = setInterval(() => {
            setTimeoutCountdown(prev => {
                if (prev === null) return null;

                const newCountdown = prev - 1;

                // Check payment status every 3 seconds
                if (newCountdown % 5 === 0) getPaymentStatus();

                // If countdown ends
                if (newCountdown <= 0) {
                    clearInterval(intervalPageTimeoutRef.current);
                    handleError("Ups, waktu pembayaran kamu telah habis!", commonDescError, '');
                    return null;
                }

                return newCountdown;
            });
        }, 1000);

        return () => {
            clearInterval(intervalPageTimeoutRef.current);
        };
    }, [timeoutCountdown !== null]); // just run when countdown is set

    const getPaymentStatus = async () => {
        try {
            const { data: res } = await axios.get(`/kiosk/transaction/${transaction?.pickupCode}/status`)

            const status = res?.data?.status?.toUpperCase()

            if (status === 'PAID') {
                clearInterval(intervalPageTimeoutRef.current)
                setIsLoading(true);

                if (isMobile) {
                    await generateReceiptPDF({ station, transaction, items: item_checkout, total_price: totalPrice, serviceFee })
                    return navigate('/finish-order')
                } else {
                    setTimeout(() => setPrintReceipt(true), 2000);
                }
            } else if (status === 'CANCELLED') {
                handleError(commonTitleError, commonDescError, '')
            } else if (status === 'PENDING') {
                if (timeoutCountdown! <= 0) {
                    handleError(commonTitleError, commonDescError, '')
                }
            } else {
                return
            }
        } catch (error: any) {
            if (timeoutCountdown! <= 0) {
                handleError(commonTitleError, commonDescError, `(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`)
                return
            }

            return
        }
    }

    const handleSimulatePayTransaction = async () => {
        try {
            setIsSimulate(true)
            await axios.get(`/kiosk/transaction/${transaction?.pickupCode}/pay`)
        } catch (error) {
            setIsSimulate(false)
            console.log(error)
        }
    }

    const handleBack = async () => {
        try {
            setIsSimulate(true)
            await axios.get(`/kiosk/transaction/${transaction?.pickupCode}/cancel-payment`)
        } catch (error) {
            setIsSimulate(false)
            console.log(error)
        } finally {
            navigate(-1)
        }
    }

    const handleError = (title: string, desc: string, other?: string) => {
        setError({ title: title, desc: desc, other_msg: other! })
        timeoutBackToHome.current = setTimeout(() => navigate('/', { replace: true }), TIMEOUT_POPUP);
    }

    useEffect(() => {
        return () => {
            clearInterval(intervalPageTimeoutRef.current)
            clearTimeout(timeoutBackToHome.current)
        }
    }, [])

    //#region CLAIM RECEIPT
    const reactToPrintReceipt = useReactToPrint({
        contentRef: receiptRef,
        onAfterPrint: () => {
            navigate('/finish-order')
            return
        },
        onPrintError(errorLocation, error) {
            console.log({ errorLocation, error })
        },
    });

    useEffect(() => {
        if (printReceipt) {
            reactToPrintReceipt();
        }

    }, [printReceipt]);
    //#endregion

    return (
        <>
            <header className="sticky top-0 z-20 bg-white border-b-2 border-border grid grid-cols-12 items-center px-6 lg:px-16 h-20 lg:h-44">
                <button className="col-span-3" onClick={() => setShowConfirmBack(true)}>
                    <img alt="arrow-left" src={ArrowLeftIC} className='w-6 lg:w-16' />
                </button>
                <div className='col-span-6 justify-self-center font-bold text-base lg:text-[42px]'>Pembayaran</div>
                <div className='col-span-3 justify-self-end underline text-primary text-3xl font-bold'></div>
            </header>

            <div className="flex flex-col gap-8 lg:gap-20 mt-8 lg:mt-16 px-6 lg:px-16 pb-10 lg:pb-24 mb-20 font-medium">
                <div className='flex justify-between items-center lg:text-3xl text-white h-12 lg:h-32 font-medium bg-primary rounded-lg lg:rounded-3xl px-6 lg:px-14'>
                    <div>Selesaikan pembayaran kamu</div>
                    <div className='font-bold'>{String(Math.floor(timeoutCountdown! / 60)).padStart(2, "0")}:{String(timeoutCountdown! % 60).padStart(2, "0")}</div>
                </div>

                <div className='bg-white border lg:border-2 border-border rounded-xl lg:rounded-4xl shadow-lg lg:shadow-2xl flex flex-col items-center gap-6 lg:gap-16 px-6 lg:px-16 py-8 lg:py-20'>
                    <div className='rounded-lg border lg:border-2 border-border'>
                        {qrContentRef.current ?
                            <QRCodeLogo
                                value={qrContentRef.current}
                                bgColor='#fff' fgColor='#000' size={windowWidth >= 1024 ? 600 : 240}
                            // qrStyle='fluid'
                            /> : null
                        }
                    </div>
                    <div className='text-center lg:leading-tight px-4 lg:px-10'>Scan QR di atas menggunakan e-wallet atau m-banking kamu</div>
                    <Accordion type="single" collapsible className='w-full'>
                        <AccordionItem value="item-1" >
                            <div className='flex items-center justify-between w-full'>
                                <div className='space-y-1 lg:space-y-4'>
                                    <div className='font-normal text-muted-foreground'>Total Bayar</div>
                                    <div className='font-bold'>{formatRupiah(totalPrice + serviceFee)}</div>
                                </div>
                                <AccordionTrigger className='font-bold lg:text-3xl text-primary'>Lihat detail</AccordionTrigger>
                            </div>
                            <AccordionContent className='w-full'>
                                <div className='space-y-1 lg:space-y-3 mt-4 lg:mt-10 text-xs lg:text-3xl'>
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
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <div className='pt-6 lg:pt-14 border-t lg:border-t-2 border-border space-y-6 lg:space-y-14'>
                        <div className='flex items-start gap-3 lg:gap-8'>
                            <div className='min-w-1 min-h-1 lg:min-w-4 lg:min-h-4 bg-black rounded-full mt-2 lg:mt-4'></div>
                            <p className='lg:leading-tight'>Status transaksi akan berubah secara otomatis saat pembayaran kamu berhasil dilakukan</p>
                        </div>

                        <div className='w-full flex flex-col gap-5 lg:gap-12'>
                            <Button variant='outline' className='font-semibold' onClick={() => setShowGuide(!showGuide)}>{showGuide ? 'Sembunyikan cara bayar' : 'Lihat cara bayar'}</Button>
                            {showGuide ?
                                <div className='text-xs lg:text-3xl'>
                                    <ul className='pl-3 lg:pl-6 list-decimal space-y-1 lg:space-y-4'>
                                        <li>Buka Aplikasi E-wallet atau Aplikasi M-banking yang support dengan QRIS.</li>
                                        <li>Pilih Pay / QR.</li>
                                        <li>Scan QR Code yang muncul pada layar Anda.</li>
                                        <li>Masukkan nominal pembayaran sesuai dengan tagihan.</li>
                                        <li>Konfirmasi pembayaran dan masukan PIN E-wallet Anda.</li>
                                        <li>Transaksi berhasil dan selesai. </li>
                                    </ul>
                                    <button className='mt-6 text-teal-600 underline disabled:opacity-60 flex items-center lg:hidden' disabled={isSimulate} onClick={handleSimulatePayTransaction}>
                                        {isSimulate ? <Loader2 className='mr-2 animate-spin' /> : null}Simulate success payment
                                    </button>
                                </div>
                                : null
                            }
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? <FullLoader /> : null}
            {error.title ? <ErrorPopup title={error.title} desc={error.desc} other_msg={error.other_msg} error_ic={ErrorIC} onClick={() => navigate(-1)} /> : null}
            {showConfirmBack ? <ConfirmPopup icon={imageConfirm} title='Pembayaran belum selesai' desc='Pembayaran kamu belum selesai nih, apakah kamu yakin ingin kembali?' onNo={() => setShowConfirmBack(false)} onYes={handleBack} isLoading={isSimulate} /> : null}

            <div style={{ display: "none" }}>
                <TransactionReceipt ref={receiptRef} transaction={transaction!} station={station!} items={item_checkout} total_price={totalPrice} serviceFee={serviceFee} />
            </div>
        </>
    );
}
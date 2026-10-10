import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useReactToPrint } from 'react-to-print';
import { useShallow } from 'zustand/shallow';

import axios from '@/lib/axios';
import ConfirmPopup from '@/components/popups/ConfirmPopup';
import { websocket } from '@/lib/socket';
import { formatRupiah } from '@/lib/helper';
import { useCartStore } from '@/stores/useCartStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useStationStore } from '@/stores/useStationStore';

import TransactionReceipt from '@/components/receipt/TransactionReceipt';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import FullLoader from '@/components/loader/FullLoader';
import ErrorPopup from '@/components/popups/ErrorPopup';
import ArrowLeftIC from '@/assets/img/vector-icon/arrow-left.svg'
import TapKMTIC from '@/assets/img/tap-kmt.webp'
import ErrorIC from '@/assets/img/payment-error.webp'
import { useAppConfigStore } from '@/stores/useAppConfigStore';
import imageConfirm from '@/assets/img/quit.svg'

export default function PaymentKMTPage() {
    const TIMEOUT_PAGE = 210
    const TIMEOUT_POPUP = 30000

    const commonTitleError = 'Ups, pembayaran kamu belum berhasil'
    const commonDescError = 'Silakan coba lagi ya!'

    const [isSuccessDeduct, setIsSuccessDeduct] = useState(false)
    const [showPopUpTimeout, setShowPopUpTimeout] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSimulate, setIsSimulate] = useState(false)
    const [showConfirmBack, setShowConfirmBack] = useState(false)
    const [error, setError] = useState({
        title: "", desc: "", other_msg: ''
    })
    const [timeoutCountdown, setTimeoutCountdown] = useState<number | null>(null);
    const [printReceipt, setPrintReceipt] = useState(false)

    const timeoutBackToHome = useRef<any>(null)
    const intervalPageTimeoutRef = useRef<any>(null)
    const receiptRef = useRef<any>(null)
    const cardData = useRef<any>(null)
    const errorProccessRef = useRef<Boolean>(false)

    const { transaction, setTransaction } = useTransactionStore(
        useShallow((state) => ({
            transaction: state.transaction,
            setTransaction: state.setTransaction,
        }))
    );
    const station = useStationStore((state) => state.station);
    const { serviceFee, customDeductAmount, isCustomDeductKMT } = useAppConfigStore(
        useShallow((state) => ({
            isCustomDeductKMT: state.isCustomDeductKMT,
            customDeductAmount: state.customDeductAmount,
            serviceFee: state.serviceFee,
        }))
    );
    const { item_checkout } = useCartStore(
        useShallow((state) => ({
            item_checkout: state.item_checkout,
        }))
    );

    const navigate = useNavigate()

    const totalPrice = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.disc_price * item.quantity!, 0);
    }, [item_checkout]);

    const originalPrice = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.price * item.quantity!, 0);
    }, [item_checkout]);

    const totalItem = useMemo(() => {
        return item_checkout.reduce((sum, item) => sum + item.quantity!, 0);
    }, [item_checkout]);

    // INTERVAL FOR TIMEOUT PAGE
    useEffect(() => {
        if (timeoutCountdown === null) return;

        intervalPageTimeoutRef.current = setInterval(() => {
            setTimeoutCountdown(prev => {
                if (prev === null) return null;

                const newCountdown = prev - 1;

                // Check payment status every 3 seconds
                // If countdown ends
                if (newCountdown <= 0) {
                    clearInterval(intervalPageTimeoutRef.current);
                    setShowPopUpTimeout(true)
                    timeoutBackToHome.current = setTimeout(() => navigate('/', { replace: true }), TIMEOUT_POPUP);
                    return null;
                }

                return newCountdown;
            });
        }, 1000);

        return () => {
            clearInterval(intervalPageTimeoutRef.current);
        };
    }, [timeoutCountdown !== null]); // just run when countdown is set

    useEffect(() => {
        if (isSuccessDeduct) return

        const initSendCommand = () => {
            if (websocket.readyState === WebSocket.OPEN) {
                console.log("WS OPEN")
                setTimeoutCountdown(TIMEOUT_PAGE)
                isCustomDeductKMT ? websocket.send(`cl_deductkmtstart_${customDeductAmount}`) : websocket.send(`cl_deductkmtstart_${totalPrice + serviceFee}`)
            } else if (websocket.readyState === WebSocket.CONNECTING) {
                console.log("WS CONNECTING")
                websocket.addEventListener('open', () => {
                    setTimeoutCountdown(TIMEOUT_PAGE)
                    isCustomDeductKMT ? websocket.send(`cl_deductkmtstart_${customDeductAmount}`) : websocket.send(`cl_deductkmtstart_${totalPrice + serviceFee}`)
                }, { once: true });
            } else {
                console.log("WS CLOSED")
                handleError(commonTitleError, commonDescError, "WS Closed")
            }
        };

        initSendCommand();

        const handleWSError = () => {
            console.log("WS ERROR")
            handleError(commonTitleError, commonDescError, "WS Error")
        };

        const handleWSClose = () => {
            console.log("WS CLOSED")
            handleError(commonTitleError, commonDescError, "WS Closed")
        };

        websocket.addEventListener('error', handleWSError);
        websocket.addEventListener('close', handleWSClose);

        return () => {
            websocket.removeEventListener('error', handleWSError);
            websocket.removeEventListener('close', handleWSClose);
            try { websocket.send('cl_readcardstop'); } catch (error) { console.log(error) }

            websocket.onmessage = null;
        };
    }, [websocket, isSuccessDeduct]);

    useEffect(() => {
        // if (!messages) return;

        websocket.onmessage = (evt) => {
            console.log('[MESSAGE FROM SOCKET] :', evt.data)
            try {
                const data = JSON.parse(evt.data)

                if (data.code === 2012) {                                       // Deduct ACK
                    setIsLoading(false)
                    setTimeoutCountdown(TIMEOUT_PAGE)
                }

                if (data.code === 2014) {                                       // Deduct Success
                    setIsSuccessDeduct(true)
                    cardData.current = data?.data
                    handleProccessPaymentEDC(data?.data)
                }

                if (data.code === 2015) {                                       // Deduct Failed
                    handleError(commonTitleError, 'Potong Saldo KMT Gagal, Silakan Coba Lagi', data.message)
                    // setIsSuccessDeduct(true)
                    // cardData.current = data?.data
                    // handleProccessPaymentEDC(data?.data)
                }
            } catch (error) {
                console.log("Failed to parse WebSocket message:", error);
                handleError(commonTitleError, commonDescError, `Failed to parse WebSocket message: ${error}`)
            }
        }
    }, [])

    const handleProccessPaymentEDC = async (_: any) => {
        setIsLoading(true)
        try {
            const payload = {
                "stationId": station?.id,
                "paymentMethod": "KMT",
                "items": item_checkout.map(item => (
                    {
                        "productId": item.id,
                        "quantity": item.quantity,
                    }
                ))
            }

            console.log(`[Req] PAYMENT PROCCESS => ${JSON.stringify(payload)}`)
            const { data } = await axios.post(`/kiosk/transaction`, payload)
            console.log(`[Res] PAYMENT PROCCESS => ${JSON.stringify(data)}`)

            await axios.get(`/kiosk/transaction/${data?.data?.pickupCode}/pay`)

            setTransaction(data.data)
            setTimeoutCountdown(null)
            clearInterval(intervalPageTimeoutRef.current)

            setTimeout(() => setPrintReceipt(true), 2000);
        } catch (error: any) {
            handleError(commonTitleError, commonDescError, `(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`)
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

    useEffect(() => {
        return () => {
            clearInterval(intervalPageTimeoutRef.current)
            clearTimeout(timeoutBackToHome.current)
        }
    }, [])

    const handleError = (title: string, desc: string, other?: string) => {
        if (errorProccessRef.current) return

        errorProccessRef.current = true
        setError({ title: title, desc: desc, other_msg: other! })
        timeoutBackToHome.current = setTimeout(() => navigate('/', { replace: true }), TIMEOUT_POPUP);
    }

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
            <header className="sticky top-0 z-20 bg-white border-b-2 border-border grid grid-cols-12 items-center px-16 h-44">
                <button className="col-span-3" onClick={() => setShowConfirmBack(true)}>
                    <img alt="arrow-left" src={ArrowLeftIC} className='w-16' />
                </button>
                <div className='col-span-6 justify-self-center font-bold text-[42px]'>Pembayaran</div>
                <div className='col-span-3 justify-self-end underline text-primary text-3xl font-bold'></div>
            </header>

            <div className="flex flex-col gap-20 mt-16 px-16 pb-24 mb-40 font-medium">
                <div className='flex justify-between items-center text-3xl text-white h-32 font-medium bg-primary rounded-3xl px-14'>
                    <div>Scan dengan KMT kamu</div>
                    <div className='font-bold'>{String(Math.floor(timeoutCountdown! / 60)).padStart(2, "0")}:{String(timeoutCountdown! % 60).padStart(2, "0")}</div>
                </div>

                <div className='bg-white border-2 border-border rounded-4xl shadow-2xl flex flex-col items-center gap-16 px-16 py-20'>
                    <div className='w-[24rem] h-[24rem] rounded-full border-2 border-border'>
                        <LazyLoadImage alt='kmt' src={TapKMTIC} className='w-full h-full object-cover rounded-full' />
                    </div>
                    <div className='text-center leading-tight'>Scan KMT kamu di tempat yang telah di sediakan di Kiosk ini</div>
                    <Accordion type="single" collapsible className='w-full'>
                        <AccordionItem value="item-1" >
                            <div className='flex items-center justify-between w-full'>
                                <div className='space-y-4'>
                                    <div className='font-normal text-muted-foreground'>Total Bayar</div>
                                    <div className='font-bold'>{formatRupiah(totalPrice + serviceFee)}</div>
                                </div>
                                <AccordionTrigger className='font-bold text-3xl text-primary'>Lihat detail</AccordionTrigger>
                            </div>
                            <AccordionContent className='w-full'>
                                <div className='space-y-3 mt-10 text-3xl'>
                                    <div className='flex justify-between items-center'>
                                        <div className='text-muted-foreground'>Total Harga ({totalItem}) Barang</div>
                                        {item_checkout.find(item => item.discount > 0) ?
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl line-through text-muted-foreground">{formatRupiah(originalPrice)}</div>
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
                    <div className='pt-14 border-t-2 border-border space-y-14'>
                        <div className='flex items-start gap-8'>
                            <div className='min-w-4 min-h-4 bg-black rounded-full mt-4'></div>
                            <p className='leading-tight'>Status transaksi akan berubah secara otomatis saat pembayaran kamu berhasil dilakukan</p>
                        </div>

                        <div className='w-full flex flex-col gap-12'>
                            <Button variant='outline' className='font-semibold'>Lihat cara bayar</Button>
                            <Button variant='outline' className='font-semibold'>Cek status bayar</Button>
                        </div>
                    </div>
                </div>
            </div>

            {showPopUpTimeout ? <ConfirmPopup title='Waktu pembayaran habis' desc='Apa kamu ingin menambah waktu transaksi?'
                yes_title='Ya, lanjutkan' no_title='Tidak'
                onNo={() => navigate('/', { replace: true })} onYes={() => {
                    setTimeoutCountdown(TIMEOUT_PAGE)
                    clearTimeout(timeoutBackToHome.current)
                    setShowPopUpTimeout(false)
                }} />
                : null
            }
            {isLoading ? <FullLoader /> : null}
            {error.title ? <ErrorPopup title={error.title} desc={error.desc} other_msg={error.other_msg} error_ic={ErrorIC} onClick={() => navigate(-1)} /> : null}
            {showConfirmBack ? <ConfirmPopup icon={imageConfirm} title='Pembayaran belum selesai' desc='Pembayaran kamu belum selesai nih, apakah kamu yakin ingin kembali?' onNo={() => setShowConfirmBack(false)} onYes={handleBack} isLoading={isSimulate} /> : null}

            <div style={{ display: "none" }}>
                <TransactionReceipt ref={receiptRef} transaction={transaction!} station={station!} items={item_checkout} total_price={totalPrice} serviceFee={serviceFee} />
            </div>
        </>
    );
}
import ArrowLeftIC from '@/assets/img/vector-icon/arrow-left.svg'
import TakeItemsIC from '@/assets/img/take-items.svg'
import FullLoader from '@/components/loader/FullLoader';
import ErrorPopup from '@/components/popups/ErrorPopup';
import { Button } from '@/components/ui/button';
import axios from '@/lib/axios';
import { convertToASCII, formatRupiah } from '@/lib/helper';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { LOCKER_LIST_NEW } from '@/lib/constant';
import { Loader2 } from 'lucide-react';

export default function PicUpVerificationPage() {
    const COUNTDOWM_PICKUP = 60

    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingConfirm, setIsLoadingConfirm] = useState(false)
    const [error, setError] = useState({
        title: "",
        desc: "",
        other_msg: ''
    })
    const [timeoutCountdown, setTimeoutCountdown] = useState<number | null>(null);
    const [port1, setPort1] = useState<any>(null);

    const navigate = useNavigate()
    const timeoutBackToHome = useRef<any>(null)
    const intervalPageTimeoutRef = useRef<any>(null)
    const readingPorts = useRef<Set<any>>(new Set());

    const [searchParams] = useSearchParams()
    const trxid = searchParams.get('trxid')

    const dataRef = useRef<any>(undefined)

    if (!trxid) return <Navigate to='/pickup' replace />

    useEffect(() => {
        async function getDetailOrder() {
            try {
                const { data } = await axios.get(`/locker/${trxid}`)
                dataRef.current = data.data
            } catch (error: any) {
                setError({ title: 'Ups, terjadi kesalahan', desc: 'Silakan coba kembali ya!', other_msg: `(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}` })
                timeoutBackToHome.current = setTimeout(() => navigate('/', { replace: true }), 30000);
            } finally {
                setIsLoading(false)
            }
        }


        if (!dataRef.current) {
            getDetailOrder()
        }

        return () => {
            clearTimeout(timeoutBackToHome.current)
        }
    }, [trxid, navigate, port1])

    // INTERVAL FOR TIMEOUT PAGE
    useEffect(() => {
        if (timeoutCountdown === null) return;

        intervalPageTimeoutRef.current = setInterval(() => {
            setTimeoutCountdown(prev => {
                if (prev === null) return null;

                const newCountdown = prev - 1;

                // If countdown ends
                if (newCountdown <= 0) {
                    clearInterval(intervalPageTimeoutRef.current);
                    handleSuccess()
                    return null;
                }

                return newCountdown;
            });
        }, 1000);

        return () => {
            clearInterval(intervalPageTimeoutRef.current);
        };
    }, [timeoutCountdown !== null]); // just run when countdown is set


    const readerRef = useRef<any>(null);

    useEffect(() => {
        if ("serial" in navigator) {
            console.log("Web Serial API is supported.");
        } else {
            console.log("Web Serial API is not supported in this browser.");
        }
    }, [])

    const isPortOpen = (port: any) => {
        try {
            return port.readable && port.writable;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        const checkPreviouslyPairedPorts = async () => {
            // @ts-ignore
            const ports = await navigator.serial.getPorts();
            console.log(ports)
            if (ports.length > 0) {
                const previouslyPairedPort = ports[0];
                try {
                    if (!isPortOpen(previouslyPairedPort)) {
                        await previouslyPairedPort.open({ baudRate: 9600 });
                        console.log("Opened previously paired port");
                    } else {
                        console.log("Previously paired port already open");
                    }

                    setPort1(previouslyPairedPort);
                    readFromPort(previouslyPairedPort); // safe to call once
                } catch (error) {
                    console.error("Error handling previously paired port:", error);
                }
            } else {
                console.log("No previously paired serial ports found.");
            }
        };

        checkPreviouslyPairedPorts();
    }, []);

    const readFromPort = async (port: any) => {
        if (readingPorts.current.has(port)) {
            console.log("Already reading from this port. Skipping duplicate read.");
            return;
        }

        if (port.readable.locked) {
            console.log("Port readable stream is already locked. Skipping read.");
            return;
        }

        const reader = port.readable.getReader(); // ✅ Now safe
        readerRef.current = reader;
        readingPorts.current.add(port);

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done || !value) break;

                const hexArray = [...value];
                const text = convertToASCII(hexArray);
                console.log("ASCII Response:", text);
            }
        } catch (err) {
            console.error("Read error:", err);
        } finally {
            try {
                reader.releaseLock();
            } catch (e) {
                console.warn("Failed to release reader lock", e);
            }
            readingPorts.current.delete(port);
        }
    };

    const sendSaleMessage = async () => {
        const randomLocker = LOCKER_LIST_NEW[Math.floor(Math.random() * LOCKER_LIST_NEW.length)]

        console.log(randomLocker)
        if (port1) {
            const encoder = new TextEncoder();
            const writer = port1.writable.getWriter();
            try {
                // await writer.write("Hello World");
                await writer.write(encoder.encode(randomLocker));
                await handleCompleteTransaction()
            } catch (e) {
                console.error('Error writing to serial:', e);
            } finally {
                writer.releaseLock();
            }
        }

        // await handleCompleteTransaction()
    };

    const handleCompleteTransaction = async () => {
        try {
            setIsLoadingConfirm(true)
            const { data } = await axios.get(`/locker/${trxid}/complete`)
            console.log(data)
            setTimeoutCountdown(COUNTDOWM_PICKUP);
        } catch (error: any) {
            setError({ title: 'Ups, terjadi kesalahan', desc: 'Silakan coba kembali ya!', other_msg: `(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}` })
            timeoutBackToHome.current = setTimeout(() => navigate('/', { replace: true }), 30000);
        } finally {
            setIsLoadingConfirm(false)
        }
    }

    const handleSuccess = () => {
        navigate(`/pick-up/finish?trxid=${trxid}&loker=[${dataRef?.current?.transaction?.locker?.code}] ${dataRef?.current?.transaction?.locker?.name}`, { replace: true })
    }

    return (
        <>
            <div className='flex flex-col min-h-screen'>
                <header className="sticky top-0 z-20 bg-white border-b-2 border-border grid grid-cols-12 items-center px-16 h-44">
                    <button className="col-span-3" onClick={() => navigate(-1)}>
                        <img alt="arrow-left" src={ArrowLeftIC} className='w-16' />
                    </button>
                    <div className='col-span-6 justify-self-center font-bold text-[42px]'>Verifikasi Pesanan</div>
                    <div className='col-span-3 justify-self-end underline text-primary text-3xl font-bold'></div>
                </header>

                <div className='space-y-16 px-20 py-16'>
                    <div className='space-y-4'>
                        <div>Nomor Pesanan</div>
                        <div className='font-bold'>{trxid}</div>
                    </div>
                    <div className='space-y-4'>
                        <div>Waktu Transaksi</div>
                        <div className='font-bold'>{dayjs(dataRef?.current?.transaction?.transactionTimeAt).format('DD MMMM YYYY HH:mm:ss')}</div>
                    </div>
                    <div className='space-y-4'>
                        <div>Metode Pembayaran</div>
                        <div className='font-bold'>{dataRef?.current?.transaction?.paymentMethod}</div>
                    </div>
                    <div className='space-y-4'>
                        <div>Total Pembayaran</div>
                        <div className='font-bold'>{formatRupiah(dataRef?.current?.transaction?.totalAmount)}</div>
                    </div>
                    <div className='space-y-9'>
                        <div>Detail Pesanan</div>
                        <div className='w-full space-y-12'>
                            {dataRef.current?.items.map((item: any, key: number) =>
                                <div key={key} className='w-full flex justify-between items-center border-b-2 pb-4'>
                                    <div className='font-medium w-4/5'>{item.productName}</div>
                                    <div>x{item.quantity || 1}</div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                <div className='mt-auto py-20 px-16 space-y-10'>
                    <div className='font-semibold'>Apakah ini pesanan kamu?</div>
                    <div className='flex flex-col gap-8'>
                        <Button onClick={() => { sendSaleMessage() }} disabled={isLoadingConfirm}>{isLoadingConfirm ? <Loader2 className='mr-6 size-16 animate-spin' /> : null} Ya, ini pesanan saya</Button>
                        <Button variant='outline' onClick={() => navigate(-1)}>Bukan pesanan saya / Batalkan</Button>
                    </div>
                </div>
            </div>

            {isLoading ? <FullLoader /> : null}
            {error.title ? <ErrorPopup title={error.title} desc={error.desc} other_msg={error.other_msg} onClick={() => navigate(-1)} /> : null}
            {timeoutCountdown !== null ? <ErrorPopup
                error_ic={TakeItemsIC} title='Ambil Pesanan' desc={`Loker [${dataRef?.current?.transaction?.locker?.code}] telah terbuka. Silakan ambil pesanan kamu`}
                btn_title={`Saya sudah mengambil barang (${timeoutCountdown}s)`} onClick={handleSuccess}
            /> : null
            }
        </>
    );
}
import KeyboardNumeric from '@/components/keyboards/KeyboardNumeric';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { convertToASCII } from '@/lib/helper';
import { useAppConfigStore } from '@/stores/useAppConfigStore';
import { ShoppingCart, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';

export default function AppConfigPage() {
    const [port1, setPort1] = useState<any>(null);
    const [port2, setPort2] = useState<any>(null);
    const [inputValues, setInputVales] = useState({
        service_fee: '', deduct_amount: ''
    })
    const [inputName, setInputName] = useState("service_fee");
    const [isKeyboardFocus, setIsKeyboardFocus] = useState(false)


    const readerRef = useRef<any>(null);
    const readingPorts = useRef<Set<any>>(new Set());
    const navigate = useNavigate()
    const keyRef = useRef<any>(null);

    const { serviceFee, setServiceFee, isCustomDeductKMT, setIsCustomDeductKMT, customDeductAmount, setCustomDeductAmount } = useAppConfigStore(
        useShallow((state) => ({
            customDeductAmount: state.customDeductAmount,
            setCustomDeductAmount: state.setCustomDeductAmount,
            isCustomDeductKMT: state.isCustomDeductKMT,
            setIsCustomDeductKMT: state.setIsCustomDeductKMT,
            serviceFee: state.serviceFee,
            setServiceFee: state.setServiceFee,
        }))
    );

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


    const requestPort = async () => {
        try {
            // @ts-ignore
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            return port;
        } catch (err) {
            console.log("[Error opening serial port]", err);
        }
    };

    const connect1 = async () => {
        if (port1) {
            await disconnect1();
        } else {
            const newPort = await requestPort();
            if (newPort) {
                setPort1(newPort);
                readFromPort(newPort);
            }
        }
    };

    const disconnect1 = async () => {
        try {
            if (readerRef.current) {
                await readerRef.current.cancel();
                readerRef.current.releaseLock();
                readerRef.current = null;
            }

            if (port1?.writable) {
                await port1.close();
                console.log("Serial port closed.");
            }
        } catch (err) {
            console.error("Error closing serial port:", err);
        } finally {
            setPort1(null);
        }
    };

    // @ts-ignore
    const connect2 = async () => {
        if (port1) {
            await disconnect2();
        } else {
            const newPort = await requestPort();
            if (newPort) {
                setPort2(newPort);
                readFromPort(newPort);
            }
        }
    };

    const disconnect2 = async () => {
        try {
            if (readerRef.current) {
                await readerRef.current.cancel();
                readerRef.current.releaseLock();
                readerRef.current = null;
            }

            if (port2?.writable) {
                await port2.close();
                console.log("Serial port closed.");
            }
        } catch (err) {
            console.error("Error closing serial port:", err);
        } finally {
            setPort2(null);
        }
    };

    const sendSaleMessage = async (msg: string) => {
        if (port1) {
            const encoder = new TextEncoder();
            const writer = port1.writable.getWriter();
            try {
                // await writer.write("Hello World");
                await writer.write(encoder.encode(msg));
            } catch (e) {
                console.error('Error writing to serial:', e);
            } finally {
                writer.releaseLock();
            }
        }
    };

    //#region KEYBOARD ACTION
    useEffect(() => {
        if (keyRef.current) {
            const initiate = {
                service_fee: serviceFee.toString(), deduct_amount: customDeductAmount.toString()
            }
            setInputVales(initiate)
            keyRef.current?.setValue(initiate)
        }
    }, [])

    useEffect(() => {
        setServiceFee(Number(inputValues.service_fee))
        setCustomDeductAmount(Number(inputValues.deduct_amount))
    }, [inputValues.service_fee, inputValues.deduct_amount])

    const onChangeInput = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        keyRef.current?.onChangeInput(event)
    };

    const setActiveInput = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputName(event.target.name)
        setIsKeyboardFocus(true)
    }
    //#endregion

    return (
        <>
            <div className="flex flex-col w-full max-w-[1080px] min-h-screen mx-auto font-jakarta text-4xl">
                <header className="grid grid-cols-12 items-center text-5xl font-semibold gap-8 px-16 pt-14">
                    <div className="col-span-3" onDoubleClick={() => navigate('/pick-up')} >
                        <div className='size-20 rounded-3xl flex items-center justify-center bg-primary text-white'>
                            <ShoppingCart className="size-12" />
                        </div>
                    </div>
                    <h1 className='col-span-6 justify-self-center font-bold text-[42px]'>App Config</h1>
                    <div className='col-span-3 justify-self-end underline text-primary text-3xl font-bold'></div>
                </header>
                <div className='space-y-20 px-16 mt-20'>
                    <div className='space-y-10'>
                        <div className='font-bold'>Locker Controller</div>
                        <div className='flex-center flex-col gap-12'>
                            <Button type='button' onClick={connect1} className='w-full'>{port1 ? 'Diconnect' : 'Connect'}</Button>
                            <div className='w-full grid grid-cols-2 gap-16'>
                                <Button type='button' onClick={() => sendSaleMessage('TRIGGER1')} disabled={!port1} className='w-full'>Open Locker 1</Button>
                                <Button type='button' onClick={() => sendSaleMessage('TRIGGER2')} disabled={!port1} className='w-full'>Open Locker 2</Button>
                            </div>
                        </div>
                    </div>
                    <div className='space-y-12 font-medium'>
                        <div className='font-bold'>Other Config</div>
                        <div className='flex flex-col gap-8'>
                            <label htmlFor='service_fee' >Service Fee</label>
                            <input id='service_fee' name='service_fee' type='text' inputMode='numeric' placeholder="Enter the service fee" className="outline-none bg-white border-2 border-border w-full h-32 rounded-4xl px-16 focus:border-primary duration-300 focus:ring-2 focus:ring-primary font-semibold"
                                onChange={onChangeInput}
                                value={inputValues.service_fee || ''}
                                onFocus={setActiveInput}
                            />
                        </div>
                        <div className='space-y-6'>
                            <div className='flex justify-between items-center gap-8'>
                                <label>Use custom amount for deduct KMT</label>
                                <Switch onCheckedChange={setIsCustomDeductKMT} checked={isCustomDeductKMT} />
                            </div>
                            {isCustomDeductKMT ?
                                <div className='flex flex-col gap-8'>
                                    <label htmlFor='deduct_amount' >Deduct amount</label>
                                    <input id='deduct_amount' name='deduct_amount' type='text' inputMode='numeric' placeholder="Enter deduct amount for KMT" className="outline-none bg-white border-2 border-border w-full h-32 rounded-4xl px-16 focus:border-primary duration-300 focus:ring-2 focus:ring-primary font-semibold"
                                        onChange={onChangeInput}
                                        value={inputValues.deduct_amount || ''}
                                        onFocus={setActiveInput}
                                    />
                                </div>
                                :
                                null
                            }
                        </div>
                    </div>
                </div>
                <div className='p-16 mt-auto'>
                    <Button className='w-full' variant='outline' onClick={() => window.location.reload()}>Reload App</Button>
                </div>
            </div>

            <div className={`fixed ${isKeyboardFocus ? 'bottom-0' : '-bottom-[45rem]'}  w-full bg-white duration-200`}>
                <div className='relative w-full flex-center py-10 border-t-2 rounded-t-4xl'>
                    <Button size='icon' variant='outline' className='absolute top-10 right-10' onClick={() => setIsKeyboardFocus(false)}><X size={42} /></Button>
                    <div className=''>
                        <KeyboardNumeric ref={keyRef} inputName={inputName}
                            onValuesChange={(rcvVal) => setInputVales(rcvVal)} onSubmit={() => setIsKeyboardFocus(false)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
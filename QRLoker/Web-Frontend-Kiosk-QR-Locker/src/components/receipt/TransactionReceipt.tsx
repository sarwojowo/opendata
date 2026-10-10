import { type FC, type RefObject } from 'react';
import { generateQrCode } from './generateQRCode';
import { formatRupiah } from '@/lib/helper';
import type { IStation } from '@/stores/useStationStore';
import type { ITransaction } from '@/stores/useTransactionStore';

type Props = {
    station: IStation | undefined
    transaction: ITransaction
    items: IProduct[]
    total_price: number
    serviceFee: number
    ref: RefObject<HTMLDivElement>;
};

const TransactionReceipt: FC<Props> = ({ station, transaction, items, total_price, serviceFee, ref }) => {
    return (
        <>
            <div className="w-[70mm] fixed top-0 left-0 flex flex-col items-center gap-5 p-3 text-[10px]" ref={ref}>
                <div className="pb-3 pt-1 border-b w-full flex-center">
                    <div className='font-bold text-base'>{transaction?.pickupCode}</div>
                </div>
                <div className='text-center space-y-1.5'>
                    <h2 className='font-bold text-sm'>Stasiun {station?.name}</h2>
                    <p className=''>H7 Jl. Manggarai Utara, RW.1, Manggarai, Kec. Tebet, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12850</p>
                </div>
                <div className='flex-center'>
                    <img src={generateQrCode(transaction?.pickupCode || '')} className='w-3/4' />
                </div>
                <div className='text-center space-y-1'>
                    <div>Kode Loker</div>
                    <div className='font-bold'>[{transaction?.locker.code}] {transaction?.locker.name}</div>
                </div>
                <div className='border-t w-full font-bold px-1'>
                    {items.map((item, key) =>
                        <div className='flex justify-between items-center border-b py-1' key={key}>
                            <div>{item.title}</div>
                            <div className='flex items-center gap-1.5 text-[8px]'>
                                <div className='flex items-center gap-0.5'>
                                    <div>{item.quantity}x</div>
                                    <div>{formatRupiah(item.disc_price)}</div>
                                </div>
                                <div className='text-xs'>{formatRupiah(item.quantity! * item.disc_price)}</div>
                            </div>
                        </div>
                    )}
                    <div className='flex justify-between items-center border-b py-1.5'>
                        <div>Biaya Layanan</div>
                        <div>{formatRupiah(serviceFee)}</div>
                    </div>
                    <div className='flex justify-between items-center border-b py-1.5'>
                        <div>Total</div>
                        <div>{formatRupiah(total_price)}</div>
                    </div>
                </div>
                <p className='text-center'>Scan QR Code ini pada loker di stasiun tujuan kamu. Simpan dan jaga struk ini dengan baik, jika terjadi kerusakan atau kehilangan pada struk ini bukan tanggung jawab comMart</p>
                <div className="pb-4 pt-4 border-t w-full flex-center">
                    <p className='text-center '>PT XXX Indonesia.Jl. Abcd No. 123, Kel. Digital, Kec. Inovasi Kota Futuristik, 12345 Indonesia</p>
                </div>
            </div>
        </>
    );
}

export default TransactionReceipt;
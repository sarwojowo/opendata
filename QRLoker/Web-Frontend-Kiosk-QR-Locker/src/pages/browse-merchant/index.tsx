import ArrowLeftIC from '@/assets/img/vector-icon/arrow-left.svg'
import BottomSheetStation from '@/components/BottomSheetStation';
import { useFetchWithAxios } from '@/lib/axios/useFetch';
import { useCartStore } from '@/stores/useCartStore';
import { useStationStore } from '@/stores/useStationStore';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Link } from 'react-router-dom';
import imageSearch from '@/assets/img/search-item.svg'
import imageError from '@/assets/img/error.svg'
import { Skeleton } from '@/components/ui/skeleton';

export default function BrowseMerPage() {
    const [isOpen, setOpen] = useState(false);

    const station = useStationStore((state) => state.station);
    const getCartItemLength = useCartStore((state) => state.getCartItemLength);
    const { data: merchantList, isLoading, error } = useFetchWithAxios<IMerchant[]>(`/kiosk/merchants?stationId=${station?.id}`)

    return (
        <>
            <header className="sticky top-0 z-20 bg-white border-b-2 border-border grid grid-cols-12 items-center px-6 lg:px-16 h-20 lg:h-44">
                <Link to='/home' className='col-span-3'>
                    <img alt="arrow-left" src={ArrowLeftIC} className='w-6 lg:w-16' />
                </Link>
                <div className='col-span-6 justify-self-center font-bold text-base lg:text-[42px]'>{station?.name}</div>
                <div className='col-span-3 justify-self-end underline text-primary text-xs lg:text-3xl font-bold cursor-pointer' onClick={() => setOpen(true)}>Ganti Stasiun</div>
            </header>

            <div className="flex flex-col gap-8 lg:gap-20 mt-8 lg:mt-16 px-6 lg:px-16 pb-40">
                <div className="flex items-end justify-between">
                    <h3 className="font-bold text-base lg:text-[42px]">Daftar Merchant di {station?.name}</h3>
                </div>
                <div className="grid grid-cols-1 gap-y-4 lg:gap-y-16 overflow-hidden">
                    {
                        error ?
                            <div className="flex flex-col items-center justify-center w-full text-center gap-2">
                                <LazyLoadImage className='' src={imageError} />
                                <p className="font-semibold text-base lg:text-4xl pt-6">
                                    {`(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`}
                                </p>
                                <p className="text-xs lg:text-2xl">Silakan coba beberapa saat lagi, ya.</p>
                            </div>
                            :
                            isLoading ?
                                [...Array(8)].map((_, item) =>
                                    <Skeleton className='w-full h-12 lg:h-32' key={item} />
                                )
                                :
                                merchantList && merchantList.length > 0 ?
                                    merchantList.map((item, key) => {
                                        return (
                                            <Link to={item.merchantId.toString()} key={key} className="inline-flex items-center justify-between gap-7 font-medium w-full border-b pb-4 lg:pb-8">
                                                <div className="flex items-center gap-5 lg:gap-10 lg:text-4xl font-semibold">
                                                    <div className={`flex-center rounded-full size-10 lg:size-24 border lg:border-2 border-border`}>
                                                        <LazyLoadImage alt={item?.merchantName} src={item?.merchantImage} className={`w-full object-contain rounded-full`} />
                                                    </div>
                                                    <div>{item.merchantName}</div>
                                                </div>
                                                <ChevronRight className='text-muted-foreground size-5 lg:size-10' />
                                            </Link>
                                        )
                                    })
                                    :
                                    <div className="flex flex-col items-center justify-center w-full text-center gap-2 pt-6 lg:py-10">
                                        <LazyLoadImage className='w-60 lg:w-[35rem]' src={imageSearch} />
                                        <p className="font-semibold text-base lg:text-4xl pt-6 lg:pt-10">
                                            Ups.. Merchant yang kamu cari belum ada nih
                                        </p>
                                        <p className="text-xs lg:text-2xl">Coba ubah filter kamu atau ulangi beberapa saat lagi, ya.</p>
                                    </div>
                    }
                </div>
            </div>

            <div className='fixed bottom-6 right-6 lg:bottom-16 lg:right-16'>
                <Link to='/cart' className='bg-white size-10 lg:size-24 rounded-full flex-center border border-border shadow-lg lg:shadow-2xl relative'>
                    <ShoppingCart className='text-primary size-5 lg:size-12' />
                    <div className="bg-[#BC1B30] text-white size-5 lg:size-11 flex-center absolute -top-2 -right-2 rounded-full lg:text-3xl">
                        {getCartItemLength()}
                    </div>
                </Link>
            </div>

            <BottomSheetStation isOpen={isOpen} onClose={() => setOpen(false)} />
        </>
    );
}
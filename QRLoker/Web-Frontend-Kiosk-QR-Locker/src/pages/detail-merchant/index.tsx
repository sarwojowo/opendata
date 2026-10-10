import { Link, useNavigate, useParams } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ArrowLeftIC from '@/assets/img/vector-icon/arrow-left.svg'
import { formatRupiah } from "@/lib/helper";
import { useStationStore } from "@/stores/useStationStore";
import { Search, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useFetchWithAxios } from "@/lib/axios/useFetch";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import SkeletonProduct from "@/components/loader/SkeletonProduct";
import imageSearch from '@/assets/img/search-item.svg'
import imageError from '@/assets/img/error.svg'

export default function DetailProductPage() {
    const navigate = useNavigate()
    const { slug } = useParams()
    const station = useStationStore((state) => state.station);

    const [search, setSearch] = useState('')
    const debouceValue = useDebounce(search, 500)

    const { data: merchant } = useFetchWithAxios<any>(`/kiosk/merchants/${slug}`)
    const { data: productList, isLoading, error } = useFetchWithAxios<IProduct[]>(`/kiosk/products?stationId=${station?.id}&merchantId=${slug}&product=${debouceValue ?? ''}`)
    const getCartItemLength = useCartStore((state) => state.getCartItemLength);

    return (
        <>
            <header className="sticky top-0 z-20 bg-white border-b-2 border-border grid grid-cols-12 items-center px-6 lg:px-16 h-20 lg:h-44">
                <button onClick={() => navigate(-1)} className='col-span-3'>
                    <img alt="arrow-left" src={ArrowLeftIC} className='w-6 lg:w-16' />
                </button>
                <div className='col-span-6 justify-self-center font-bold text-base lg:text-[42px]'>{station?.name}</div>
                <div className="col-span-3 justify-self-end">
                    <div className={`flex-center rounded-full size-10 lg:size-24 border lg:border-2 border-border`}>
                        <LazyLoadImage alt={merchant?.name} src={merchant?.image} className={`w-full object-contain rounded-full`} />
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-8 lg:gap-20 mt-8 lg:mt-16 px-6 lg:px-16 pb-40">
                <div className="flex items-end justify-between">
                    <h3 className="font-bold text-base lg:text-[42px] w-3/4 leading-tight">Semua produk {merchant?.name} pada stasiun ini</h3>
                </div>
                <div className="relative">
                    <input placeholder="Cari produk" className="outline-none bg-white border-2 border-border w-full h-12 lg:h-32 rounded-lg lg:rounded-4xl pl-12 lg:pl-28 pr-10 focus:border-primary duration-300 lg:focus:ring-2 focus:ring-primary"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute top-3.5 left-4 lg:top-10 lg:left-10 text-muted-foreground lg:size-12" />
                </div>
                {
                    error ?
                        <div className="flex flex-col items-center justify-center w-full text-center gap-2 h-[60vh]">
                            <LazyLoadImage className='' src={imageError} />
                            <p className="font-semibold text-base lg:text-4xl pt-6">
                                {`(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`}
                            </p>
                            <p className="text-xs lg:text-2xl">Silakan coba beberapa saat lagi, ya.</p>
                        </div>
                        :
                        isLoading ?
                            <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:gap-y-24 lg:gap-x-12 overflow-hidden">
                                {[...Array(8)].map((_, item) =>
                                    <SkeletonProduct key={item} />
                                )}
                            </div>
                            :
                            productList && productList.length > 0 ?
                                <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:gap-y-24 lg:gap-x-12 overflow-hidden">
                                    {productList.slice(0, 4).map((item, key) => {
                                        return (
                                            <Link to={`/browse-product/${item.id}`} key={key} className="inline-flex flex-col gap-2 lg:gap-7 font-medium w-full">
                                                <div className="bg-zinc-200/90 rounded-lg lg:rounded-3xl w-full aspect-square relative">
                                                    <LazyLoadImage alt={item?.title} src={item?.thumbnail} className='w-full h-full object-contain rounded-lg lg:rounded-3xl' />
                                                    {item.discount > 0 ?
                                                        <div className="font-bold text-xs lg:text-3xl bg-white text-app-orange rounded-full absolute top-2 left-2 lg:top-5 lg:left-5 flex-center px-2 py-1 lg:px-3 lg:py-2.5">
                                                            -{Number(item.discount)}%
                                                        </div> : null
                                                    }
                                                </div>
                                                <div className="flex items-center gap-2 lg:gap-5 text-xs lg:text-3xl">
                                                    <div className={`flex-center rounded-full size-5 lg:size-10 p-0`}>
                                                        <LazyLoadImage alt={item.merchant} src={item.merchant_image} className={`w-full object-contain rounded-full`} />
                                                    </div>
                                                    <div>{item.merchant}</div>
                                                </div>
                                                <div className="flex flex-col gap-1 lg:gap-4">
                                                    <h4 className="font-bold">{item.title}</h4>
                                                    {item.discount > 0 ?
                                                        <div className="flex items-center gap-1.5 lg:gap-4">
                                                            <div className="lg:text-3xl line-through text-muted-foreground">{formatRupiah(item.price)}</div>
                                                            <div className="font-bold">{formatRupiah(item.disc_price)}</div>
                                                        </div>
                                                        :
                                                        <div className="font-bold">{formatRupiah(item.price)}</div>
                                                    }
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                                :
                                <div className="flex flex-col items-center justify-center w-full text-center gap-2 pt-6 lg:py-10 h-[60vh]">
                                    <LazyLoadImage className='w-60 lg:w-[35rem]' src={imageSearch} />
                                    <p className="font-semibold text-base lg:text-4xl pt-6 lg:pt-10">
                                        Ups.. Produk yang kamu cari belum ada nih
                                    </p>
                                    <p className="text-xs lg:text-2xl">Coba ubah filter kamu atau ulangi beberapa saat lagi, ya.</p>
                                </div>

                }
            </div>

            <div className='fixed bottom-6 right-6 lg:bottom-16 lg:right-16'>
                <Link to='/cart' className='bg-white size-10 lg:size-24 rounded-full flex-center border border-border shadow-lg lg:shadow-2xl relative'>
                    <ShoppingCart className='text-primary size-5 lg:size-12' />
                    <div className="bg-[#BC1B30] text-white size-5 lg:size-11 flex-center absolute -top-2 -right-2 rounded-full lg:text-3xl">
                        {getCartItemLength()}
                    </div>
                </Link>
            </div>
        </>
    );
}
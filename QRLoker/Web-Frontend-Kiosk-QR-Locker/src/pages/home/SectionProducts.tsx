import { useFetchWithAxios } from "@/lib/axios/useFetch";
import { useStationStore } from "@/stores/useStationStore";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useSearchParams } from "react-router-dom";
import imageError from '@/assets/img/error.svg'
import imageSearch from '@/assets/img/search-item.svg'
import SkeletonProduct from "@/components/loader/SkeletonProduct";
import { formatRupiah } from "@/lib/helper";

export default function SectionProducts() {
    const station = useStationStore(state => state.station)
    const [searchParams] = useSearchParams()
    const search = searchParams.get('search')

    const { data: productList, isLoading, error } = useFetchWithAxios<IProduct[]>(`/kiosk/products?stationId=${station?.id ?? ''}&product=${search ?? ''}`)

    return (
        <>
            <div className="space-y-6 lg:space-y-14">
                {station ?
                    <div className="flex items-end justify-between">
                        <h3 className="font-bold text-base lg:text-[42px]">Promo di {station?.name}</h3>
                        <Link to='/browse-product' className="font-semibold lg:text-3xl underline">Lihat Semua</Link>
                    </div> : null
                }
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
                            <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:gap-y-24 lg:gap-x-12 overflow-hidden">
                                {[...Array(4)].map((_, item) =>
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
                                <div className="flex flex-col items-center justify-center w-full text-center gap-2 pt-6 lg:py-10">
                                    <LazyLoadImage className='w-60 lg:w-[35rem]' src={imageSearch} />
                                    <p className="font-semibold text-base lg:text-4xl pt-6 lg:pt-10">
                                        Ups.. Produk yang kamu cari belum ada nih
                                    </p>
                                    <p className="text-xs lg:text-2xl">Coba ubah filter kamu atau ulangi beberapa saat lagi, ya.</p>
                                </div>

                }
            </div>
        </>
    );
}
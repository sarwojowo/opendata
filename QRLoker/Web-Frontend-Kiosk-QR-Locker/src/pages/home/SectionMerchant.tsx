import { Skeleton } from "@/components/ui/skeleton";
import { useFetchWithAxios } from "@/lib/axios/useFetch";
import { useStationStore } from "@/stores/useStationStore";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import imageSearch from '@/assets/img/search-item.svg'
import imageError from '@/assets/img/error.svg'

export default function SectionMerchant() {
    const navigate = useNavigate()

    const station = useStationStore(state => state.station)
    const [searchParams] = useSearchParams()
    const search = searchParams.get('search')

    const { data: merchantList, isLoading, error } = useFetchWithAxios<IMerchant[]>(`/kiosk/merchants?stationId=${station?.id ?? ''}&merchant=${search ?? ''}`)

    return (
        <>
            <div className="space-y-6 lg:space-y-14">
                {station ?
                    <div className="flex items-end justify-between">
                        <h3 className="font-bold text-base lg:text-[42px]" onDoubleClick={() => navigate('/pick-up')}>Merchant</h3>
                        <Link to='/browse-merchant' className="font-semibold lg:text-3xl underline">Lihat Semua</Link>
                    </div> : null
                }
                <div className="w-full inline-flex justify-start items-start gap-9 lg:gap-[84px] overflow-y-hidden overflow-x-auto pb-2">
                    {
                        error ?
                            <div className="flex items-center gap-6 lg:gap-12">
                                <LazyLoadImage className='h-20 lg:h-40' src={imageError} />
                                <div className="flex flex-col gap-1 lg:gap-4">
                                    <p className="font-semibold text-xs lg:text-4xl pt-6 lg:pt-10">{`${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`}</p>
                                    <p className="text-xs lg:text-2xl">Coba ubah filter kamu atau ulangi beberapa saat lagi, ya.</p>
                                </div>
                            </div>
                            :
                            isLoading ?
                                [...Array(4)].map((_, item) =>
                                    <Skeleton key={item} className="rounded-full size-16 lg:size-44" />
                                )
                                :
                                merchantList && merchantList.length > 0 ?
                                    merchantList.map((item, key) =>
                                        <Link to={`/browse-merchant/${item.merchantId}`} key={key} className="inline-flex flex-col items-center gap-3 lg:gap-8 font-medium w-max">
                                            <div className={`flex-center rounded-full size-14 lg:size-32 border lg:border-2`}>
                                                <LazyLoadImage alt={item.merchantName} src={item.merchantImage} className={`w-full object-contain rounded-full`} />
                                            </div>
                                            <div className="w-max">{item.merchantName}</div>
                                        </Link>
                                    )
                                    :
                                    <div className="flex items-center gap-6">
                                        <LazyLoadImage className='h-20 lg:h-40' src={imageSearch} />
                                        <div className="flex flex-col gap-1 lg:gap-4">
                                            <p className="font-semibold text-base lg:text-4xl pt-6 lg:pt-10">Merchant belum tersedia</p>
                                            <p className="text-xs lg:text-2xl">Coba ubah filter kamu atau ulangi beberapa saat lagi, ya.</p>
                                        </div>
                                    </div>
                    }
                </div>
            </div>
        </>
    );
}
import { Sheet } from 'react-modal-sheet';
import { useRef, useState, type FC } from 'react';
import { useStationStore, type IStation } from '@/stores/useStationStore';
import { useShallow } from 'zustand/shallow';
import { Check, ChevronRight, Search } from 'lucide-react';
import { useFetchWithAxios } from '@/lib/axios/useFetch';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Skeleton } from './ui/skeleton';
import imageError from '@/assets/img/error.svg'
import useDebounce from '@/hooks/useDebounce';
import { useCartStore } from '@/stores/useCartStore';
import axios from '@/lib/axios';
import ErrorPopup from './popups/ErrorPopup';
import ErrorIC from '@/assets/img/logistics.svg'
import FullLoader from './loader/FullLoader';
import imageSearch from '@/assets/img/search-item.svg'

type Props = {
    isOpen: boolean,
    onClose: () => any
};

const BottomSheetStation: FC<Props> = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('')
    const [isFullLoading, setIsFullLoading] = useState(false)
    const [isError, setIsError] = useState('')
    const debouceValue = useDebounce(search, 500)
    const ref = useRef<any>(null);

    const { station, setStation } = useStationStore(
        useShallow((state) => ({
            station: state.station,
            setStation: state.setStation,
        }))
    );

    const { data: stattionList, isLoading, error } = useFetchWithAxios<IStation[]>(`/kiosk/stations?search=${debouceValue}`)
    const clearCart = useCartStore(state => state.clearCart)

    const handleSelectStation = (item: IStation) => {
        if (item.id === station?.id) {
            setStation(undefined)
        } else {
            handleGetAvailableLocker(item)
        }
    }

    const handleGetAvailableLocker = async (selectedStation: IStation) => {
        try {
            setIsFullLoading(true)
            const { data } = await axios.get(`/kiosk/available-locker?stationId=${selectedStation.id}`)
            console.log(data)

            clearCart()
            setStation(selectedStation)
            onClose()
        } catch (error: any) {
            onClose()
            setIsError(`(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`)
        } finally {
            setIsFullLoading(false)
        }
    }

    return (
        <>
            <Sheet ref={ref}
                isOpen={isOpen} onClose={onClose}
                snapPoints={[0, 170, 0.5, -50, 1]}
                // modalEffectRootId="root"
                onSnap={(snapIndex) =>
                    console.log('> Current snap point index:', snapIndex)
                }
            >
                <Sheet.Container className='!rounded-t-2xl lg:!rounded-t-[40px] font-jakarta lg:text-4xl'>
                    <Sheet.Header>
                        <div className='px-6 lg:px-16 space-y-4 lg:space-y-10 pt-5 lg:pt-8'>
                            <div className='flex-center'>
                                <div className='bg-zinc-300 rounded-full h-2 w-20 lg:h-5 lg:w-40'></div>
                            </div>
                            <h2 className='font-bold text-base lg:text-[42px]'>Pilih Stasiun</h2>
                        </div>
                    </Sheet.Header>
                    <Sheet.Content className='overflow-hidden pb-8 lg:pb-28 grow flex flex-col'>
                        <div className='px-6 lg:px-16 pt-6 lg:pt-10'>
                            <div className="relative">
                                <input placeholder="Cari stasiun" className="outline-none bg-white border-2 border-border w-full h-12 lg:h-32 rounded-xl lg:rounded-4xl pl-12 lg:pl-32 lg:pr-10 focus:border-primary duration-300 focus:ring-1 lg:focus:ring-2 focus:ring-primary"
                                    value={search} onChange={(e) => setSearch(e.target.value)}
                                />
                                <Search className="absolute top-3.5 left-5 lg:top-10 lg:left-14 text-muted-foreground size-5 lg:size-12" />
                            </div>
                        </div>
                        <div className='px-6 lg:px-16 font-semibold space-y-1 pt-6 lg:pt-8 pb-28'>
                            {error ?
                                <div className="flex flex-col items-center justify-center h-[70vh] w-full text-center gap-2">
                                    <LazyLoadImage className='' src={imageError} />
                                    <p className="font-semibold text-base lg:text-4xl pt-6">
                                        {`(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`}
                                    </p>
                                    <p className="text-xs lg:text-2xl">Silakan coba beberapa saat lagi, ya.</p>
                                </div>
                                :
                                isLoading ?
                                    [...Array(10)].map((_, item) =>
                                        <Skeleton className='w-full h-12 lg:h-32 mb-6 lg:mb-15' key={item} />
                                    )
                                    :
                                    stattionList && stattionList.length > 0 ?
                                        stattionList.map((item, key) =>
                                            <div key={key} className='flex justify-between items-center cursor-pointer h-12 lg:h-28' onClick={() => handleSelectStation(item)}>
                                                <div className={`${station?.id === item.id ? 'text-primary' : ''}`}>{item.name}</div>
                                                {station?.id === item.id ?
                                                    <Check className='size-5 lg:size-12 text-primary' />
                                                    :
                                                    <ChevronRight className='size-5 lg:size-12 text-zinc-400' />
                                                }
                                            </div>
                                        )
                                        :
                                        <div className="flex flex-col items-center justify-center h-[70vh] w-full text-center gap-2">
                                            <LazyLoadImage className='lg:w-[50rem]' src={imageSearch} />
                                            <p className="font-semibold text-base lg:text-4xl pt-6">
                                                Ups.. Stasiun yang kamu cari belum ada nih
                                            </p>
                                            <p className="text-xs lg:text-2xl">Coba ubah filter kamu atau ulangi beberapa saat lagi, ya.</p>
                                        </div>
                            }
                        </div>
                    </Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop onTap={onClose} />
            </Sheet>

            {isError !== '' ? <ErrorPopup title='Upss..Loker tidak tersedia' desc='Coba ganti stasiun pilihan kamu ya' other_msg={isError} error_ic={ErrorIC} onClick={() => setIsError('')} /> : null}
            {isFullLoading ? <FullLoader /> : null}
        </>
    );
}

export default BottomSheetStation;
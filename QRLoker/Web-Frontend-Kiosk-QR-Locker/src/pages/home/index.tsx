import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Loader2, Search, ShoppingCart } from 'lucide-react'

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import BottomSheetStation from "@/components/BottomSheetStation";
import { useStationStore } from "@/stores/useStationStore";
import useMobileView from "@/hooks/useMobileView";
import useDebounce from "@/hooks/useDebounce";

const SectionMerchant = lazy(() => import("./SectionMerchant"));
const SectionProducts = lazy(() => import("./SectionProducts"));

const BannerSlider = lazy(() => import("./BannerSlider"));

export default function HomePage() {
    const [isOpen, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [search, setSearch] = useState('')

    const cart = useCartStore((state) => state.cart);
    const station = useStationStore((state) => state.station);
    const { windowWidth } = useMobileView();
    const cardLength = cart.reduce((total, item) => total + (item.quantity || 0), 0);

    const debouceValue = useDebounce(search, 500)

    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (debouceValue) setSearchParams({ search: debouceValue });
        else {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('search');
            setSearchParams(newSearchParams); // Update the URL
        }

    }, [debouceValue])

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                navigate("/");
            }, 30000); // 30 seconds
        };

        // List of events to consider as interaction
        const events = ["mousedown", "touchstart", "keydown"];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer(); // Start timer on mount

        return () => {
            clearTimeout(timerRef?.current);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [navigate]);

    useEffect(() => {
        const handleScroll = () => {
            const bannerHeight = windowWidth >= 1024 ? 800 : 80; // 50rem
            setScrolled(window.scrollY > bannerHeight);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [windowWidth]);

    // const handleDOwnload = async () => {
    //     await generateReceiptPDF({} as any)
    // }

    return (
        <>
            <div className="w-full h-[280px] lg:h-[50rem] bg-zinc-200">
                <Suspense fallback={<Skeleton className="w-full h-[280px] lg:h-[50rem]" />}>
                    <BannerSlider />
                </Suspense>
            </div>

            <div className={`fixed h-20 lg:h-44 max-w-[1080px] w-full mx-auto flex justify-between items-center px-6 lg:px-16 z-10 duration-200 ${scrolled ? 'bg-white/90 text-black shadow-lg' : 'bg-transparent text-white'}`}>
                <div className="flex flex-col lg:gap-3">
                    <div className="text-xs lg:text-2xl">Ambil di stasiun mana?</div>
                    <div className="font-bold lg:text-4xl flex items-center gap-4 lg:gap-8" onClick={() => setOpen(true)}>{station?.id ? station.name : 'Pilih stasiun tujuan dulu ya'} <ChevronDown className="size-6 lg:size-12" /></div>
                </div>
                <Link to='/cart' className="bg-white/20 size-10 lg:size-24 rounded-full flex-center relative">
                    <ShoppingCart className="size-5 lg:size-12" />
                    <div className="bg-[#BC1B30] text-white size-5 lg:size-11 flex-center absolute -top-1 -right-1 lg:-top-2 lg:-right-2 rounded-full">
                        {cardLength ?? 0}
                    </div>
                </Link>
            </div>

            <div className="flex flex-col gap-8 lg:gap-20 mt-12 lg:mt-24 px-6 lg:px-16 pb-24">
                <div className="relative">
                    <input placeholder="Mau belanja apa hari ini?" className="outline-none bg-white border-2 border-border w-full h-12 lg:h-32 rounded-lg lg:rounded-4xl pl-12 lg:pl-28 pr-10 focus:border-primary duration-300 lg:focus:ring-2 focus:ring-primary"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute top-3.5 left-4 lg:top-10 lg:left-10 text-muted-foreground lg:size-12" />
                </div>
                <div className="font-bold text-lg lg:text-5xl" onDoubleClick={() => navigate('/pick-up')}>Mau belanja apa hari ini?</div>

                {/* <button
                    onClick={handleDOwnload}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Download Receipt PDF
                </button> */}

                <Suspense fallback={<><Loader2 className="animate-spin lg:size-20" /> Please wait...</>}>
                    <SectionMerchant />
                </Suspense>

                <Suspense fallback={<><Loader2 className="animate-spin lg:size-20" /> Please wait...</>}>
                    <SectionProducts />
                </Suspense>
            </div>

            <BottomSheetStation isOpen={isOpen} onClose={() => setOpen(false)} />
        </>
    );
}

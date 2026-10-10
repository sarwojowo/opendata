import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ArrowLeftIC from '@/assets/img/vector-icon/arrow-left.svg'
import { formatRupiah } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/useCartStore";
import { useShallow } from "zustand/shallow";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import useMobileView from "@/hooks/useMobileView";
import { useFetchWithAxios } from "@/lib/axios/useFetch";
import { useStationStore } from "@/stores/useStationStore";
import SkeletonProduct from "@/components/loader/SkeletonProduct";
import imageSearch from '@/assets/img/search-item.svg'
import imageError from '@/assets/img/error.svg'
import { Skeleton } from "@/components/ui/skeleton";

export default function DetailProductPage() {
    const [qty, setQty] = useState(1)
    const [isAdding, setIsAdding] = useState(false)
    const [flyImage, setFlyImage] = useState<{
        src: string;
        style: CSSProperties;
    } | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const { windowWidth } = useMobileView();

    const { slug } = useParams()
    const navigate = useNavigate()
    const station = useStationStore((state) => state.station);

    const imgRef = useRef<any>(null);
    const cartRef = useRef<any>(null);

    const { data: product, isLoading: isLoadingProduct, error } = useFetchWithAxios<IProduct>(`/kiosk/products/${slug}`)
    const { data: productList, isLoading: isLoadingProductList, error: errorProductList } = useFetchWithAxios<IProduct[]>(`/kiosk/products?stationId=${station?.id ?? ''}&merchantId=${product?.merchant_id}`)

    useEffect(() => {
        const handleScroll = () => {
            const bannerHeight = windowWidth >= 1024 ? 800 : 80; // 50rem
            setScrolled(window.scrollY > bannerHeight);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [windowWidth]);

    useEffect(() => {
        setQty(1)

        return () => setQty(1)
    }, [slug])

    const { directCheckout, addToCartWithQty, cart } = useCartStore(
        useShallow((state) => ({
            cart: state.cart,
            directCheckout: state.directCheckout,
            addToCartWithQty: state.addToCartWithQty
        }))
    );

    const cardLength = cart.reduce((total, item) => total + (item.quantity || 0), 0);

    const handleDirectCheckout = () => {
        setIsLoading(true)
        const checkout = {
            ...product,
            quantity: qty,
        } as IProduct

        directCheckout(checkout)
        navigate('/checkout')
    }

    const handleAddtoCart = () => {
        setIsAdding(true)
        addToCartWithQty(product!, qty)

        const img = imgRef.current;
        const cart = cartRef.current;
        if (!img || !cart) return;

        const imgRect = img.getBoundingClientRect();
        const cartRect = cart.getBoundingClientRect();

        const deltaX = cartRect.left - imgRect.left;
        const deltaY = cartRect.top - imgRect.top;

        const vm = windowWidth >= 1024 ? -500 : -100;

        const flyImg = {
            src: img.src,
            style: {
                position: 'fixed' as const,
                top: vm + 'px',
                left: imgRect.left + 'px',
                width: imgRect.width + 'px',
                height: imgRect.height + 'px',
                zIndex: 9999,
                transition: 'transform 2.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 2s',
                transform: 'translate(0, 0) scale(1.5)',
                pointerEvents: 'none',
            }
        };

        // @ts-ignore
        setFlyImage(flyImg);

        // Trigger transition in next frame
        requestAnimationFrame(() => {
            setFlyImage((prev) =>
                prev
                    ? {
                        ...prev,
                        style: {
                            ...prev.style,
                            transform: `translate(${deltaX}px, ${deltaY}px) scale(0.3)`,
                            opacity: 0,
                        }
                    }
                    : null
            );
        });

        setTimeout(() => {
            setFlyImage(null);
            setIsAdding(false)
        }, 1800);

        if (cartRef.current) {
            cartRef.current.classList.add('cart-bounce');

            // Remove custom class to allow re-triggering
            setTimeout(() => {
                cartRef.current?.classList.remove('cart-bounce');
            }, 1000); // Same as your keyframe duration
        }
    }

    return (
        <>
            <header className={`fixed w-full top-0 z-20 grid grid-cols-3 items-center px-6 lg:px-16 h-20 lg:h-44 duration-200 ${scrolled ? 'bg-white/90 shadow-lg' : 'bg-transparent'}`}>
                <Link to={'..'} onClick={(e) => {
                    e.preventDefault();
                    navigate(-1);
                }}
                >
                    <img alt="arrow-left" src={ArrowLeftIC} className='w-6 lg:w-16' />
                </Link>
                <div className="justify-self-center flex items-center gap-2 lg:gap-5 lg:text-3xl font-bold">
                    <div className={`flex-center rounded-full size-5 lg:size-10 border lg:border-2 border-border`}>
                        <LazyLoadImage alt={product?.merchant} src={product?.merchant_image} className='w-full object-contain rounded-full' />
                    </div>
                    <div>{product?.merchant}</div>
                </div>
                <Link to='/cart' className="justify-self-end-safe size-11 lg:size-24 rounded-full flex-center relative" ref={cartRef}>
                    <ShoppingCart className="size-5 lg:size-12" />
                    <div className="bg-[#BC1B30] text-white size-5 lg:size-11 flex-center absolute top-1 right-1 rounded-full">
                        {cardLength}
                    </div>
                </Link>
            </header>

            {error ?
                <div className="flex flex-col items-center justify-center w-full text-center gap-2 h-[50vh]">
                    <LazyLoadImage className='' src={imageError} />
                    <p className="font-semibold text-base lg:text-4xl pt-6">
                        {`(${error?.response?.data?.code || error?.response?.status || '-'}) ${error?.response?.data?.message || error?.response?.statusText || error?.message || "Sorry, error has occured"}`}
                    </p>
                    <p className="text-xs lg:text-2xl">Silakan coba beberapa saat lagi, ya.</p>
                </div>
                :
                isLoadingProduct ?
                    <>
                        <div className="bg-accent animate-pulse w-full h-[50vh] lg:h-[60vh] flex-center">
                            <Loader2 className="size-16 lg:size-32 animate-spin" />
                        </div>
                        <div className="w-full space-y-5 lg:space-y-10 mt-6 lg:mt-16">
                            <Skeleton className="w-1/2 h-10 lg:h-24" />
                            <Skeleton className="w-full h-6 lg:h-16" />
                            <Skeleton className="w-full h-6 lg:h-16" />
                        </div>
                    </>
                    :
                    <>
                        <img ref={imgRef} alt={product?.title} src={product?.thumbnail} className='w-full lg:h-[75rem] object-cover' />

                        <div className="px-6 lg:px-16 mt-8 lg:mt-16 space-y-1">
                            <h1 className="text-lg lg:text-5xl leading-tight">{product?.title}</h1>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    {product?.discount! > 0 ?
                                        <div className="font-bold text-xs lg:text-3xl bg-white text-app-orange rounded-full mr-2 lg:mr-4 flex-center">
                                            -{Number(product?.discount)}%
                                        </div> : null
                                    }
                                    {product?.discount! > 0 ?
                                        <div className="flex items-center gap-1 lg:gap-4">
                                            <div className="lg:text-3xl line-through text-muted-foreground">{formatRupiah(product?.price!)}</div>
                                            <div className="font-bold">{formatRupiah(product?.disc_price!)}</div>
                                        </div>
                                        :
                                        <div className="font-bold">{formatRupiah(product?.price!)}</div>
                                    }
                                </div>
                                <div className="h-10 lg:h-20 flex">
                                    <button className="border-2 border-border border-r-transparent rounded-l-lg lg:rounded-l-2xl h-full w-10 lg:w-20 flex-center lg:pb-3 disabled:opacity-40" disabled={qty <= 1}
                                        onClick={() => setQty(prev => prev - 1)}
                                    >
                                        -
                                    </button>
                                    <div className="outline-none w-10 lg:w-20 border-2 border-border h-full flex-center">{qty}</div>
                                    <button className="border-2 border-border border-l-transparent rounded-r-lg lg:rounded-r-2xl h-full w-10 lg:w-20 flex-center lg:pb-3 text-primary disabled:opacity-40"
                                        disabled={qty >= product?.stock!} onClick={() => setQty(prev => prev + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 lg:px-16 mt-1 lg:mt-6 text-xs lg:text-3xl">
                            {product?.stock! <= 0 ? <div className="text-red-500 font-medium">Stok produk habis</div> :
                                product?.stock! <= 5 ? <div className="text-app-orange font-medium">Stok produk sisa <strong>{product?.stock}</strong></div>
                                    : null
                            }
                        </div>
                    </>
            }

            <div className="flex flex-col gap-8 lg:gap-20 mt-6 lg:mt-12 px-6 lg:px-16 pb-80">
                <div className="py-6 lg:py-16 space-y-3 lg:space-y-6 border-y lg:border-y-2 border-border">
                    <h3 className="font-bold">Deskripsi</h3>
                    <p className="text-xs lg:text-3xl lg:leading-tight">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries</p>
                </div>

                <div className="flex items-end justify-between">
                    <h3 className="font-bold text-base lg:text-[42px]">Beli lagi di {product?.merchant}</h3>
                    <Link to={`/browse-merchant/${product?.merchant_id}`} className="font-semibold lg:text-3xl underline">Lihat Semua</Link>
                </div>
                {
                    (error || errorProductList) ?
                        <div className="flex flex-col items-center justify-center w-full text-center gap-2 min-h-[60vh]">
                            <LazyLoadImage className='' src={imageError} />
                            <p className="font-semibold text-base lg:text-4xl pt-6">
                                {`(${errorProductList?.response?.data?.code || errorProductList?.response?.status || '-'}) ${errorProductList?.response?.data?.message || errorProductList?.response?.statusText || errorProductList?.message || "Sorry, error has occured"}`}
                            </p>
                            <p className="text-xs lg:text-2xl">Silakan coba beberapa saat lagi, ya.</p>
                        </div>
                        :
                        (isLoadingProduct || isLoadingProductList) ?
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

            <div className="fixed bottom-0 w-full bg-white h-24 lg:h-56 px-6 lg:px-16 grid grid-cols-2 gap-4 lg:gap-10 items-center border-t lg:border-t-2 border-border z-10">
                <Button variant='outline' disabled={isLoading || product?.stock! <= 0} onClick={handleDirectCheckout} className="border-primary text-primary w-full">
                    {product?.stock! > 0 ? 'Beli Langsung' : 'Stok Habis'} {isLoading ? <Loader2 className='ml-2 animate-spin text-teal-500' /> : null}
                </Button>
                <Button disabled={isAdding || qty > product?.stock!} onClick={handleAddtoCart}><Plus size={36} className="mr-1 size-4 lg:size-9" /> {product?.stock! > 0 ? 'Keranjang' : 'Stok Habis'}</Button>
            </div>

            {flyImage && (
                <img
                    src={flyImage.src}
                    style={flyImage.style}
                    alt="flying-product"
                    className="rounded-3xl object-contain"
                />
            )}
        </>
    );
}
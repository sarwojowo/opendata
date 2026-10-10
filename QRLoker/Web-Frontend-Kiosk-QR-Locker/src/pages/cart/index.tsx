import ArrowLeftIC from '@/assets/img/vector-icon/arrow-left.svg'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatRupiah, groupProductsByMerchant } from '@/lib/helper';
import { useCartStore } from '@/stores/useCartStore';
import { useEffect, useMemo, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Link, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import EmptyCartIC from '@/assets/img/empty-cart.svg';
import ConfirmPopup from '@/components/popups/ConfirmPopup';
import { Minus, Trash2 } from 'lucide-react';
import { useFetchWithAxios } from '@/lib/axios/useFetch';
import { useStationStore } from '@/stores/useStationStore';
import imageSearch from '@/assets/img/search-item.svg'
import imageError from '@/assets/img/error.svg'
import SkeletonProduct from '@/components/loader/SkeletonProduct';

export default function CartPage() {
    const navigate = useNavigate()
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [deleteItem, setDeleteItem] = useState<IProduct | undefined>()
    const [showConfirmRemoveMultiItem, setShowConfirmRemoveMultiItem] = useState(false)

    const { cart, addToCart, reduceFromCart, removeMultiItemFromCart, checkout } = useCartStore(
        useShallow((state) => ({
            cart: state.cart,
            addToCart: state.addToCart,
            reduceFromCart: state.reduceFromCart,
            removeMultiItemFromCart: state.removeMultiItemFromCart,
            checkout: state.checkout,
        }))
    );
    const cartData = groupProductsByMerchant(cart)

    const station = useStationStore((state) => state.station);
    const uniqueIds = Array.from(new Set(cart.map(item => item.merchant_id)));

    const { data: productList, isLoading: isLoadingProductList, error: errorProductList } = useFetchWithAxios<IProduct[]>(`/kiosk/relate-products?stationId=${station?.id ?? ''}&merchants=${uniqueIds.join(',')}`)

    useEffect(() => {
        if (cart && cart.length <= 0) setSelectedItems([])
    }, [cart])

    const toggleItemSelection = (id: string) => {
        setSelectedItems((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        setSelectedItems(selectedItems.length === cart.length ? [] : cart.map((item) => item.title));
    };

    const totalPrice = useMemo(() => {
        return cart
            .filter((item) => selectedItems.includes(item.title))
            .reduce((sum, item) => sum + item.disc_price * item.quantity!, 0);
    }, [cart, selectedItems]);

    const totalItem = useMemo(() => {
        return cart
            .filter((item) => selectedItems.includes(item.title))
            .reduce((sum, item) => sum + item.quantity!, 0);
    }, [cart, selectedItems]);

    const handleCheckout = () => {
        checkout(selectedItems)
        navigate('/checkout')
    }

    const handleReduceQty = (title: string, oldQty: number) => {
        if (oldQty - 1 <= 0) {
            const product = cart.find(item => item.title === title)
            setDeleteItem(product)
        } else {
            reduceFromCart(title)
        }
    }

    return (
        <>
            <header className="sticky top-0 z-20 bg-white border-b-2 border-border px-6 lg:px-16">
                <div className='grid grid-cols-12 items-center h-20 lg:h-44'>
                    <button className="col-span-3" onClick={() => navigate(-1)}>
                        <img alt="arrow-left" src={ArrowLeftIC} className='w-6 lg:w-16' />
                    </button>
                    <div className='col-span-6 justify-self-center font-bold text-base lg:text-[42px]'>Keranjang Kamu</div>
                    <div className='col-span-3 justify-self-end underline text-primary text-3xl font-bold'></div>

                </div>
                {selectedItems && selectedItems.length > 0 ?
                    <div className='flex items-center justify-between pt-1 lg:pt-3 pb-2 lg:pb-6'>
                        <div className='font-medium'><strong>{selectedItems.length}</strong> produk terpilih</div>
                        <div className='font-bold text-primary cursor-pointer' onClick={() => setShowConfirmRemoveMultiItem(true)}>Hapus</div>
                    </div> : null
                }
            </header>


            {cart?.length && cart?.length > 0 ?
                <div className="flex flex-col gap-8 lg:gap-20 mt-8 lg:mt-16 px-6 lg:px-16 pb-40 lg:pb-80">

                    <div className="pb-6 lg:pb-16 space-y-7 lg:space-y-16 border-b lg:border-b-2 border-border">
                        {cartData.map((item, key) => {
                            const merchant = item.products[0]
                            return (
                                <div key={key} className='space-y-3 lg:space-y-12'>
                                    <div className="flex items-center gap-8 font-bold">
                                        <div className={`flex-center rounded-full size-6 lg:size-14 border lg:border-2 border-border`}>
                                            <LazyLoadImage alt={merchant.merchant} src={merchant.merchant_image} className={`w-full object-contain rounded-full`} />
                                        </div>
                                        <div>{item.merchant}</div>
                                    </div>
                                    <div className='space-y-5 lg:space-y-10'>
                                        {item.products.map((prod, key1) => {
                                            return (
                                                <div key={key1} className='flex items-center justify-between gap-4 lg:gap-10'>
                                                    <div className='flex items-center gap-3 lg:gap-8'>
                                                        <Checkbox id={`check-${prod.title}`}
                                                            checked={selectedItems.includes(prod.title)}
                                                            onCheckedChange={() => toggleItemSelection(prod.title)}
                                                        />
                                                        <label className='flex items-center gap-3 lg:gap-8' htmlFor={`check-${prod.title}`}>
                                                            <div className='min-w-16 min-h-16 max-h-16 max-w-16 lg:min-w-36 lg:min-h-36 lg:max-w-36 lg:max-h-36'>
                                                                <LazyLoadImage alt={prod.title} src={prod.thumbnail} className='w-full h-full rounded-lg lg:rounded-xl' />
                                                            </div>
                                                            <div className='space-y-1.5 lg:space-y-5 lg:text-[33px]'>
                                                                <div className='font-bold leading-tight'>{prod.title}</div>
                                                                {prod.discount > 0 ?
                                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                                                                        <div className="lg:text-3xl line-through text-muted-foreground">{formatRupiah(prod.price)}</div>
                                                                        <div className="font-bold">{formatRupiah(prod.disc_price)}</div>
                                                                    </div>
                                                                    :
                                                                    <div className="font-bold">{formatRupiah(prod.price)}</div>
                                                                }
                                                            </div>
                                                        </label>
                                                    </div>
                                                    <div className="h-8 lg:h-20 flex">
                                                        <button className="border-2 border-border border-r-transparent rounded-l-lg lg:rounded-l-2xl h-full w-8 lg:w-20 flex-center" disabled={prod.quantity <= 0} onClick={() => handleReduceQty(prod.title, prod.quantity)}>
                                                            {prod.quantity > 1 ? <Minus className='size-3 lg:size-8' /> : <Trash2 className='size-3 lg:size-9' />}
                                                        </button>
                                                        <div className="outline-none w-8 lg:w-20 border-2 border-border h-full flex-center font-semibold lg:text-3xl">{prod.quantity}</div>
                                                        <button className="border-2 border-border border-l-transparent rounded-r-lg lg:rounded-r-2xl h-full w-8 lg:w-20 flex-center lg:pb-3 text-primary disabled:opacity-35"
                                                            disabled={prod.quantity >= prod.stock} onClick={() => addToCart(prod)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex items-end justify-between">
                        <h3 className="font-bold text-base lg:text-[42px]">Produk yang relevan</h3>
                    </div>
                    {
                        (errorProductList) ?
                            <div className="flex flex-col items-center justify-center w-full text-center gap-2 min-h-[60vh]">
                                <LazyLoadImage className='' src={imageError} />
                                <p className="font-semibold text-base lg:text-4xl pt-6">
                                    {`(${errorProductList?.response?.data?.code || errorProductList?.response?.status || '-'}) ${errorProductList?.response?.data?.message || errorProductList?.response?.statusText || errorProductList?.message || "Sorry, error has occured"}`}
                                </p>
                                <p className="text-xs lg:text-2xl">Silakan coba beberapa saat lagi, ya.</p>
                            </div>
                            :
                            (isLoadingProductList) ?
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
                                            Ups.. Produk terkait tidak tersedia
                                        </p>
                                        <p className="text-xs lg:text-2xl">Coba ulangi beberapa saat lagi, ya.</p>
                                    </div>

                    }

                </div>
                :
                <div className='flex-center h-[80vh] lg:h-[75vh] flex-col px-6 lg:px-16 gap-8 lg:gap-20'>
                    <LazyLoadImage alt='no-cart' src={EmptyCartIC} />
                    <div className='flex flex-col items-center gap-1 lg:gap-5'>
                        <div className='font-bold text-base lg:text-[42px]'>Ups, keranjang kamu masih kosong!</div>
                        <div className='lg:text-3xl text-center w-8/12 leading-tight'>Temukan penawaran menarik dan tambahkan ke keranjang sekarang!</div>
                    </div>
                </div>
            }

            <div className="fixed bottom-0 w-full bg-white h-24 lg:h-52 px-6 lg:px-16 flex justify-between items-center border-t lg:border-t-2 border-border z-10">
                <div className="flex items-center gap-2 lg:gap-8">
                    <Checkbox id="check-all" checked={selectedItems.length === cart.length && cart.length > 0} onCheckedChange={toggleSelectAll} disabled={cart.length <= 0} />
                    <label htmlFor="check-all" className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                        Pilih Semua
                    </label>
                </div>
                <div className='flex items-center gap-3 lg:gap-8'>
                    <div className='font-bold text-base lg:text-[42px]'>{selectedItems.length > 0 ? formatRupiah(totalPrice) : null}</div>
                    <Button disabled={totalItem <= 0} className='w-28 lg:w-72 font-semibold' onClick={handleCheckout}>Beli ({totalItem})</Button>
                </div>
            </div>

            {deleteItem ?
                <ConfirmPopup icon={deleteItem.thumbnail} title='Hapus barang?' desc={`Apa kamu yakin untuk menghapus produk ${deleteItem.title} dari keranjang?`}
                    onNo={() => setDeleteItem(undefined)} onYes={() => { reduceFromCart(deleteItem.title); setDeleteItem(undefined) }}
                />
                :
                null
            }

            {showConfirmRemoveMultiItem ?
                <ConfirmPopup title={`Hapus ${selectedItems.length} barang?`} desc={`Produk yang kamu pilih akan dihapus dari Keranjang.`}
                    onNo={() => setShowConfirmRemoveMultiItem(false)} onYes={() => { removeMultiItemFromCart(selectedItems); setShowConfirmRemoveMultiItem(false); }}
                />
                :
                null
            }
        </>
    );
}
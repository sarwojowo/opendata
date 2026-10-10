type IProduct = {
    id: number;
    title: string;
    discount: number;
    price: number;
    disc_price: number;
    thumbnail: string;
    stock?: number;
    quantity?: number
    merchant_id: number;
    merchant: string;
    merchant_image: string;
    station_name: string;
};

type IGroupedByMerchant = {
    merchant: string;
    products: Product[];
};

type IMerchant = {
    merchantId: number
    merchantName: string
    merchantImage: string
    stationId: number
    stationName: string
}
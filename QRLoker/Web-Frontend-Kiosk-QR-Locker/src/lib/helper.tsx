import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { MERCHANT_LIST } from "./data";

dayjs.extend(duration);

export const servicePrice = 2500

export const convertToASCII = (hexArray: any) => {
    console.log("Length: ", hexArray.length)

    if (hexArray.length <= 2) {
        return new TextDecoder('ascii').decode(new Uint8Array(hexArray));

    } else {
        // Example: skip STX (0x02) and ETX (0x03) + CRC
        // The respose should start with 02 01 for header, or start with 01
        const headerIndex = hexArray[0] === 0x02 ? 2 : hexArray[0] === 0x01 ? 1 : 0
        // Trans Type shoudl be 31 30 for sale or 3b 33 check connection or something like that 
        const transTypeIndex = headerIndex + 2
        const stopIndex = hexArray.findIndex((b: any) => b === 0x03);
        const textOnly = hexArray.slice(transTypeIndex, stopIndex > 0 ? stopIndex : undefined);

        const cleanText = new TextDecoder('ascii').decode(new Uint8Array(textOnly));

        return cleanText
    }

}

export const getServicePrice = (totalPrice: number) => {
    if (totalPrice < 10) {
        return 0
    }

    return servicePrice
}

export const generateTrxId = (amount: number) => {
    return `${amount.toString()}${dayjs().format("YYYYMMDDHHmmsss")}`.slice(0, 20)
}

export const getMerchant = (merchantName: string) => {
    const data = MERCHANT_LIST.find(merc => merc.title.toLowerCase() === merchantName.toLowerCase())
    return data
}

export function groupProductsByMerchant(products: IProduct[]): IGroupedByMerchant[] {
    const grouped = products.reduce((acc, product) => {
        const merchant = product.merchant;
        if (!acc[merchant]) {
            acc[merchant] = [];
        }
        acc[merchant].push(product);
        return acc;
    }, {} as Record<string, IProduct[]>);

    return Object.entries(grouped).map(([merchant, products]) => ({
        merchant,
        products
    }));
}

export function formatRupiah(number: number | string) {
    return Number(number).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
}

export const expiredCookies = (day: number) => {
    const now = new Date();
    const expires = new Date(now.getTime() + day * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    return expires
}

export const terbilang = (nilai: number) => {
    nilai = Math.floor(Math.abs(nilai));

    // deklarasi nama angka dalam bahasa indonesia
    var huruf = [
        '',
        'Satu',
        'Dua',
        'Tiga',
        'Empat',
        'Lima',
        'Enam',
        'Tujuh',
        'Delapan',
        'Sembilan',
        'Sepuluh',
        'Sebelas',
    ];

    // menyimpan nilai default untuk pembagian
    var bagi = 0;
    // deklarasi variabel penyimpanan untuk menyimpan proses rumus terbilang
    var penyimpanan = '';

    // rumus terbilang
    if (nilai < 12) {
        penyimpanan = ' ' + huruf[nilai];
    } else if (nilai < 20) {
        penyimpanan = terbilang(Math.floor(nilai - 10)) + ' Belas';
    } else if (nilai < 100) {
        bagi = Math.floor(nilai / 10);
        penyimpanan = terbilang(bagi) + ' Puluh' + terbilang(nilai % 10);
    } else if (nilai < 200) {
        penyimpanan = ' Seratus' + terbilang(nilai - 100);
    } else if (nilai < 1000) {
        bagi = Math.floor(nilai / 100);
        penyimpanan = terbilang(bagi) + ' Ratus' + terbilang(nilai % 100);
    } else if (nilai < 2000) {
        penyimpanan = ' Seribu' + terbilang(nilai - 1000);
    } else if (nilai < 1000000) {
        bagi = Math.floor(nilai / 1000);
        penyimpanan = terbilang(bagi) + ' Ribu' + terbilang(nilai % 1000);
    } else if (nilai < 1000000000) {
        bagi = Math.floor(nilai / 1000000);
        penyimpanan = terbilang(bagi) + ' Juta' + terbilang(nilai % 1000000);
    } else if (nilai < 1000000000000) {
        bagi = Math.floor(nilai / 1000000000);
        penyimpanan = terbilang(bagi) + ' Miliar' + terbilang(nilai % 1000000000);
    } else if (nilai < 1000000000000000) {
        bagi = Math.floor(nilai / 1000000000000);
        penyimpanan = terbilang(nilai / 1000000000000) + ' Triliun' + terbilang(nilai % 1000000000000);
    }

    // mengambalikan nilai yang ada dalam variabel penyimpanan
    return penyimpanan;
}

export function readFile(file: any) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result), false)
        reader.readAsDataURL(file)
    })
}

export const blobToBase64 = (blob: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
    });
};

export function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getUniqueListBy(arr: any, key: string) {
    return [...new Map(arr.map((item: any) => [item[key], item])).values()]
}

export function capitalize(str: string): string {
    if (str) return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    return ''
}

export function getCountdown(bookingTimeout: string) {
    const now = dayjs();
    const endTime = dayjs(bookingTimeout);
    const diff = endTime.diff(now, "second") - 30 // Get difference in seconds

    if (diff <= 0) {
        return "00:00"; // Timer expired
    }

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getTimeLeftInSeconds(bookingTimeout: string) {
    const now = dayjs();
    const endTime = dayjs(bookingTimeout);
    // const endTime = dayjs('2025-03-11 14:27:42');
    const diffInSeconds = endTime.diff(now, "second") - 30 // Get difference in seconds

    return diffInSeconds > 0 ? diffInSeconds : 0; // Ensure non-negative values
}

export const isValidPhoneNumber = (phone: string): boolean => {
    const regex = /^(08\d{8,12}|628\d{7,11})$/;
    return regex.test(phone);
};

export function generateRandomNumber(length: number) {
    if (length <= 0) return 0; // Handle invalid lengths

    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
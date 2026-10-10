import IndomaretIC from '@/assets/img/merchant/indomaret.webp'
import CircleIC from '@/assets/img/merchant/circle-k.webp'
import GuardianIC from '@/assets/img/merchant/guardian.webp'
import LawsonIC from '@/assets/img/merchant/lawson.webp'
import WatsonIC from '@/assets/img/merchant/watson.webp'

import PanadolIC from '@/assets/img/product/panadol.svg'
import BlackmoresIC from '@/assets/img/product/blackmores.svg'
import PulpyOrangeIC from '@/assets/img/product/pulpy-orange.webp'
import ShinRamyunIC from '@/assets/img/product/shin-ramyun.webp'
import IndomieIC from '@/assets/img/product/indomie.webp'
import TehPucukIC from '@/assets/img/product/teh-pucuk.webp'
import PopMieIC from '@/assets/img/product/pop-mie.webp'
import PocariIC from '@/assets/img/product/pocari.webp'
import CetaphilIC from '@/assets/img/product/cetaphil.webp'
import STIvesIC from '@/assets/img/product/st-ives.svg'
import LARocheIC from '@/assets/img/product/laroche-posay.svg'
import MiloIC from '@/assets/img/product/milo.webp'
import Erspro from '@/assets/img/product/erspro.webp'

import QRISIC from '@/assets/img/payment/qris.webp'
import KMTIC from '@/assets/img/payment/kmt-silver.webp'

export const MERCHANT_LIST = [
    {
        title: 'Indomaret',
        img: IndomaretIC,
        padding: true
    },
    {
        title: 'Circle K',
        img: CircleIC,
        padding: false
    },
    {
        title: 'Guardian',
        img: GuardianIC,
        padding: false
    },
    {
        title: 'Lawson',
        img: LawsonIC,
        padding: true
    },
    {
        title: 'Watsons',
        img: WatsonIC,
        padding: true
    }
]


export const PRODUCT_LIST = [
    {
        merchant: 'Indomaret',
        title: 'Erspo Cheers Jersey Timnas Merah',
        discount: 99,
        price: 139000,
        disc_price: 1,
        thumbnail: Erspro
    },
    {
        merchant: 'Watsons',
        title: 'Panadol Extra',
        discount: 99,
        price: 18000,
        disc_price: 2,
        thumbnail: PanadolIC
    },
    {
        merchant: 'Guardian',
        title: 'Blackmores Fish Oil',
        discount: 99,
        price: 136000,
        disc_price: 5,
        thumbnail: BlackmoresIC
    },
    {
        merchant: 'Lawson',
        title: 'Minute Maid Pulpy Orange',
        discount: 98,
        price: 5000,
        disc_price: 3,
        thumbnail: PulpyOrangeIC
    },
    {
        merchant: 'Circle K',
        title: 'Shin Ramyun Black',
        discount: 60,
        price: 10000,
        disc_price: 4000,
        thumbnail: ShinRamyunIC
    },
    {
        merchant: 'Lawson',
        title: 'Indomie Soto Spesial',
        discount: 16,
        price: 5000,
        disc_price: 3200,
        thumbnail: IndomieIC
    },
    {
        merchant: 'Circle K',
        title: 'Teh Pucuk Harum',
        discount: 60,
        price: 10000,
        disc_price: 4000,
        thumbnail: TehPucukIC
    },
    {
        merchant: 'Guardian',
        title: 'LA Roche Posay Cica Baume B5+ BALM 100ML',
        discount: 8,
        price: 460000,
        disc_price: 368500,
        thumbnail: LARocheIC
    },
    {
        merchant: 'Circle K',
        title: 'Pop Mie Rasa Ayam',
        discount: 0,
        price: 5000,
        disc_price: 5000,
        thumbnail: PopMieIC
    },
    {
        merchant: 'Indomaret',
        title: 'Pocari Sweat',
        discount: 0,
        price: 7700,
        disc_price: 7700,
        thumbnail: PocariIC
    },
    {
        merchant: 'Guardian',
        title: 'Cetaphil 500ML',
        discount: 0,
        price: 125000,
        disc_price: 125000,
        thumbnail: CetaphilIC
    },
    {
        merchant: 'Watsons',
        title: 'ST Ives 150ML',
        discount: 0,
        price: 77657,
        disc_price: 77657,
        thumbnail: STIvesIC
    },
    {
        merchant: 'Indomaret',
        title: 'Milo',
        discount: 0,
        price: 2200,
        disc_price: 2200,
        thumbnail: MiloIC
    },
]

export const PAYMENT_LIST = [
    {
        title: 'QRIS',
        type: 'QRIS',
        desc: 'QR Code Pembayaran Nasional',
        img: QRISIC
    },
    {
        title: 'Kartu Multi Trip',
        type: 'KMT',
        desc: 'Scan KMT untuk bayar',
        img: KMTIC
    }
]

export const STATION_LIST = [
    "Ancol", "Angke", "Bekasi Timur", "Bojong Gede", "Bojong Indah", "Bogor", "Cakung", "Cawang", "Cikarang", "Cikini", "Cikoya", "Cilebut", "Cisauk", "Citayam", "Citeras", "Maja", "Manggarai", "Matraman", "Nambo", "Palmerah", "Parung Panjang", "Pasar Minggu", "Pasar Minggu Baru", "Pasar Senen", "Pesing", "Pondok Cina", "Pondok Jati", "Pondok Ranji", "Poris", "Rajawali", "Telagamurni"
]
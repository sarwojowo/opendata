import { LazyLoadImage } from 'react-lazy-load-image-component';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ScreenSaver from '@/assets/img/screensaver/screensaver.svg'
import Banner1 from '@/assets/img/screensaver/screensaver1.webp'
import Banner2 from '@/assets/img/screensaver/screensaver2.webp'
import Banner3 from '@/assets/img/screensaver/women-waiting-train.webp'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ScreenSaverPage() {
    const [index, setIndex] = useState(0)
    const navigate = useNavigate()

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: true,
        arrows: false,
        autoplaySpeed: 5000,
        beforeChange: (_: number, newIndex: number) => {
            setIndex(newIndex)
            if (newIndex === 0) return navigate('/select-station')
        }
    };

    // const test = "https://appsupport-kiosk-locker.vercel.app/api/proxy-image?url=http%3A%2F%2F36.66.3.44%3A9000%2Fories%2F1760281991938-panadol.svg%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3Dadmin%252F20251012%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20251012T151312Z%26X-Amz-Expires%3D604800%26X-Amz-SignedHeaders%3Dhost%26X-Amz-Signature%3D0a9cd23b609202d01704c4f0c9c7ad93299128c74d79c58dece4798dbddde5d3"
    return (
        <>
            <style>{`
                .slick-slider, .slick-list, .slick-track {
                    height: 100% !important;
                }
                .slick-slide {
                    height: 100% !important;
                    display: flex !important;
                }
            `}</style>
            <div className="w-full h-screen flex flex-col overflow-hidden" onClick={() => navigate('/select-station')}>
                <div className='w-full h-[40vh] relative'>
                    <LazyLoadImage src={ScreenSaver} alt='screensaver' className='w-full h-full object-cover' />
                    <div className='absolute top-24 lg:top-40 left-6 lg:left-16 z-10 text-white w-full space-y-4 lg:space-y-8'>
                        <div>#OnTheGoShopping</div>
                        <div className='w-9/12 lg:w-10/12 text-3xl lg:text-8xl font-bold leading-snug lg:leading-tight'>
                            {index === 0 ? 'Belanja murah, tanpa antri, tanpa ribet.' : index === 1 ? 'Lewati antrian, langsung ambil belanjaan kamu!' : 'Pesan sambil jalan, pas sampai tinggal ambil pesanan!'}
                        </div>
                    </div>
                </div>
                <div className='bg-white relative h-3 lg:h-8 w-full'>
                    <div className={`bg-teal-800 h-3 lg:h-8 transition-all duration-300 ${index === 0 ? 'w-1/4' : index === 1 ? 'w-2/4' : 'w-3/4'}`}></div>
                </div>
                <div className="flex-1 flex">
                    <Slider {...settings} className='h-full w-full flex-1 flex-center'>
                        <div className='h-full w-full flex items-center justify-center relative'>
                            <div className='absolute w-full h-full inset-0 bg-black/20'></div>
                            <LazyLoadImage src={Banner1} alt={`slide-1`} className='w-full h-full object-cover' />
                        </div>
                        <div className='h-full w-full flex items-center justify-center relative'>
                            <div className='absolute w-full h-full inset-0 bg-black/20'></div>
                            <LazyLoadImage src={Banner3} alt={`slide-2`} className='w-full h-full object-cover' />
                        </div>
                        <div className='h-full w-full flex items-center justify-center relative'>
                            <div className='absolute w-full h-full inset-0 bg-black/10'></div>
                            <LazyLoadImage src={Banner2} alt={`slide-3`} className='w-full h-full object-cover' />
                        </div>
                    </Slider>
                </div>
            </div>
        </>
    );
}
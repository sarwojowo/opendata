import { type FC } from 'react';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Banner1 from '@/assets/img/banner/home-banner1.svg'
import Banner2 from '@/assets/img/banner/home-banner2.svg'
import Banner3 from '@/assets/img/banner/home-banner3.svg'

type Props = {};

const BannerSlider: FC<Props> = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: true,
        arrows: false,
        autoplaySpeed: 5000,
        dotsClass: "home_slide"
    };

    return (
        <>
            <Slider {...settings}>
                <div className='w-full h-full relative' >
                    <LazyLoadImage src={Banner1} alt={`slide-1`} className='w-full h-full' />
                </div>
                <div className='w-full h-full relative'>
                    <LazyLoadImage src={Banner2} alt={`slide-2`} className='w-full h-full' />
                </div>
                <div className='w-full h-full relative'>
                    <LazyLoadImage src={Banner3} alt={`slide-3`} className='w-full h-full' />
                </div>
            </Slider>
        </>
    );
}

export default BannerSlider;
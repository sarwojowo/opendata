'use client';

import { useState, useEffect } from 'react';
import styles from './carousel.module.css';

const images = [
    '/test.png',
    '/next.svg',
    '/test.png',
    '/window.svg',
];

export default function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    // Optional: Auto-play carousel
    useEffect(() => {
        const interval = setInterval(() => {
            goToNext();
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(interval);
    }, [currentIndex]); // Re-run effect when currentIndex changes

    return (
        <div className={styles.carouselContainer}>
            <div className={styles.carouselWrapper} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((image, index) => (
                    <div key={index} className={styles.carouselSlide}>
                        <img src={image} alt={`Slide ${index}`} className={styles.carouselImage} />
                    </div>
                ))}
            </div>
            <button onClick={goToPrevious} className={`${styles.carouselButton} ${styles.left}`}>&#10094;</button>
            <button onClick={goToNext} className={`${styles.carouselButton} ${styles.right}`}>&#10095;</button>
            <div className={styles.carouselDots}>
                {images.map((_, index) => (
                    <span
                        key={index}
                        className={`${styles.dot} ${currentIndex === index ? styles.activeDot : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
}

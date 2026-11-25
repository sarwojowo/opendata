import styles from './Skeleton.module.css';
import { CSSProperties } from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'circle' | 'text' | 'input' | 'button' | 'banner' | 'rect';
    style?: CSSProperties;
    className?: string;
}

export default function Skeleton({ width, height, variant = 'rect', style, className }: SkeletonProps) {
    const variantClass = variant !== 'rect' ? styles[variant] : '';
    return (
        <div
            className={`${styles.skeleton} ${variantClass} ${className ?? ''}`}
            style={{ width, height, ...style }}
        />
    );
}

import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function toTitleCase(str: string) {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function debounce<T extends (...args: any[]) => void>(callback: T, delay: number = 300) {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}

export function ellipsis(str: string, maxLength: number = 50, suffix: string = '...'): string {
    if (!str) return '';
    return str.length > maxLength ? str.slice(0, maxLength) + suffix : str;
}

export function formatHumanDate(date: string | Date, dateFormat = 'dd LLL yyyy, HH:mm') {
    return format(date instanceof Date ? date : new Date(date), dateFormat, { locale: id });
}

export function getRowNumber(index: number, currentPage: number, perPage: number): number {
    return (currentPage - 1) * perPage + index + 1;
}

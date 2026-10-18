import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getImageUrl(image: string | null | undefined): string | null {
    if (!image) return null;

    const value = String(image).trim();
    if (!value) return null;

    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:') || value.startsWith('data:')) {
        return value;
    }

    if (value.startsWith('/storage/')) {
        return value;
    }

    if (value.startsWith('storage/')) {
        return `/${value}`;
    }

    if (value.startsWith('/')) {
        return value;
    }

    return `/storage/${value}`;
}

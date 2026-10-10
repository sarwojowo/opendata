import { toCanvas } from "@bwip-js/browser";

export const generateQrCode = (data: string): string => {
    try {
        const canvas = document.createElement('canvas');

        toCanvas(canvas, {
            bcid: 'qrcode', // <-- QR Code barcode ID
            text: data,
            scale: 5,       // Adjust scale for clarity
            includetext: false,
            textxalign: 'center',
            // additional options like version or error correction
            // version: 5,
            // eclevel: 'M',
        });

        return canvas.toDataURL('image/png');
    } catch (err) {
        console.error('Error generating QR code:', err);
        return '';
    }
};
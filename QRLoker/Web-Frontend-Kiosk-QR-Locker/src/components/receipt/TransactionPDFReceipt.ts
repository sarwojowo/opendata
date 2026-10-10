// utils/generateReceiptPDF.ts
import { formatRupiah } from "@/lib/helper";
import type { IStation } from "@/stores/useStationStore";
import type { ITransaction } from "@/stores/useTransactionStore";
import jsPDF from "jspdf";
import { generateQrCode } from "./generateQRCode";

interface ReceiptData {
    station: IStation | undefined
    transaction: ITransaction | undefined
    items: IProduct[]
    total_price: number
    serviceFee: number
}

export const generateReceiptPDF = async ({ station, transaction, items, total_price, serviceFee }: ReceiptData) => {

    const doc = new jsPDF("p", "mm", "a4");
    const margin = 20;
    let y = margin;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(transaction?.pickupCode || '', 105, y, { align: "center" });

    // Line
    y += 2;
    doc.line(margin, y, 190, y);

    // Station name
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Stasiun ${station?.name}`, 105, y, { align: "center" });

    // Address
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("H7 Jl. Manggarai Utara, RW.1, Manggarai, Kec. Tebet,\nKota Jakarta Selatan, DKI Jakarta 12850", 105, y, { align: "center" });

    // QR Code
    // const qrDataUrl = await QRCode.toDataURL("KLO-00029");
    const qrDataUrl = await generateQrCode(transaction?.pickupCode ?? '1234567890')
    y += 18;
    const qrSize = 50;
    doc.addImage(qrDataUrl, "PNG", 80, y, qrSize, qrSize);
    y += qrSize + 8;

    // Locker code
    doc.setFontSize(10);
    doc.text("Kode Loker", 105, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`[${transaction?.locker.code}] ${transaction?.locker.name}`, 105, y, { align: "center" });

    // Table header
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Item", margin, y);
    doc.text("Harga", 100, y);
    doc.text("Quantity", 130, y);
    doc.text("Subtotal", 160, y);

    // Line
    y += 2;
    doc.line(margin, y, 190, y);

    // Item rows
    items && items.length > 0 && items?.forEach(item => {
        y += 6;
        doc.text(item.title, margin, y);
        doc.text(formatRupiah(item.disc_price), 100, y);
        doc.text(String(item?.quantity), 130, y);
        doc.text(formatRupiah(item.quantity! * item.disc_price), 160, y);
    })

    y += 6;
    doc.text("Biaya layanan", margin, y);
    doc.text(formatRupiah(serviceFee), 160, y);

    // Total line
    y += 6;
    doc.line(margin, y, 190, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Total", margin, y);
    doc.text(formatRupiah(total_price), 160, y);

    // Footer note
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const note =
        "Scan QR Code ini pada loker di stasiun tujuan kamu.\n" +
        "Simpan dan jaga struk ini dengan baik, jika terjadi kerusakan atau kehilangan\n" +
        "pada struk ini bukan tanggung jawab kami.";
    doc.text(note, 105, y, { align: "center" });

    // Line
    y += 14;
    doc.line(margin, y, 190, y);

    y += 6;
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text("PT XXX Indonesia. Jl. Abcd No. 123, Kel. Digital, Kec. Inovasi,\nKota Futuristik, 12345 Indonesia", 105, y, { align: "center" });

    doc.save(`${transaction?.pickupCode}-${transaction?.locker?.code}.pdf`);
};

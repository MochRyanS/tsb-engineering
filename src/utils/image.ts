import { readFileAsDataURL } from "./format";

/**
 * Firestore membatasi 1 dokumen ±1MB. Foto kamera bisa jauh lebih besar,
 * jadi setiap foto otomatis dikecilkan (maks sisi terpanjang 900px, JPEG 65%)
 * sebelum disimpan — hasilnya ±100–250KB per foto, aman untuk database.
 */
export async function compressImage(file: File, maxSize = 900, quality = 0.65): Promise<string> {
    const dataUrl = await readFileAsDataURL(file);
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext("2d");
            if (!ctx) { resolve(dataUrl); return; }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}
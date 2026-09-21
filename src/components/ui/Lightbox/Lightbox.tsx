import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import styles from "./Lightbox.module.css";

interface LightboxProps {
    photos: string[];
    index: number;
    caption?: string;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export default function Lightbox({ photos, index, caption, onClose, onNavigate }: LightboxProps) {
    const [zoom, setZoom] = useState(false);
    const hasMany = photos.length > 1;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight" && hasMany) onNavigate((index + 1) % photos.length);
            if (e.key === "ArrowLeft" && hasMany) onNavigate((index - 1 + photos.length) % photos.length);
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [index, photos.length, hasMany, onClose, onNavigate]);

    return (
        <motion.div
            className={zoom ? [styles.backdrop, styles.backdropScroll].join(" ") : styles.backdrop}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} onClick={onClose}
            role="dialog" aria-modal="true" aria-label="Pratinjau foto"
        >
            <div className={styles.topbar}>
                <span className={styles.caption}>
                    {caption}{hasMany && ` — ${index + 1}/${photos.length}`}
                </span>
                <div className={styles.controls}>
                    <button className={styles.ctrl} onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
                        aria-label={zoom ? "Perkecil" : "Perbesar"}>
                        {zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
                    </button>
                    <button className={styles.ctrl} onClick={onClose} aria-label="Tutup"><X size={18} /></button>
                </div>
            </div>

            {hasMany && (
                <>
                    <button className={[styles.nav, styles.prev].join(" ")}
                        onClick={(e) => { e.stopPropagation(); onNavigate((index - 1 + photos.length) % photos.length); }}
                        aria-label="Foto sebelumnya"><ChevronLeft size={26} /></button>
                    <button className={[styles.nav, styles.next].join(" ")}
                        onClick={(e) => { e.stopPropagation(); onNavigate((index + 1) % photos.length); }}
                        aria-label="Foto berikutnya"><ChevronRight size={26} /></button>
                </>
            )}

            <motion.img
                key={index}
                className={zoom ? styles.imgZoom : styles.img}
                src={photos[index]}
                alt={`${caption ?? "Foto"} — ${index + 1}`}
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
                onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
            />

            {hasMany && (
                <div className={styles.thumbs}>
                    {photos.map((src, i) => (
                        <button key={i} className={[styles.thumb, i === index ? styles.thumbOn : ""].join(" ")}
                            onClick={(e) => { e.stopPropagation(); onNavigate(i); }} aria-label={`Lihat foto ${i + 1}`}>
                            <img src={src} alt="" />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
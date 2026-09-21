import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

interface ModalProps {
    open: boolean; onClose: () => void; title?: string; width?: "sm" | "md" | "lg"; children: ReactNode;
}
export default function Modal({ open, onClose, title, width = "sm", children }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }} onClick={onClose}
                >
                    <motion.div
                        className={[styles.modal, styles[width]].join(" ")} role="dialog" aria-modal="true" aria-label={title}
                        initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title && (
                            <header className={styles.header}>
                                <h3>{title}</h3>
                                <button className={styles.close} onClick={onClose} aria-label="Tutup dialog"><X size={18} /></button>
                            </header>
                        )}
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
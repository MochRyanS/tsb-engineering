import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import styles from "./FloatingAction.module.css";

export default function FloatingAction() {
    const { pathname } = useLocation();
    if (pathname === "/work-order") return null; // hindari duplikasi CTA di halaman form
    return (
        <motion.a
            href="#/work-order" className={styles.fab} aria-label="Buat work order baru"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
        >
            <Plus size={18} strokeWidth={2.5} />
            <span>CREATE WORK ORDER</span>
        </motion.a>
    );
}
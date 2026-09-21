/** @jsxRuntime classic */
import React, { useRef } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import styles from "./StatCard.module.css";

interface StatCardProps {
    value: number | string; label: string; icon: LucideIcon; suffix?: string; note?: string; dark?: boolean; index: number;
}
export default function StatCard({ value, label, icon: Icon, suffix, note, dark, index }: StatCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const numeric = typeof value === "number";
    const counted = useCountUp(numeric ? value : 0, ref);
    return (
        <motion.div
            ref={ref} className={[styles.card, dark ? styles.dark : ""].join(" ")}
            initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: index * 0.1 }}
        >
            <div className={styles.top}>
                <span className={styles.label}>{label}</span>
                <Icon size={18} className={styles.icon} />
            </div>
            <div className={styles.value}>
                {numeric ? counted : value}{suffix && <span className={styles.suffix}>{suffix}</span>}
            </div>
            {note && <p className={styles.note}>{note}</p>}
        </motion.div>
    );
}
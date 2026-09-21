import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Cog, Building2, Droplets } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Division } from "../../../types";
import { useWorkOrders } from "../../../hooks/useWorkOrders";
import { DIVISIONS } from "../../../utils/constants";
import styles from "./Divisions.module.css";

export default function DashboardDivisions() {
    const { workOrders } = useWorkOrders();

    const data = useMemo(
        () =>
            DIVISIONS.map((d: Division) => {
                const wos = workOrders.filter((w) => w.division === d);
                const done = wos.filter((w) => w.status === "Completed").length;
                return {
                    d,
                    total: wos.length,
                    active: wos.filter((w) => !["Completed", "Cancelled"].includes(w.status)).length,
                    rate: wos.length ? Math.round((done / wos.length) * 100) : 0,
                };
            }),
        [workOrders]
    );

    const ICONS: Record<Division, LucideIcon> = {
        Electrical: Zap, Mechanical: Cog, Civil: Building2, Plumbing: Droplets,
    };

    return (
        <div className={styles.grid}>
            {data.map((s, i) => {
                const Icon = ICONS[s.d];
                return (
                    <motion.section key={s.d} className={styles.card}
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
                        <header className={styles.head}>
                            <span className={styles.iconChip}><Icon size={18} /></span>
                            <h3>{s.d}</h3>
                        </header>
                        <dl className={styles.stats}>
                            <div><dt>Total WO</dt><dd>{s.total}</dd></div>
                            <div><dt>Aktif</dt><dd>{s.active}</dd></div>
                            <div><dt>Selesai</dt><dd>{s.rate}%</dd></div>
                        </dl>
                        <span className={styles.bar}><i style={{ width: `${s.rate}%` }} /></span>
                    </motion.section>
                );
            })}
        </div>
    );
}
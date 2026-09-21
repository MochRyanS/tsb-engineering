import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useTechnicians } from "../../../hooks/useTechnicians";
import { DIVISIONS } from "../../../utils/constants";
import Empty from "../../../components/ui/Empty/Empty";
import styles from "./Technicians.module.css";

export default function Technicians() {
    const { technicians, loading } = useTechnicians();
    const [division, setDivision] = useState("");
    const filtered = useMemo(
        () => (division ? technicians.filter((t) => t.division === division) : technicians),
        [technicians, division]
    );

    if (loading) {
        return <div className={styles.grid}>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />)}</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.chips} role="group" aria-label="Filter divisi">
                <button className={[styles.chip, !division ? styles.chipOn : ""].join(" ")} onClick={() => setDivision("")}>Semua</button>
                {DIVISIONS.map((d) => (
                    <button key={d} className={[styles.chip, division === d ? styles.chipOn : ""].join(" ")} onClick={() => setDivision(d)}>{d}</button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className={styles.emptyWrap}>
                    <Empty icon={Users} title="Belum ada teknisi" desc="Belum ada data teknisi pada divisi ini." />
                </div>
            ) : (
                <div className={styles.grid}>
                    {filtered.map((t, i) => (
                        <motion.article key={t.id} className={styles.card}
                            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
                            <header className={styles.cardHead}>
                                <span className={styles.avatar}>{t.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}</span>
                                <div>
                                    <h3>{t.name}</h3>
                                    <span className={styles.role}>{t.role} · {t.division}</span>
                                </div>
                                <span className={[styles.status, styles[`s${t.status.replace(" ", "")}`]].join(" ")}>{t.status}</span>
                            </header>
                            <div className={styles.stats}>
                                <div><strong>{t.activeTasks}</strong><span>Active Tasks</span></div>
                                <div><strong>{t.completedTasks}</strong><span>Completed</span></div>
                                <div className={styles.perf}>
                                    <span className={styles.perfHead}><strong>{t.performance}%</strong><span>Performance</span></span>
                                    <span className={styles.bar}><motion.i initial={{ width: 0 }} animate={{ width: `${t.performance}%` }} transition={{ duration: 0.8, delay: 0.2 }} style={{ background: t.performance >= 85 ? "var(--color-success)" : "var(--color-warning)" }} /></span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}
        </div>
    );
}
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Sparkles, HardHat, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWorkOrders } from "../../../hooks/useWorkOrders";
import WorkOrderTable from "../../../components/dashboard/WorkOrderTable/WorkOrderTable";
import MonthlyChart, { type MonthlyPoint } from "../../../components/charts/MonthlyChart";
import DivisionChart, { type DivisionPoint } from "../../../components/charts/DivisionChart";
import StatusChart from "../../../components/charts/StatusChart";
import PriorityChart, { type PriorityPoint } from "../../../components/charts/PriorityChart";
import { DIVISIONS, PRIORITIES, STATUSES } from "../../../utils/constants";
import styles from "./DashboardHome.module.css";
import { s } from "framer-motion/client";

interface StatDef { key: string; label: string; icon: LucideIcon; tone: "dark" | "info" | "warn" | "ok" | "danger"; }

const STATS: StatDef[] = [
    { key: "total", label: "Total Work Orders", icon: ClipboardList, tone: "dark" },
    { key: "new", label: "New Requests", icon: Sparkles, tone: "info" },
    { key: "progress", label: "In Progress", icon: HardHat, tone: "warn" },
    { key: "completed", label: "Completed", icon: CheckCircle2, tone: "ok" },
    { key: "urgent", label: "Urgent", icon: AlertTriangle, tone: "danger" },
];

export default function DashboardHome() {
    const { workOrders, loading } = useWorkOrders();

    const counts = useMemo(() => ({
        total: workOrders.length,
        new: workOrders.filter((w) => w.status === "New").length,
        progress: workOrders.filter((w) => w.status === "In Progress").length,
        completed: workOrders.filter((w) => w.status === "Completed").length,
        urgent: workOrders.filter((w) => (w.priority as string) === "Urgent" && w.status !== "Completed" && w.status !== "Cancelled").length,
    }), [workOrders]);
    s
    const trend = useMemo(() => {
        const now = new Date();
        const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const thisM = key(now);
        const lastM = key(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        const t = workOrders.filter((w) => w.createdAt.slice(0, 7) === thisM).length;
        const l = workOrders.filter((w) => w.createdAt.slice(0, 7) === lastM).length;
        if (l === 0) return t > 0 ? "+100%" : "—";
        const pct = ((t - l) / l) * 100;
        return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
    }, [workOrders]);

    const monthly: MonthlyPoint[] = useMemo(() => {
        const now = new Date();
        const months: MonthlyPoint[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ month: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }), total: 0, completed: 0 });
        }
        const idx = new Map(months.map((m, i) => [m.month, i]));
        for (const wo of workOrders) {
            const m = new Date(wo.createdAt).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
            const i = idx.get(m);
            if (i !== undefined) { months[i].total++; if (wo.status === "Completed") months[i].completed++; }
        }
        return months;
    }, [workOrders]);

    const byDivision: DivisionPoint[] = useMemo(
        () => DIVISIONS.map((d) => ({ division: d, total: workOrders.filter((w) => w.division === d).length })),
        [workOrders]
    );
    const byPriority: PriorityPoint[] = useMemo(
        () => PRIORITIES.map((p) => ({ priority: p, total: workOrders.filter((w) => w.priority === p).length })),
        [workOrders]
    );

    const recent = useMemo(() => workOrders.slice(0, 5), [workOrders]);

    if (loading) {
        return (
            <div className={styles.skeletonPage}>
                <div className={styles.skStats}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 110 }} />)}</div>
                <div className="skeleton" style={{ height: 300 }} />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.statsRow}>
                {STATS.map((s, i) => (
                    <motion.div key={s.key} className={[styles.statCard, styles[s.tone]].join(" ")}
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }}>
                        <div className={styles.statTop}>
                            <span className={styles.statLabel}>{s.label}</span>
                            <s.icon size={18} className={styles.statIcon} /></div>
                        <div className={styles.statValue}>{counts[s.key as keyof typeof counts]}</div>div&gt;
                        <div className={styles.statValue}>{counts[s.key as keyof typeof counts]}</div>
                        {s.key === "total" && <span className={styles.statTrend}>{trend} vs bulan lalu</span>}
                        {s.key !== "total" && <span className={styles.statTrend}>dari {counts.total} total WO</span>}
                    </motion.div>
                ))}
            </div>

            <div className={styles.chartsGrid}>
                <motion.section className={[styles.panel, styles.span8].join(" ")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <header className={styles.panelHead}>
                        <h3>TREN WORK ORDER — 12 BULAN</h3>
                    </header>
                    <MonthlyChart data={monthly} />
                </motion.section>
                <motion.section className={[styles.panel, styles.span4].join(" ")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                    <header className={styles.panelHead}><h3>STATUS</h3></header>
                    <StatusChart data={useMemo(
                        () => STATUSES.map((s) => ({ name: s, value: workOrders.filter((w) => w.status === s).length })).filter((p) => p.value > 0),
                        [workOrders]
                    )} />
                </motion.section>
                <motion.section className={[styles.panel, styles.span6].join(" ")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
                    <header className={styles.panelHead}><h3>PER DIVISI</h3></header>
                    <DivisionChart data={byDivision} />
                </motion.section>
                <motion.section className={[styles.panel, styles.span6].join(" ")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <header className={styles.panelHead}><h3>DISTRIBUSI PRIORITAS</h3></header>
                    <PriorityChart data={byPriority} />
                </motion.section>
            </div>

            <motion.section className={styles.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}>
                <header className={styles.panelHead}>
                    <h3>WORK ORDER TERBARU</h3>
                    <Link to="/dashboard/work-orders" className={styles.seeAll}>Lihat semua<ArrowRight size={14} /></Link>
                </header>
                <WorkOrderTable orders={recent} compact />
            </motion.section>
        </div>
    );
}
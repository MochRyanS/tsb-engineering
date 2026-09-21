import { useMemo, useState } from "react";
import { FileSpreadsheet, Printer, Filter, RotateCcw, BarChart3 } from "lucide-react";
import { useWorkOrders } from "../../../hooks/useWorkOrders";
import { useLocations } from "../../../hooks/useLocations";
import Button from "../../../components/ui/Button/Button";
import Empty from "../../../components/ui/Empty/Empty";
import WorkOrderTable from "../../../components/dashboard/WorkOrderTable/WorkOrderTable";
import { DIVISIONS, PRIORITIES, STATUSES } from "../../../utils/constants";
import { formatDuration, hoursBetween } from "../../../utils/format";
import styles from "./Reports.module.css";

interface Filters { from: string; to: string; division: string; status: string; priority: string; location: string; }
const EMPTY: Filters = { from: "", to: "", division: "", status: "", priority: "", location: "" };

export default function Reports() {
    const { workOrders } = useWorkOrders();
    const { locations } = useLocations();
    const [form, setForm] = useState<Filters>(EMPTY);
    const [applied, setApplied] = useState<Filters>(EMPTY);

    const set = (k: keyof Filters, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const filtered = useMemo(() => {
        return workOrders.filter((w) => {
            if (applied.from && w.createdAt < new Date(applied.from).toISOString()) return false;
            if (applied.to && w.createdAt > new Date(applied.to + "T23:59:59").toISOString()) return false;
            if (applied.division && w.division !== applied.division) return false;
            if (applied.status && w.status !== applied.status) return false;
            if (applied.priority && w.priority !== applied.priority) return false;
            if (applied.location && w.location !== applied.location) return false;
            return true;
        });
    }, [workOrders, applied]);

    const summary = useMemo(() => {
        const total = filtered.length;
        const completed = filtered.filter((w) => w.status === "Completed");
        const pending = total - completed.length - filtered.filter((w) => w.status === "Cancelled").length;
        const responseTimes = filtered.filter((w) => w.startedAt).map((w) => hoursBetween(w.createdAt, w.startedAt!));
        const avgResponse = responseTimes.length ? responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length : 0;
        const completionTimes = completed.filter((w) => w.completedAt).map((w) => hoursBetween(w.createdAt, w.completedAt!));
        const avgCompletion = completionTimes.length ? completionTimes.reduce((s, v) => s + v, 0) / completionTimes.length : 0;
        return { total, completed: completed.length, pending, avgResponse, avgCompletion };
    }, [filtered]);

    const exportCsv = () => {
        const header = ["WO Number", "Tanggal", "Requester", "Departemen", "Lokasi", "Divisi", "Kategori", "Prioritas", "PIC", "Status"];
        const rows = filtered.map((w) => [w.woNumber, w.createdAt.slice(0, 10), w.requesterName, w.department, w.location, w.division, w.category, w.priority, w.pic ?? "", w.status]);
        const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `laporan-work-order-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.page}>
            <section className={[styles.filterCard, "no-print"].join(" ")}>
                <h3 className={styles.filterTitle}><Filter size={14} />FILTER LAPORAN</h3>
                <div className={styles.filterGrid}>
                    <label className={styles.fField}><span>Date From</span><input type="date" value={form.from} onChange={(e) => set("from", e.target.value)} /></label>
                    <label className={styles.fField}><span>Date To</span><input type="date" value={form.to} onChange={(e) => set("to", e.target.value)} /></label>
                    <label className={styles.fField}><span>Division</span>
                        <select value={form.division} onChange={(e) => set("division", e.target.value)}>
                            <option value="">Semua</option>{DIVISIONS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </label>
                    <label className={styles.fField}><span>Status</span>
                        <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                            <option value="">Semua</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </label>
                    <label className={styles.fField}><span>Priority</span>
                        <select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                            <option value="">Semua</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                    </label>
                    <label className={styles.fField}><span>Location</span>
                        <select value={form.location} onChange={(e) => set("location", e.target.value)}>
                            <option value="">Semua</option>{locations.map((l) => <option key={l.id}>{l.name}</option>)}
                        </select>
                    </label>
                </div>
                <div className={styles.filterActions}>
                    <Button variant="dark" icon={Filter} onClick={() => setApplied(form)}>TERAPKAN</Button>
                    <Button variant="ghost" icon={RotateCcw} onClick={() => { setForm(EMPTY); setApplied(EMPTY); }}>RESET</Button>
                    <div className={styles.spacer} />
                    <Button variant="outline" icon={FileSpreadsheet} onClick={exportCsv}>EXPORT EXCEL (CSV)</Button>
                    <Button variant="outline" icon={Printer} onClick={() => window.print()}>EXPORT PDF (CETAK)</Button>
                </div>
            </section>

            <section className={["printArea", styles.summaryGrid].join(" ")}>
                <div className={styles.sumCard}><strong>{summary.total}</strong><span>Total WO</span></div>
                <div className={[styles.sumCard, styles.ok].join(" ")}><strong>{summary.completed}</strong><span>Completed</span></div>
                <div className={[styles.sumCard, styles.warn].join(" ")}><strong>{summary.pending}</strong><span>Pending</span></div>
                <div className={styles.sumCard}><strong>{formatDuration(summary.avgResponse)}</strong><span>Rata-rata Waktu Respons</span></div>
                <div className={styles.sumCard}><strong>{formatDuration(summary.avgCompletion)}</strong><span>Rata-rata Waktu Penyelesaian</span></div>
            </section>

            <section className="printArea">
                {filtered.length > 0 ? (
                    <>
                        <p className={styles.count}>{filtered.length} work order sesuai filter</p>
                        <WorkOrderTable orders={filtered} />
                    </>
                ) : (
                    <div className={styles.emptyWrap}>
                        <Empty icon={BarChart3} title="Tidak ada data" desc="Tidak ada work order pada rentang filter yang dipilih." />
                    </div>
                )}
            </section>
        </div>
    );
}
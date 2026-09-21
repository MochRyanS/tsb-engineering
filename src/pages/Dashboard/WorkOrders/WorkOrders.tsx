import { useMemo, useState } from "react";
import { Plus, Search, RotateCcw, ClipboardList, CheckCircle2 } from "lucide-react";
import { useWorkOrders } from "../../../hooks/useWorkOrders";
import WorkOrderTable from "../../../components/dashboard/WorkOrderTable/WorkOrderTable";
import Empty from "../../../components/ui/Empty/Empty";
import Button from "../../../components/ui/Button/Button";
import { DIVISIONS, PRIORITIES, STATUSES } from "../../../utils/constants";
import styles from "./WorkOrders.module.css";

export default function WorkOrders() {
  const { workOrders, loading } = useWorkOrders();
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workOrders.filter((w) => {
      if (division && w.division !== division) return false;
      if (status && w.status !== status) return false;
      if (priority && w.priority !== priority) return false;
      if (q && ![w.woNumber, w.title, w.requesterName, w.location, w.pic ?? ""].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [workOrders, search, division, status, priority]);

  const active = useMemo(
    () => filtered.filter((w) => w.status !== "Completed" && w.status !== "Cancelled"),
    [filtered]
  );
  const done = useMemo(
    () => filtered.filter((w) => w.status === "Completed" || w.status === "Cancelled"),
    [filtered]
  );

  const reset = () => { setSearch(""); setDivision(""); setStatus(""); setPriority(""); };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor WO, judul, requester, lokasi…" aria-label="Cari work order" />
        </div>
        <select value={division} onChange={(e) => setDivision(e.target.value)} aria-label="Filter divisi" className={styles.filter}>
          <option value="">Semua Divisi</option>
          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status" className={styles.filter}>
          <option value="">Semua Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter prioritas" className={styles.filter}>
          <option value="">Semua Prioritas</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset}>RESET</Button>
        <Button variant="dark" size="sm" icon={Plus} to="/work-order">BUAT WO</Button>
      </div>

      {loading ? (
        <div className={styles.skeletonList}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 52 }} />)}
        </div>
      ) : (
        <>
          <section className={styles.group}>
            <header className={styles.groupHead}>
              <h3 className={styles.groupTitle}>
                <ClipboardList size={14} />WORK ORDER AKTIF
                <span className={styles.countChip}>{active.length}</span>
              </h3>
            </header>
            {active.length > 0 ? (
              <WorkOrderTable orders={active} />
            ) : (
              <div className={styles.emptyWrap}>
                <Empty icon={ClipboardList} title="Tidak ada work order aktif"
                  desc="Tidak ada work order berjalan yang cocok dengan filter. Coba reset filter atau ubah kata kunci.">
                  <Button variant="outline" size="sm" onClick={reset}>RESET FILTER</Button>
                </Empty>
              </div>
            )}
          </section>

          <section className={styles.group}>
            <header className={styles.groupHead}>
              <h3 className={styles.groupTitle}>
                <CheckCircle2 size={14} />RIWAYAT — SELESAI &amp; DIBATALKAN
                <span className={styles.countChip}>{done.length}</span>
              </h3>
            </header>
            {done.length > 0 ? (
              <WorkOrderTable orders={done} />
            ) : (
              <div className={styles.emptyWrap}>
                <Empty icon={CheckCircle2} title="Belum ada riwayat"
                  desc="Belum ada work order yang berstatus selesai atau dibatalkan." />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
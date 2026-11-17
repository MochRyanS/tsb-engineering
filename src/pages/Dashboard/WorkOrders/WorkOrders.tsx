import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Search, AlertTriangle, Loader2 } from 'lucide-react';
import {
  subscribeWorkOrders,
  normalizeStatusKey,
  woStatusGroup,
  type TrackedWorkOrder,
} from '../../../services/workOrderService';
import WorkOrderTable from '../../../components/dashboard/WorkOrderTable/WorkOrderTable';
import styles from './WorkOrders.module.css';

const STATUS_FILTERS = [
  'New',
  'Waiting Verification',
  'Assigned',
  'Verified',
  'In Progress',
  'Waiting Material',
  'Quality Check',
  'Completed',
  'Cancelled',
];

const PRIORITY_FILTERS = ['HIGH', 'MID', 'LOW'];

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<TrackedWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  /* realtime subscription — admin melihat WO baru langsung tanpa refresh */
  useEffect(() => {
    const unsub = subscribeWorkOrders(
      (list) => {
        setWorkOrders(list);
        setLoading(false);
        setError('');
      },
      (err) => {
        setError(
          'Gagal memuat work order. Pastikan aturan keamanan Firestore mengizinkan pembacaan. (' +
            String((err as Error)?.message ?? 'unknown') +
            ')'
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const divisionOptions = useMemo(() => {
    const set = new Set<string>();
    workOrders.forEach((w) => {
      if (w.division) set.add(String(w.division));
    });
    return Array.from(set).sort();
  }, [workOrders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workOrders.filter((w) => {
      if (divisionFilter && String(w.division ?? '') !== divisionFilter) return false;
      if (statusFilter && normalizeStatusKey(w.status) !== normalizeStatusKey(statusFilter)) return false;
      if (priorityFilter && normalizeStatusKey(w.priority) !== normalizeStatusKey(priorityFilter)) {
        return false;
      }
      if (!q) return true;
      const hay = [
        w.trackingNumber,
        w.id,
        w.reporterName,
        w.reporterPhone,
        w.department,
        w.location,
        w.division,
        w.category,
        w.finding,
        w.title,
        w.description,
        w.pic,
      ]
        .map((v) => String(v ?? '').toLowerCase())
        .join(' | ');
      return hay.includes(q);
    });
  }, [workOrders, search, divisionFilter, statusFilter, priorityFilter]);

  /* REVISI 12: tabel dipisah menjadi 4 kelompok status:
     BARU (New/Submitted — baru masuk, belum ditugaskan) ·
     PENDING (Waiting Verification/Verified — menunggu verifikasi) ·
     PROGRESS (Assigned/In Progress/Waiting Material/Quality Check —
     sedang ditangani, sama dengan kartu IN PROGRESS) ·
     SELESAI (Completed/Cancelled — riwayat). */
  const groups = useMemo(() => {
    const acc: Record<'baru' | 'pending' | 'progress' | 'selesai', TrackedWorkOrder[]> = {
      baru: [],
      pending: [],
      progress: [],
      selesai: [],
    };
    for (const w of filtered) acc[woStatusGroup(w.status)].push(w);
    return acc;
  }, [filtered]);

  function resetFilters() {
    setSearch('');
    setDivisionFilter('');
    setStatusFilter('');
    setPriorityFilter('');
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>ENGINEERING / WORK ORDERS</p>
          <h1 className={styles.title}>WORK ORDERS</h1>
          <p className={styles.desc}>
            Daftar seluruh work order masuk — diperbarui secara{' '}
            <b>real-time</b>. Klik nomor tracking pada baris tabel untuk menyalin.
          </p>
        </div>
        <Link to="/work-order" className={styles.btnNew}>
          <Plus size={16} /> BUAT WO
        </Link>
      </header>

      {/* toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Cari no. tracking, pelapor, departemen, lokasi…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.select}
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
        >
          <option value="">Semua Divisi</option>
          {divisionOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">Semua Prioritas</option>
          {PRIORITY_FILTERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="button" className={styles.btnReset} onClick={resetFilters}>
          <RefreshCw size={14} /> RESET
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingBox}>
          <Loader2 size={22} className={styles.spin} />
          <span>Memuat work order…</span>
        </div>
      ) : (
        <>
          <p className={styles.count}>
            <b>{filtered.length}</b> work order ditemukan · <b>{groups.baru.length}</b> baru ·{' '}
            <b>{groups.pending.length}</b> pending · <b>{groups.progress.length}</b> progress ·{' '}
            <b>{groups.selesai.length}</b> selesai
          </p>

          <WorkOrderTable
            workOrders={groups.baru}
            title={`BARU — BARU MASUK, BELUM DITUGASKAN (${groups.baru.length})`}
            emptyLabel="Tidak ada work order baru untuk filter ini."
          />

          <div className={styles.gap} />

          <WorkOrderTable
            workOrders={groups.pending}
            title={`PENDING — MENUNGGU VERIFIKASI (${groups.pending.length})`}
            emptyLabel="Tidak ada work order pending untuk filter ini."
          />

          <div className={styles.gap} />

          <WorkOrderTable
            workOrders={groups.progress}
            title={`PROGRESS — SEDANG DIKERJAKAN (${groups.progress.length})`}
            emptyLabel="Tidak ada work order yang sedang dikerjakan untuk filter ini."
          />

          <div className={styles.gap} />

          <WorkOrderTable
            workOrders={groups.selesai}
            title={`SELESAI / DIBATALKAN — RIWAYAT (${groups.selesai.length})`}
            emptyLabel="Belum ada work order selesai atau dibatalkan."
          />
        </>
      )}
    </div>
  );
}

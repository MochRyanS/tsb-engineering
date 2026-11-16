import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { UsersRound } from 'lucide-react';
import {
  subscribeWorkOrders,
  normalizeStatusKey,
  type TrackedWorkOrder,
} from '../../../services/workOrderService';
import styles from './Technicians.module.css';

/* =====================================================================
   REVISI 4 — HALAMAN TECHNICIANS (DATA ASLI, TANPA PERFORMANCE)
   ---------------------------------------------------------------------
   Perubahan dari versi sebelumnya:
   1. Active Tasks & Completed kini dihitung dari DATA WORK ORDER ASLI
      (Firestore) — bukan angka contoh permanen. Semua teknisi otomatis
      mulai dari 0 (sesuai permintaan "restart dari 0").
   2. Kartu statistik "Performance" (persen + bar) DIHAPUS — kartu
      teknisi hanya menampilkan Active Tasks dan Completed.
   Halaman ini sengaja tidak bergantung pada file hook/constants/Empty
   apa pun (selain service workOrderService) supaya aman dipasang.
   ===================================================================== */

const DIVISIONS = ['Electrical', 'Mechanical', 'Civil', 'Plumbing'];

interface TechRow {
  id: string;
  name: string;
  division: string;
  role: string;
  status: 'Available' | 'On Duty' | 'Off Duty' | string;
}

/** Daftar teknisi tetap (master roster) — identitas & ketersediaan.
 *  Silakan sesuaikan dengan teknisi asli departemen Engineering. */
const ROSTER: TechRow[] = [
  { id: 't1', name: 'Suwanto', division: 'Electrical', role: 'SPV Engineer', status: 'On Duty' },
  { id: 't2', name: 'Aji Aryanto', division: 'Electrical', role: 'Teknisi', status: 'On Duty' },
  { id: 't3', name: 'Didi Sunardi', division: 'Electrical', role: 'Teknisi', status: 'On Duty' },
  { id: 't4', name: 'M. Ismail', division: 'Electrical', role: 'Teknisi', status: 'On Duty' },
  { id: 't5', name: 'Fikri Adam', division: 'Electrical', role: 'Teknisi', status: 'On Duty' },
  { id: 't6', name: 'Edhi Suparman', division: 'Electrical', role: 'Teknisi', status: 'On Duty' },
  { id: 't7', name: 'Jaka Gitaya', division: 'Electrical', role: 'Teknisi', status: 'On Duty' },
  { id: 't8', name: 'Hermanudin', division: 'Electrical', role: 'Teknisi', status: 'On Duty' },
  { id: 't9', name: 'Ade Wahyudin', division: 'Electrical', role: 'Teknisi', status: 'On Duty' },
  { id: 't10', name: 'Arifin', division: 'Electrical', role: 'Kepala Teknisi', status: 'On Duty' },
  { id: 't11', name: 'M. Didin', division: 'Plumbing', role: 'Teknisi', status: 'On Duty' },
  { id: 't12', name: 'Daudi Lutang', division: 'Plumbing', role: 'Teknisi', status: 'On Duty' },
  { id: 't13', name: 'Usep Saepudin', division: 'Civil', role: 'Teknisi', status: 'On Duty' },
  { id: 't14', name: 'Tim Civil', division: 'Civil', role: 'Teknisi', status: 'On Duty' },
  { id: 't15', name: 'Tatang Supriatna', division: 'Mechanical', role: 'Teknisi', status: 'On Duty' },
  { id: 't16', name: 'Deni Supriadi', division: 'Mechanical', role: 'Teknisi', status: 'On Duty' },
  { id: 't17', name: 'Ismayadhi', division: 'Mechanical', role: 'SPV Teknisi', status: 'On Duty' },
  { id: 't18', name: 'Bois Sianippar', division: 'Mechanical', role: 'Teknisi', status: 'On Duty' },
  { id: 't19', name: 'Tim Maintenance', division: 'Mechanical', role: 'Teknisi', status: 'On Duty' },
  { id: 't20', name: 'Tim Aspald', division: 'Mechanical', role: 'Teknisi', status: 'On Duty' },
  { id: 't21', name: 'Tim Las', division: 'Mechanical', role: 'Teknisi', status: 'On Duty' },
  { id: 't22', name: 'Tim Bengkel', division: 'Mechanical', role: 'Teknisi', status: 'On Duty' },
];

const CLOSED_STATUSES = [
  'completed',
  'done',
  'selesai',
  'cancelled',
  'canceled',
  'dibatalkan',
];
const DONE_STATUSES = ['completed', 'done', 'selesai'];

function matchesPic(wo: TrackedWorkOrder, techName: string): boolean {
  const pic = String(wo?.pic ?? '').trim().toLowerCase();
  return !!pic && pic === techName.trim().toLowerCase();
}

function isActiveTask(wo: TrackedWorkOrder, techName: string): boolean {
  if (!matchesPic(wo, techName)) return false;
  const key = normalizeStatusKey(wo?.status);
  if (!key) return false;
  return !CLOSED_STATUSES.includes(key);
}

function isCompletedTask(wo: TrackedWorkOrder, techName: string): boolean {
  return matchesPic(wo, techName) && DONE_STATUSES.includes(normalizeStatusKey(wo?.status));
}

function statusClass(status: string): string {
  const key = `s${String(status ?? '').replace(/\s+/g, '')}`;
  return (styles as Record<string, string>)[key] ?? '';
}

export default function Technicians() {
  const [workOrders, setWorkOrders] = useState<TrackedWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [division, setDivision] = useState('');

  useEffect(() => {
    const unsub = subscribeWorkOrders(
      (list) => {
        setWorkOrders(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const technicians = useMemo(
    () =>
      ROSTER.map((tech) => ({
        ...tech,
        activeTasks: workOrders.filter((w) => isActiveTask(w, tech.name)).length,
        completedTasks: workOrders.filter((w) => isCompletedTask(w, tech.name)).length,
      })),
    [workOrders]
  );

  const filtered = useMemo(
    () => (division ? technicians.filter((t) => t.division === division) : technicians),
    [technicians, division]
  );

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.chips} role="group" aria-label="Filter divisi">
        <button
          type="button"
          className={[styles.chip, division ? '' : styles.chipOn].join(' ')}
          onClick={() => setDivision('')}
        >
          Semua
        </button>
        {DIVISIONS.map((d) => (
          <button
            key={d}
            type="button"
            className={[styles.chip, division === d ? styles.chipOn : ''].join(' ')}
            onClick={() => setDivision(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyWrap}>
          <div className={styles.emptyInner}>
            <UsersRound size={34} />
            <strong>Belum ada teknisi</strong>
            <span>Belum ada data teknisi pada divisi ini.</span>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((t, i) => (
            <motion.article
              key={t.id}
              className={styles.card}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <header className={styles.cardHead}>
                <span className={styles.avatar}>
                  {t.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <h3>{t.name}</h3>
                  <span className={styles.role}>
                    {t.role} · {t.division}
                  </span>
                </div>
                <span className={[styles.status, statusClass(t.status)].join(' ')}>{t.status}</span>
              </header>

              <div className={styles.stats}>
                <div>
                  <strong>{t.activeTasks}</strong>
                  <span>Active Tasks</span>
                </div>
                <div>
                  <strong>{t.completedTasks}</strong>
                  <span>Completed</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  subscribeWorkOrders,
  normalizeStatusKey,
  type TrackedWorkOrder,
} from '../services/workOrderService';

/* =====================================================================
   REVISI 4 — DATA TEKNISI DARI DATA ASLI
   ---------------------------------------------------------------------
   Sebelumnya angka Active Tasks / Completed / Performance di halaman
   Technicians adalah DATA CONTOH TIDAK PERMANEN (hardcoded: 42, 38, 92%,
   dsb.) sehingga terlihat seperti riwayat lama yang tidak nyata.

   Sekarang:
   • Active Tasks  = jumlah WO asli yang ditugaskan ke teknisi tersebut
                     (field `pic`) dan statusnya belum selesai/dibatalkan.
   • Completed     = jumlah WO asli milik teknisi tersebut yang sudah
                     berstatus Completed.
   Karena data WO baru dimulai dari nol, semua teknisi otomatis mulai
   dari 0 — sesuai permintaan "restart dari 0".
   • Performance   = DIHAPUS (tidak lagi dihitung/ditampilkan).

   Catatan: daftar teknisi (nama/divisi/role/status ketersediaan) masih
   berupa daftar tetap di bawah — silakan sesuaikan dengan teknisi asli
   departemen Engineering.
   ===================================================================== */

export interface Technician {
  id: string;
  name: string;
  division: string;
  role: string;
  status: 'Available' | 'On Duty' | 'Off Duty' | string;
  activeTasks: number;
  completedTasks: number;
}

/** Daftar teknisi tetap (master roster) — status & identitas. */
const ROSTER: Array<Omit<Technician, 'activeTasks' | 'completedTasks'>> = [
  { id: 't1', name: 'Budi Santoso', division: 'Electrical', role: 'Teknisi Senior', status: 'Available' },
  { id: 't2', name: 'Joko Prasetyo', division: 'Mechanical', role: 'Teknisi Senior', status: 'On Duty' },
  { id: 't3', name: 'Asep Kurnia', division: 'Civil', role: 'Mandor', status: 'Available' },
  { id: 't4', name: 'Dedi Rustandi', division: 'Plumbing', role: 'Teknisi', status: 'Available' },
  { id: 't5', name: 'Eko Saputra', division: 'Mechanical', role: 'Teknisi', status: 'On Duty' },
  { id: 't6', name: 'Rina Marlina', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't7', name: 'Yusuf Hamdani', division: 'Civil', role: 'Teknisi', status: 'Off Duty' },
  { id: 't8', name: 'Putra Gani', division: 'Plumbing', role: 'Teknisi Junior', status: 'Available' },
  { id: 't9', name: 'Hendra Saputra', division: 'Electrical', role: 'Teknisi Junior', status: 'On Duty' },
  { id: 't10', name: 'Wawan Setiawan', division: 'Mechanical', role: 'Kepala Teknisi', status: 'Available' },
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

function isDone(status: unknown): boolean {
  return DONE_STATUSES.includes(normalizeStatusKey(status));
}

/** WO aktif = punya PIC (cocok nama teknisi), status jelas, belum
 *  selesai dan belum dibatalkan. */
function isActiveTask(wo: TrackedWorkOrder, techName: string): boolean {
  const pic = String(wo?.pic ?? '').trim().toLowerCase();
  if (!pic || pic !== techName.trim().toLowerCase()) return false;
  const key = normalizeStatusKey(wo?.status);
  if (!key) return false;
  return !CLOSED_STATUSES.includes(key);
}

function isCompletedTask(wo: TrackedWorkOrder, techName: string): boolean {
  const pic = String(wo?.pic ?? '').trim().toLowerCase();
  if (!pic || pic !== techName.trim().toLowerCase()) return false;
  return isDone(wo?.status);
}

/** Hitung statistik tiap teknisi dari daftar work order ASLI. */
export function computeTechnicianStats(workOrders: TrackedWorkOrder[]): Technician[] {
  return ROSTER.map((tech) => ({
    ...tech,
    activeTasks: workOrders.filter((w) => isActiveTask(w, tech.name)).length,
    completedTasks: workOrders.filter((w) => isCompletedTask(w, tech.name)).length,
  }));
}

export function useTechnicians(): {
  technicians: Technician[];
  loading: boolean;
} {
  const [workOrders, setWorkOrders] = useState<TrackedWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

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

  const technicians = computeTechnicianStats(workOrders);
  return { technicians, loading };
}

export default useTechnicians;

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

   REVISI 7 — ROSTER DIGANTI DENGAN PERSONIL ASLI (22 personil).
   Nama teknisi TIDAK dibaca dari src/data/mockTechnicians.ts (file itu
   sisa template dan tidak dipakai) melainkan dari ROSTER di file ini.
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

/** Daftar teknisi tetap (master roster) — REVISI 7: personil asli
 *  departemen Engineering (22 personil). */
const ROSTER: Array<Omit<Technician, 'activeTasks' | 'completedTasks'>> = [
  { id: 't1', name: 'Swanto', division: 'Electrical', role: 'SPV Engineer', status: 'Available' },
  { id: 't2', name: 'Aji Aryanto', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't3', name: 'Didi Sunardi', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't4', name: 'M. Ismail', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't5', name: 'Fikri Adam', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't6', name: 'Edhi Suparman', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't7', name: 'Jaka Gitaya', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't8', name: 'Hermanudin', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't9', name: 'Ade Wahyudin', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't10', name: 'Arifin', division: 'Electrical', role: 'Teknisi', status: 'Available' },
  { id: 't11', name: 'M. Didin', division: 'Plumbing', role: 'Teknisi', status: 'Available' },
  { id: 't12', name: 'Daudi Lutang', division: 'Plumbing', role: 'Teknisi', status: 'Available' },
  { id: 't13', name: 'Usep Saepudin', division: 'Civil', role: 'Teknisi', status: 'Available' },
  { id: 't14', name: 'Tim Civil', division: 'Civil', role: 'Teknisi', status: 'Available' },
  { id: 't15', name: 'Tatang Supriatna', division: 'Mechanical', role: 'Teknisi', status: 'Available' },
  { id: 't16', name: 'Deni Supriadi', division: 'Mechanical', role: 'Teknisi', status: 'Available' },
  { id: 't17', name: 'Ismayadhi', division: 'Mechanical', role: 'SPV Teknisi', status: 'Available' },
  { id: 't18', name: 'Bois Sianippar', division: 'Mechanical', role: 'Teknisi', status: 'Available' },
  { id: 't19', name: 'Tim Maintenance', division: 'Mechanical', role: 'Teknisi', status: 'Available' },
  { id: 't20', name: 'Tim Aspald', division: 'Mechanical', role: 'Teknisi', status: 'Available' },
  { id: 't21', name: 'Tim Las', division: 'Mechanical', role: 'Teknisi', status: 'Available' },
  { id: 't22', name: 'Tim Bengkel', division: 'Mechanical', role: 'Teknisi', status: 'Available' },
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

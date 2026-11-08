/* ============================================================
   workOrderService.ts — Engineering TSB
   Fitur No. Tracking: setiap Work Order baru otomatis mendapat
   nomor tracking (format: WO-YYMMDD-XXXX) yang dipakai sebagai
   ID dokumen, sehingga bisa dilacak secara realtime oleh client
   melalui halaman /tracking di website utama.
   ============================================================ */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  arrayUnion,
  type Firestore,
} from 'firebase/firestore';
import * as firebaseClient from './firebaseClient';
import type { WorkOrder } from '../types';

/* ---------- Tipe ---------- */

export type TrackedWorkOrder = WorkOrder & {
  trackingNumber?: string;
  finding?: string;
  timeline?: { status: string; at: unknown }[];
  [key: string]: unknown;
};

export interface NewWorkOrderInput {
  department: string;
  location: string;
  reporterName: string;
  reporterPhone: string;
  category: string;
  division: string;
  finding: string;
  reportedAt: string;
  workType: string;
  priority: string;
  photos: string[];
  [key: string]: unknown;
}

/* ---------- Konstanta ---------- */

export const WORKORDERS_COLLECTION = 'workOrders';

const TN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/* ---------- Deteksi mode (Firebase / Mock) ----------
   Membaca `db` dari firebaseClient dengan beberapa nama kandidat
   agar tetap kompatibel bila nama ekspor berbeda. */

const clientRef = firebaseClient as unknown as Record<string, unknown>;

function resolveDb(): Firestore | null {
  const candidates = [clientRef.db, clientRef.firestoreDb, clientRef.firestore, clientRef.store];
  for (const c of candidates) {
    if (c) return c as Firestore;
  }
  return null;
}

const db: Firestore | null = resolveDb();

const isFirebaseMode: boolean = (() => {
  const flag = clientRef.isFirebaseEnabled;
  if (typeof flag === 'boolean') return flag && !!db;
  return !!db;
})();

/* ---------- Nomor Tracking ---------- */

function randomSuffix(len = 4): string {
  let s = '';
  for (let i = 0; i < len; i++) s += TN_CHARS[Math.floor(Math.random() * TN_CHARS.length)];
  return s;
}

/** Format: WO-YYMMDD-XXXX (contoh: WO-261106-7K2F) */
export function generateTrackingNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `WO-${yy}${mm}${dd}-${randomSuffix()}`;
}

/** Menormalkan input user: huruf besar, tanpa spasi, selaika
    polanya cocok, tanda hubung otomatis disisipkan. */
export function formatTrackingInput(raw: string): string {
  const s = (raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = /^WO(\d{6})([A-Z0-9]{4,})$/.exec(s);
  if (m) return `WO-${m[1]}-${m[2]}`;
  return (raw || '').trim().toUpperCase();
}

/* ---------- Helper status / prioritas / tanggal ---------- */

export function normalizeStatusKey(status: unknown): string {
  return String(status ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function prettifyLabel(v: unknown): string {
  const s = String(v ?? '').trim();
  if (!s) return '—';
  return s.replace(/\s+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const STATUS_META: Record<string, { label: string; tone: string }> = {
  new: { label: 'New', tone: 'blue' },
  submitted: { label: 'Submitted', tone: 'blue' },
  'waiting for verification': { label: 'Waiting Verification', tone: 'blue' },
  verified: { label: 'Verified', tone: 'teal' },
  assigned: { label: 'Assigned', tone: 'sky' },
  'in progress': { label: 'In Progress', tone: 'amber' },
  'on progress': { label: 'In Progress', tone: 'amber' },
  'waiting material': { label: 'Waiting Material', tone: 'orange' },
  'quality check': { label: 'Quality Check', tone: 'violet' },
  completed: { label: 'Completed', tone: 'green' },
  done: { label: 'Completed', tone: 'green' },
  selesai: { label: 'Completed', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
  canceled: { label: 'Cancelled', tone: 'red' },
  dibatalkan: { label: 'Cancelled', tone: 'red' },
};

export function statusMetaOf(status: unknown): { label: string; tone: string } {
  const key = normalizeStatusKey(status);
  return STATUS_META[key] ?? { label: prettifyLabel(status), tone: 'gray' };
}

/** true = masuk tabel RIWAYAT (selesai / dibatalkan) */
export function isHistoryStatus(status: unknown): boolean {
  const key = normalizeStatusKey(status);
  return ['completed', 'done', 'selesai', 'cancelled', 'canceled', 'dibatalkan'].includes(key);
}

/** Step untuk stepper halaman tracking: 1 Dilaporkan, 2 Diproses, 3 Selesai, -1 Dibatalkan */
export function statusStep(status: unknown): number {
  const key = normalizeStatusKey(status);
  if (['cancelled', 'canceled', 'dibatalkan'].includes(key)) return -1;
  if (['completed', 'done', 'selesai'].includes(key)) return 3;
  if (['assigned', 'in progress', 'on progress', 'waiting material', 'quality check'].includes(key)) return 2;
  return 1;
}

export const PRIORITY_META: Record<string, { label: string; tone: string }> = {
  high: { label: 'HIGH', tone: 'red' },
  urgent: { label: 'HIGH', tone: 'red' },
  mid: { label: 'MID', tone: 'amber' },
  medium: { label: 'MID', tone: 'amber' },
  normal: { label: 'MID', tone: 'amber' },
  low: { label: 'LOW', tone: 'green' },
};

export function priorityMetaOf(priority: unknown): { label: string; tone: string } {
  const key = normalizeStatusKey(priority);
  return PRIORITY_META[key] ?? { label: prettifyLabel(priority), tone: 'gray' };
}

export function toDateValue(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'object') {
    const anyV = v as Record<string, unknown>;
    if (typeof anyV.toDate === 'function') {
      try {
        return (anyV.toDate as () => Date)();
      } catch {
        return null;
      }
    }
    if (typeof anyV.seconds === 'number') return new Date((anyV.seconds as number) * 1000);
  }
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(v: unknown): string {
  const d = toDateValue(v);
  return d ? dateFmt.format(d) : '—';
}

export function formatDateTime(v: unknown): string {
  const d = toDateValue(v);
  return d ? dateTimeFmt.format(d).replace(',', ' ·') : '—';
}

function byCreatedDesc(a: Record<string, unknown>, b: Record<string, unknown>): number {
  const ta = toDateValue(a?.createdAt)?.getTime() ?? 0;
  const tb = toDateValue(b?.createdAt)?.getTime() ?? 0;
  return tb - ta;
}

/* ---------- Normalisasi dokumen (REVISI 3) ----------
   Dashboard lama memanggil `createdAt.slice(...)` — menganggapnya STRING.
   Service baru menyimpan Timestamp Firestore (objek) → TypeError → blank page.
   Solusi: SEMUA field tanggal dinormalkan menjadi string ISO sebelum keluar
   dari service, sehingga kompatibel untuk `.slice()`, `new Date()`, dan
   helper `toDateValue()`/`formatDate()` di file baru. */

const DATE_FIELDS = [
  'createdAt',
  'updatedAt',
  'completedAt',
  'reportedAt',
  'reportedDate',
  'dueDate',
  'lastLogin',
];

function toIsoString(v: unknown): unknown {
  if (v === null || v === undefined) return v;
  if (typeof v === 'string') return v; // sudah string — biarkan
  const d = toDateValue(v); // Timestamp / {seconds} / number → Date
  return d ? d.toISOString() : v;
}

function normalizeDoc(raw: Record<string, unknown>): TrackedWorkOrder {
  const out: Record<string, unknown> = { ...raw };
  for (const f of DATE_FIELDS) {
    if (out[f] !== undefined && out[f] !== null) out[f] = toIsoString(out[f]);
  }
  if (Array.isArray(out.timeline)) {
    out.timeline = (out.timeline as Record<string, unknown>[]).map((t) =>
      t && typeof t === 'object' ? { ...t, at: toIsoString((t as Record<string, unknown>).at) } : t
    );
  }
  return out as TrackedWorkOrder;
}

/* ---------- Penyimpanan mock (localStorage) ---------- */

const LS_KEY = 'tsb_workorders_v1';
const mockListeners = new Set<() => void>();

function mockRead(): Record<string, unknown>[] {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

function mockWrite(list: Record<string, unknown>[]): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* storage penuh — abaikan */
  }
  mockEmit();
}

function mockEmit(): void {
  mockListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* noop */
    }
  });
}

/* ---------- API utama ---------- */

/** Berlangganan seluruh work order (urut terbaru) — realtime. */
export function subscribeWorkOrders(
  onData: (list: TrackedWorkOrder[]) => void,
  onError?: (error: unknown) => void
): () => void {
  if (isFirebaseMode && db) {
    return onSnapshot(
      collection(db, WORKORDERS_COLLECTION),
      (snap) => {
        const list = snap.docs
          .map((d) => normalizeDoc({ id: d.id, ...(d.data() as Record<string, unknown>) }))
          .sort(byCreatedDesc);
        onData(list);
      },
      (err) => onError?.(err)
    );
  }
  const send = () => {
    onData([...mockRead()].map(normalizeDoc).sort(byCreatedDesc));
  };
  send();
  mockListeners.add(send);
  return () => {
    mockListeners.delete(send);
  };
}

/** Ambil semua work order sekali (tanpa langganan). */
export async function getWorkOrders(): Promise<TrackedWorkOrder[]> {
  if (isFirebaseMode && db) {
    const snap = await getDocs(collection(db, WORKORDERS_COLLECTION));
    return snap.docs
      .map((d) => normalizeDoc({ id: d.id, ...(d.data() as Record<string, unknown>) }))
      .sort(byCreatedDesc);
  }
  return [...mockRead()].map(normalizeDoc).sort(byCreatedDesc);
}

/** Lacak SATU work order berdasarkan nomor tracking — realtime.
 *  onData(null) bila nomor tidak ditemukan. */
export function trackWorkOrder(
  rawNumber: string,
  onData: (wo: TrackedWorkOrder | null) => void,
  onError?: (error: unknown) => void
): () => void {
  const number = formatTrackingInput(rawNumber).replace(/\//g, '');
  if (!number) {
    onData(null);
    return () => undefined;
  }
  if (isFirebaseMode && db) {
    return onSnapshot(
      doc(db, WORKORDERS_COLLECTION, number),
      (snap) => {
        onData(
          snap.exists()
            ? normalizeDoc({ id: snap.id, ...(snap.data() as Record<string, unknown>) })
            : null
        );
      },
      (err) => onError?.(err)
    );
  }
  const send = () => {
    const found = mockRead().find(
      (w) =>
        String(w?.trackingNumber ?? '').toUpperCase() === number ||
        String(w?.id ?? '').toUpperCase() === number
    );
    onData(found ? normalizeDoc(found) : null);
  };
  send();
  mockListeners.add(send);
  return () => {
    mockListeners.delete(send);
  };
}

/** Membuat work order baru. Mengembalikan NOMOR TRACKING-nya. */
export async function createWorkOrder(input: NewWorkOrderInput): Promise<string> {
  const nowIso = new Date().toISOString();
  const initialStatus = String(input.status ?? 'New');

  /* Field kompatibilitas untuk halaman dashboard LAMA (WorkOrderDetail,
     DashboardHome, dll. yang membaca nama field versi lama).
     Field baru tetap disimpan — dua-duanya tersimpan berdampingan. */
  const compatFields: Record<string, unknown> = {
    complainantName: input.reporterName ?? '',
    waNumber: input.reporterPhone ?? '',
    findingType: input.finding ?? input.category ?? '',
    description: (input as Record<string, unknown>).description ?? input.finding ?? '',
    reportedDate: input.reportedAt ?? nowIso,
  };

  const base: Record<string, unknown> = {
    ...input,
    ...compatFields,
    status: initialStatus,
    timeline: [{ status: initialStatus, at: nowIso }],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (isFirebaseMode && db) {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const tn = generateTrackingNumber();
      try {
        await setDoc(doc(db, WORKORDERS_COLLECTION, tn), {
          ...base,
          trackingNumber: tn,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdAtISO: nowIso,
          updatedAtISO: nowIso,
        });
        return tn;
      } catch (err: unknown) {
        const anyErr = err as { code?: string; message?: string };
        const code = String(anyErr?.code ?? '');
        const msg = String(anyErr?.message ?? '');
        if (code === 'already-exists' || /already exists/i.test(msg)) {
          lastError = err; // tabrakan nomor acak — coba nomor baru
          continue;
        }
        throw err;
      }
    }
    throw lastError ?? new Error('Gagal membuat nomor tracking. Coba lagi.');
  }

  /* mode mock */
  const list = mockRead();
  let tn = generateTrackingNumber();
  while (list.some((w) => String(w?.id ?? '') === tn)) tn = generateTrackingNumber();
  list.unshift({ ...base, id: tn, trackingNumber: tn });
  mockWrite(list);
  return tn;
}

/** Ubah status work order (+ catatan timeline). */
export async function updateWorkOrderStatus(id: string, status: string): Promise<void> {
  const at = new Date().toISOString();
  if (isFirebaseMode && db) {
    await updateDoc(doc(db, WORKORDERS_COLLECTION, id), {
      status,
      updatedAt: serverTimestamp(),
      updatedAtISO: at,
      timeline: arrayUnion({ status, at }),
    });
    return;
  }
  const list = mockRead();
  const idx = list.findIndex((w) => String(w?.id ?? '') === id);
  if (idx >= 0) {
    const w = list[idx];
    w.status = status;
    w.updatedAt = at;
    w.timeline = Array.isArray(w.timeline) ? [...(w.timeline as unknown[]), { status, at }] : [{ status, at }];
    mockWrite(list);
  }
}

/** Pembaruan umum (patch bebas). */
export async function updateWorkOrder(id: string, patch: Record<string, unknown>): Promise<void> {
  if (isFirebaseMode && db) {
    await updateDoc(doc(db, WORKORDERS_COLLECTION, id), {
      ...patch,
      updatedAt: serverTimestamp(),
      updatedAtISO: new Date().toISOString(),
    });
    return;
  }
  const list = mockRead();
  const idx = list.findIndex((w) => String(w?.id ?? '') === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    mockWrite(list);
  }
}

/** Menugaskan PIC/teknisi; bila status masih New otomatis jadi Assigned. */
export async function assignTechnician(id: string, name: string): Promise<void> {
  let currentStatus = '';
  if (isFirebaseMode && db) {
    const snap = await getDoc(doc(db, WORKORDERS_COLLECTION, id));
    if (!snap.exists()) return;
    currentStatus = String((snap.data() as Record<string, unknown>)?.status ?? '');
  } else {
    const w = mockRead().find((x) => String(x?.id ?? '') === id);
    if (!w) return;
    currentStatus = String(w?.status ?? '');
  }
  const nextStatus = normalizeStatusKey(currentStatus) === 'new' ? 'Assigned' : currentStatus;
  await updateWorkOrder(id, { pic: name, status: nextStatus });
}

/** Hapus work order. */
export async function deleteWorkOrder(id: string): Promise<void> {
  if (isFirebaseMode && db) {
    await deleteDoc(doc(db, WORKORDERS_COLLECTION, id));
    return;
  }
  mockWrite(mockRead().filter((w) => String(w?.id ?? '') !== id));
}

/* ---------- Ambil satu dokumen ---------- */

/** Ambil satu work order berdasarkan ID dokumen (= nomor tracking untuk WO baru). */
export async function getWorkOrderById(id: string): Promise<TrackedWorkOrder | null> {
  const key = formatTrackingInput(id).replace(/\//g, '');
  if (isFirebaseMode && db) {
    const snap = await getDoc(doc(db, WORKORDERS_COLLECTION, key));
    if (!snap.exists()) return null;
    return normalizeDoc({ id: snap.id, ...(snap.data() as Record<string, unknown>) });
  }
  const found = mockRead().find(
    (w) => String(w?.id ?? '') === key || String(w?.trackingNumber ?? '').toUpperCase() === key
  );
  return found ? normalizeDoc(found) : null;
}

/** Versi async (Promise) dari trackWorkOrder — untuk kode lama. */
export async function getWorkOrderByTrackingNumber(rawNumber: string): Promise<TrackedWorkOrder | null> {
  return getWorkOrderById(rawNumber);
}

/* ---------- Alias kompatibilitas (untuk kode lama) ---------- */

export const subscribeToWorkOrders = subscribeWorkOrders;
export const fetchWorkOrders = getWorkOrders;
export const assignWorkOrder = assignTechnician;

/* ---------- Lapisan kompatibilitas gaya OBJEK (REVISI 2) ----------
   Menyediakan `import { workOrderService } from './workOrderService'`
   seperti file service LAMA, supaya file yang tidak ikut di-update
   (hooks, halaman dashboard lama, dsb.) tetap jalan tanpa diubah.
   Semua fungsi di atas + alias nama metode umum tersedia di sini. */

export const workOrderService = {
  // fungsi utama (nama sama dengan export di atas)
  generateTrackingNumber,
  formatTrackingInput,
  normalizeStatusKey,
  statusMetaOf,
  priorityMetaOf,
  isHistoryStatus,
  statusStep,
  formatDate,
  formatDateTime,
  subscribeWorkOrders,
  getWorkOrders,
  getWorkOrderById,
  getWorkOrderByTrackingNumber,
  trackWorkOrder,
  createWorkOrder,
  updateWorkOrderStatus,
  updateWorkOrder,
  assignTechnician,
  deleteWorkOrder,

  // alias nama metode gaya lama / umum
  subscribeToWorkOrders: subscribeWorkOrders,
  fetchWorkOrders: getWorkOrders,
  assignWorkOrder: assignTechnician,
  subscribe: subscribeWorkOrders,
  onWorkOrders: subscribeWorkOrders,
  getAll: getWorkOrders,
  list: getWorkOrders,
  fetchAll: getWorkOrders,
  getById: getWorkOrderById,
  findOne: getWorkOrderById,
  create: createWorkOrder,
  add: createWorkOrder,
  submit: createWorkOrder,
  update: updateWorkOrder,
  patch: updateWorkOrder,
  updateStatus: updateWorkOrderStatus,
  setStatus: updateWorkOrderStatus,
  remove: deleteWorkOrder,
  delete: deleteWorkOrder,
  assign: assignTechnician,
  track: trackWorkOrder,
  getByTrackingNumber: getWorkOrderByTrackingNumber,
  findByTrackingNumber: getWorkOrderByTrackingNumber,
};

export default workOrderService;

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
  arrayUnion,
  type Firestore,
  type DocumentReference,
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

export const WORKORDERS_COLLECTION = 'workorders';
export const LEGACY_COLLECTION = 'workOrders';

const TN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/* ---------- Deteksi mode (Firebase / Mock) ---------- */

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

export function isHistoryStatus(status: unknown): boolean {
  const key = normalizeStatusKey(status);
  return ['completed', 'done', 'selesai', 'cancelled', 'canceled', 'dibatalkan'].includes(key);
}

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

/* ---------- Normalisasi dokumen ---------- */

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
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return new Date(v).toISOString();
  const d = toDateValue(v);
  return d ? d.toISOString() : '';
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

  const aliasPairs: [string, string][] = [
    ['requesterName', 'reporterName'],
    ['requesterName', 'complainantName'],
    ['contactNumber', 'reporterPhone'],
    ['contactNumber', 'waNumber'],
    ['jenisPekerjaan', 'workType'],
    ['tanggalDilaporkan', 'reportedAt'],
    ['tanggalDilaporkan', 'reportedDate'],
    ['woNumber', 'trackingNumber'],
    ['reporterName', 'requesterName'],
    ['reporterName', 'complainantName'],
    ['reporterPhone', 'contactNumber'],
    ['reporterPhone', 'waNumber'],
    ['workType', 'jenisPekerjaan'],
    ['reportedAt', 'tanggalDilaporkan'],
    ['reportedAt', 'reportedDate'],
    ['trackingNumber', 'woNumber'],
    ['finding', 'findingType'],
    ['findingType', 'finding'],
    ['description', 'finding'],
  ];
  for (const [to, from] of aliasPairs) {
    const cur = out[to];
    const isEmptyCur = cur === undefined || cur === null || cur === '';
    if (isEmptyCur && out[from] !== undefined && out[from] !== null && out[from] !== '') {
      out[to] = out[from];
    }
  }

  if (!Array.isArray(out.photos)) out.photos = [];
  if (!Array.isArray(out.notes)) out.notes = [];
  if (!Array.isArray(out.materials)) out.materials = [];
  if (!Array.isArray(out.timeline)) {
    out.timeline = out.status ? [{ status: String(out.status), at: out.createdAt ?? '' }] : [];
  }
  if (!Array.isArray(out.activity)) {
    const tl = Array.isArray(out.timeline) ? (out.timeline as Record<string, unknown>[]) : [];
    out.activity = tl.map((t, i) => ({
      id: `act-${i + 1}`,
      action: `Status: ${String(t?.status ?? '—')}`,
      note: '',
      date: toIsoString(t?.at) ?? '',
      by: 'System',
    }));
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

/* ---------- Helper koleksi ganda ---------- */

async function findDocRef(id: string): Promise<DocumentReference | null> {
  if (!(isFirebaseMode && db)) return null;
  const candidates = [doc(db, WORKORDERS_COLLECTION, id), doc(db, LEGACY_COLLECTION, id)];
  for (const ref of candidates) {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) return ref;
    } catch {
      /* lanjut */
    }
  }
  return null;
}

function mergeLists(main: TrackedWorkOrder[], legacy: TrackedWorkOrder[]): TrackedWorkOrder[] {
  const seen = new Set<string>();
  const out: TrackedWorkOrder[] = [];
  for (const w of [...main, ...legacy]) {
    const key = String(w?.id ?? w?.trackingNumber ?? '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(w);
  }
  return out.sort(byCreatedDesc);
}

function resolveFieldValue(existing: unknown, value: unknown): unknown {
  const sentinel = value as { _methodName?: string; _elements?: unknown[] } | null;
  if (sentinel && typeof sentinel === 'object' && sentinel._methodName === 'arrayUnion') {
    const arr = Array.isArray(existing) ? [...existing] : [];
    for (const el of sentinel._elements ?? []) arr.push(el);
    return arr;
  }
  return value;
}

let migrationPromise: Promise<void> | null = null;

function migrateLegacyOnce(): Promise<void> {
  if (!isFirebaseMode || !db) return Promise.resolve();
  migrationPromise ??= (async () => {
    try {
      const legacySnap = await getDocs(collection(db, LEGACY_COLLECTION));
      for (const d of legacySnap.docs) {
        try {
          const main = await getDoc(doc(db, WORKORDERS_COLLECTION, d.id));
          if (main.exists()) continue;
          const normalized = normalizeDoc({ ...(d.data() as Record<string, unknown>), id: d.id });
          const { id: _ignored, ...data } = normalized as Record<string, unknown>;
          void _ignored;
          await setDoc(doc(db, WORKORDERS_COLLECTION, d.id), data);
        } catch {
          /* lanjut */
        }
      }
    } catch {
      /* lanjut */
    }
  })();
  return migrationPromise;
}

/* ---------- API utama ---------- */

export function subscribeWorkOrders(
  onData: (list: TrackedWorkOrder[]) => void,
  onError?: (error: unknown) => void
): () => void {
  if (isFirebaseMode && db) {
    let mainList: TrackedWorkOrder[] = [];
    let legacyExtra: TrackedWorkOrder[] = [];
    const emit = () => {
      onData(mergeLists(mainList, legacyExtra));
    };
    const unsubMain = onSnapshot(
      collection(db, WORKORDERS_COLLECTION),
      (snap) => {
        mainList = snap.docs.map((d) =>
          normalizeDoc({ id: d.id, ...(d.data() as Record<string, unknown>) })
        );
        emit();
      },
      (err) => onError?.(err)
    );
    void migrateLegacyOnce()
      .then(async () => {
        try {
          const snap = await getDocs(collection(db, LEGACY_COLLECTION));
          legacyExtra = snap.docs.map((d) =>
            normalizeDoc({ id: d.id, ...(d.data() as Record<string, unknown>) })
          );
          emit();
        } catch {
          /* abaikan */
        }
      })
      .catch(() => undefined);
    return unsubMain;
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

export async function getWorkOrders(): Promise<TrackedWorkOrder[]> {
  if (isFirebaseMode && db) {
    await migrateLegacyOnce().catch(() => undefined);
    const results = await Promise.allSettled([
      getDocs(collection(db, WORKORDERS_COLLECTION)),
      getDocs(collection(db, LEGACY_COLLECTION)),
    ]);
    const main = results[0].status === 'fulfilled' ? results[0].value.docs : [];
    const legacy = results[1].status === 'fulfilled' ? results[1].value.docs : [];
    return mergeLists(
      main.map((d) => normalizeDoc({ id: d.id, ...(d.data() as Record<string, unknown>) })),
      legacy.map((d) => normalizeDoc({ id: d.id, ...(d.data() as Record<string, unknown>) }))
    );
  }
  return [...mockRead()].map(normalizeDoc).sort(byCreatedDesc);
}

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
    let unsub: (() => void) | null = null;
    let cancelled = false;
    void (async () => {
      const ref = await findDocRef(number);
      if (cancelled) return;
      if (!ref) {
        onData(null);
        return;
      }
      unsub = onSnapshot(
        ref,
        (snap) => {
          onData(
            snap.exists()
              ? normalizeDoc({ id: snap.id, ...(snap.data() as Record<string, unknown>) })
              : null
          );
        },
        (err) => onError?.(err)
      );
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
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

export async function createWorkOrder(input: NewWorkOrderInput): Promise<string> {
  const nowIso = new Date().toISOString();
  const initialStatus = String(input.status ?? 'New');

  const compatFields: Record<string, unknown> = {
    complainantName: input.reporterName ?? '',
    waNumber: input.reporterPhone ?? '',
    findingType: input.finding ?? input.category ?? '',
    description: (input as Record<string, unknown>).description ?? input.finding ?? '',
    reportedDate: input.reportedAt ?? nowIso,
    requesterName: input.reporterName ?? '',
    contactNumber: input.reporterPhone ?? '',
    jenisPekerjaan: input.workType ?? '',
    tanggalDilaporkan: input.reportedAt ?? nowIso,
    notes: [],
    materials: [],
    photo: '',
    photoAfter: '',
    activity: [{ id: 'act-1', action: `Status: ${initialStatus}`, note: '', date: nowIso, by: 'System' }],
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
          woNumber: tn,
          createdAt: nowIso,
          updatedAt: nowIso,
          createdAtISO: nowIso,
          updatedAtISO: nowIso,
          photo: '',
          photoAfter: '',
        });
        return tn;
      } catch (err: unknown) {
        const anyErr = err as { code?: string; message?: string };
        const code = String(anyErr?.code ?? '');
        const msg = String(anyErr?.message ?? '');
        if (code === 'already-exists' || /already exists/i.test(msg)) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }
    throw lastError ?? new Error('Gagal membuat nomor tracking. Coba lagi.');
  }

  const list = mockRead();
  let tn = generateTrackingNumber();
  while (list.some((w) => String(w?.id ?? '') === tn)) tn = generateTrackingNumber();
  list.unshift({ ...base, id: tn, trackingNumber: tn });
  mockWrite(list);
  return tn;
}

export async function updateWorkOrderStatus(
  id: string,
  status: string,
  byName?: string,
  note?: string
): Promise<TrackedWorkOrder | null> {
  const at = new Date().toISOString();
  if (isFirebaseMode && db) {
    const ref = await findDocRef(id);
    if (!ref) return null;
    const patch: Record<string, unknown> = {
      status,
      updatedAt: at,
      updatedAtISO: at,
      timeline: arrayUnion({ status, at }),
      activity: arrayUnion({
        id: `act-${Date.now()}`,
        action: `Status: ${status}`,
        note: note ?? '',
        date: at,
        by: byName ?? 'System',
      }),
    };
    if (['completed', 'done', 'selesai'].includes(normalizeStatusKey(status))) {
      patch.completedAt = at;
    }
    await updateDoc(ref, patch);
    return getWorkOrderById(id);
  }
  const list = mockRead();
  const idx = list.findIndex((w) => String(w?.id ?? '') === id);
  if (idx < 0) return null;
  const w = list[idx];
  w.status = status;
  w.updatedAt = at;
  w.timeline = resolveFieldValue(w.timeline, arrayUnion({ status, at })) as unknown[];
  w.activity = resolveFieldValue(w.activity, arrayUnion({
    id: `act-${Date.now()}`,
    action: `Status: ${status}`,
    note: note ?? '',
    date: at,
    by: byName ?? 'System',
  })) as unknown[];
  if (['completed', 'done', 'selesai'].includes(normalizeStatusKey(status))) w.completedAt = at;
  mockWrite(list);
  return normalizeDoc(w);
}

export async function updateWorkOrder(
  id: string,
  patch: Record<string, unknown>
): Promise<TrackedWorkOrder | null> {
  if (isFirebaseMode && db) {
    const ref = await findDocRef(id);
    if (!ref) return null;
    const at = new Date().toISOString();
    await updateDoc(ref, { ...patch, updatedAt: at, updatedAtISO: at });
    return getWorkOrderById(id);
  }
  const list = mockRead();
  const idx = list.findIndex((w) => String(w?.id ?? '') === id);
  if (idx < 0) return null;
  const merged: Record<string, unknown> = { ...list[idx], ...patch };
  for (const k of Object.keys(merged)) {
    merged[k] = resolveFieldValue((list[idx] as Record<string, unknown>)[k], merged[k]);
  }
  merged.updatedAt = new Date().toISOString();
  list[idx] = merged;
  mockWrite(list);
  return normalizeDoc(merged);
}

export async function updatePhoto(
  id: string,
  slot: string,
  dataUrl: string
): Promise<TrackedWorkOrder | null> {
  const safe = slot === 'photoAfter' ? 'photoAfter' : 'photo';
  const at = new Date().toISOString();
  return updateWorkOrder(id, {
    [safe]: dataUrl,
    activity: arrayUnion({
      id: `act-${Date.now()}`,
      action: safe === 'photoAfter' ? 'Foto setelah dikerjakan diunggah' : 'Foto temuan diperbarui',
      note: '',
      date: at,
      by: 'Dashboard',
    }),
  });
}

export async function assignTechnician(
  id: string,
  name: string,
  byName?: string
): Promise<TrackedWorkOrder | null> {
  const at = new Date().toISOString();
  const current = await getWorkOrderById(id);
  if (!current) return null;
  const nextStatus = normalizeStatusKey(current.status) === 'new' ? 'Assigned' : String(current.status ?? '');
  return updateWorkOrder(id, {
    pic: name,
    status: nextStatus,
    timeline: arrayUnion({ status: nextStatus, at }),
    activity: arrayUnion({
      id: `act-${Date.now()}`,
      action: `Ditugaskan ke ${name}`,
      note: '',
      date: at,
      by: byName ?? 'System',
    }),
  });
}

export async function deleteWorkOrder(id: string): Promise<void> {
  if (isFirebaseMode && db) {
    const ref = await findDocRef(id);
    if (ref) await deleteDoc(ref);
    return;
  }
  mockWrite(mockRead().filter((w) => String(w?.id ?? '') !== id));
}

export async function getWorkOrderById(id: string): Promise<TrackedWorkOrder | null> {
  const key = formatTrackingInput(id).replace(/\//g, '');
  if (isFirebaseMode && db) {
    const ref = await findDocRef(key);
    if (!ref) return null;
    const snap = await getDoc(ref).catch(() => null);
    if (!snap?.exists()) return null;
    return normalizeDoc({ id: snap.id, ...(snap.data() as Record<string, unknown>) });
  }
  const found = mockRead().find(
    (w) => String(w?.id ?? '') === key || String(w?.trackingNumber ?? '').toUpperCase() === key
  );
  return found ? normalizeDoc(found) : null;
}

export async function getWorkOrderByTrackingNumber(rawNumber: string): Promise<TrackedWorkOrder | null> {
  return getWorkOrderById(rawNumber);
}

/* ---------- Alias kompatibilitas ---------- */

export const subscribeToWorkOrders = subscribeWorkOrders;
export const fetchWorkOrders = getWorkOrders;
export const assignWorkOrder = assignTechnician;

/* ---------- Lapisan kompatibilitas gaya OBJEK ---------- */

export const workOrderService = {
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
  updatePhoto,
  assignTechnician,
  deleteWorkOrder,

  subscribeToWorkOrders,
  fetchWorkOrders,
  assignWorkOrder,
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
import type { CreateWorkOrderInput, WorkOrder, WorkOrderStatus } from "../types";
import { buildMockWorkOrders } from "../data/mockWorkOrders";
import { generateWoNumber } from "../utils/wo";
import { db, firebaseReady, SEED_MOCK_DATA } from "./firebaseClient";
import {
    addDoc, arrayUnion, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, writeBatch,
} from "firebase/firestore";

const STORE_KEY = "tsb_workorders_v2";
const COLLECTION = "workorders";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ========== MODE LOKAL (fallback sebelum Firebase dikonfigurasi) ========== */

function loadAll(): WorkOrder[] {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
        try { return JSON.parse(raw) as WorkOrder[]; } catch { /* lanjut */ }
    }
    if (!SEED_MOCK_DATA) return [];
    const seeded = buildMockWorkOrders();
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
}
function persist(list: WorkOrder[]): void {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

/* ========== MODE FIREBASE ========== */

type WoData = Omit<WorkOrder, "id">;

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}
function docToWorkOrder(id: string, data: Record<string, unknown>): WorkOrder {
    return { ...(data as unknown as WoData), id };
}

async function seedIfEmpty(): Promise<void> {
    if (!db) return;
    const snap = await getDocs(collection(db, COLLECTION));
    if (!snap.empty) return;
    const batch = writeBatch(db);
    for (const wo of buildMockWorkOrders()) {
        const { id, ...data } = wo;
        batch.set(doc(db, COLLECTION, id), stripUndefined(data));
    }
    await batch.commit();
}

async function fbGetAll(): Promise<WorkOrder[]> {
    if (!db) return [];
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
    return snap.docs.map((d: { id: string; data: () => Record<string, unknown>; }) => docToWorkOrder(d.id, d.data()));
}

async function fbCreate(input: CreateWorkOrderInput): Promise<WorkOrder> {
    if (!db) throw new Error("Firebase belum terkonfigurasi");
    const existing = await fbGetAll();
    const now = new Date().toISOString();
    const data: WoData = {
        woNumber: generateWoNumber(existing),
        requesterName: input.requesterName,
        department: input.department,
        contactNumber: input.contactNumber,
        location: input.location,
        title: input.title,
        category: input.category,
        division: input.division,
        jenisPekerjaan: input.jenisPekerjaan,
        description: input.description?.trim() || input.title,
        priority: input.priority,
        status: "New",
        createdAt: now,
        tanggalDilaporkan: input.tanggalDilaporkan,
        photos: input.photos,
        photo: input.photos[0],
        activity: [{
            id: `a-${Date.now()}`, date: now, action: "Work order dibuat",
            by: input.requesterName, note: "Diajukan melalui form work order",
        }],
        notes: [],
        materials: [],
    };
    const ref = await addDoc(collection(db, COLLECTION), stripUndefined(data));
    return { ...data, id: ref.id };
}

async function fbUpdateStatus(id: string, status: WorkOrderStatus, actor: string, note?: string): Promise<WorkOrder | undefined> {
    if (!db) return undefined;
    const ref = doc(db, COLLECTION, id);
    const before = await getDoc(ref);
    if (!before.exists()) return undefined;
    const current = docToWorkOrder(before.id, before.data());
    const now = new Date().toISOString();
    const logBase = { id: `a-${Date.now()}`, date: now, action: `Status diubah menjadi "${status}"`, by: actor };
    await updateDoc(ref, {
        status,
        ...(["In Progress", "Waiting Material", "Quality Check"].includes(status) && !current.startedAt ? { startedAt: now } : {}),
        ...(status === "Completed" ? { completedAt: now } : {}),
        activity: arrayUnion(note ? { ...logBase, note } : logBase),
    });
    const after = await getDoc(ref);
    return after.exists() ? docToWorkOrder(after.id, after.data()) : undefined;
}

async function fbAssign(id: string, pic: string, actor: string): Promise<WorkOrder | undefined> {
    if (!db) return undefined;
    const ref = doc(db, COLLECTION, id);
    const before = await getDoc(ref);
    if (!before.exists()) return undefined;
    const now = new Date().toISOString();
    await updateDoc(ref, {
        pic, status: "Assigned",
        activity: arrayUnion({ id: `a-${Date.now()}`, date: now, action: `Ditugaskan ke ${pic}`, by: actor }),
    });
    const after = await getDoc(ref);
    return after.exists() ? docToWorkOrder(after.id, after.data()) : undefined;
}

async function fbUpdatePhoto(id: string, field: "photo" | "photoAfter", dataUrl: string): Promise<WorkOrder | undefined> {
    if (!db) return undefined;
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, { [field]: dataUrl });
    const after = await getDoc(ref);
    return after.exists() ? docToWorkOrder(after.id, after.data()) : undefined;
}

/* ========== SERVICE UTAMA — satu pintu untuk seluruh aplikasi ========== */

export const workOrderService = {
    async getAll(): Promise<WorkOrder[]> {
        if (firebaseReady && db) {
            if (SEED_MOCK_DATA) await seedIfEmpty();
            return fbGetAll();
        }
        await delay(350);
        return loadAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async getById(id: string): Promise<WorkOrder | undefined> {
        if (firebaseReady && db) {
            const snap = await getDoc(doc(db, COLLECTION, id));
            return snap.exists() ? docToWorkOrder(snap.id, snap.data()) : undefined;
        }
        await delay(250);
        return loadAll().find((w) => w.id === id || w.woNumber === id);
    },

    async create(input: CreateWorkOrderInput): Promise<WorkOrder> {
        if (firebaseReady && db) return fbCreate(input);
        await delay(600);
        const list = loadAll();
        const wo: WorkOrder = {
            id: `wo-${Date.now()}`,
            woNumber: generateWoNumber(list),
            requesterName: input.requesterName,
            department: input.department,
            contactNumber: input.contactNumber,
            location: input.location,
            title: input.title,
            category: input.category,
            division: input.division,
            jenisPekerjaan: input.jenisPekerjaan,
            description: input.description?.trim() || input.title,
            priority: input.priority,
            status: "New",
            createdAt: new Date().toISOString(),
            tanggalDilaporkan: input.tanggalDilaporkan,
            photos: input.photos,
            photo: input.photos[0],
            activity: [{
                id: `a-${Date.now()}`, date: new Date().toISOString(),
                action: "Work order dibuat", by: input.requesterName, note: "Diajukan melalui form work order",
            }],
            notes: [],
            materials: [],
        };
        persist([wo, ...list]);
        return wo;
    },

    async updateStatus(id: string, status: WorkOrderStatus, actor: string, note?: string): Promise<WorkOrder | undefined> {
        if (firebaseReady && db) return fbUpdateStatus(id, status, actor, note);
        await delay(350);
        const list = loadAll();
        const idx = list.findIndex((w) => w.id === id);
        if (idx === -1) return undefined;
        const wo = list[idx];
        const next: WorkOrder = { ...wo, status };
        if (["In Progress", "Waiting Material", "Quality Check"].includes(status) && !next.startedAt) {
            next.startedAt = new Date().toISOString();
        }
        if (status === "Completed") next.completedAt = new Date().toISOString();
        next.activity = [...wo.activity, {
            id: `a-${Date.now()}`, date: new Date().toISOString(),
            action: `Status diubah menjadi "${status}"`, by: actor, note,
        }];
        list[idx] = next;
        persist(list);
        return next;
    },

    async assign(id: string, pic: string, actor: string): Promise<WorkOrder | undefined> {
        if (firebaseReady && db) return fbAssign(id, pic, actor);
        await delay(350);
        const list = loadAll();
        const idx = list.findIndex((w) => w.id === id);
        if (idx === -1) return undefined;
        const wo = list[idx];
        const next: WorkOrder = {
            ...wo, pic, status: "Assigned",
            activity: [...wo.activity, {
                id: `a-${Date.now()}`, date: new Date().toISOString(),
                action: `Ditugaskan ke ${pic}`, by: actor,
            }],
        };
        list[idx] = next;
        persist(list);
        return next;
    },

    async updatePhoto(id: string, field: "photo" | "photoAfter", dataUrl: string): Promise<WorkOrder | undefined> {
        if (firebaseReady && db) return fbUpdatePhoto(id, field, dataUrl);
        const list = loadAll();
        const idx = list.findIndex((w) => w.id === id);
        if (idx === -1) return undefined;
        list[idx] = { ...list[idx], [field]: dataUrl };
        persist(list);
        return list[idx];
    },
};
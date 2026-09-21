import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { CreateWorkOrderInput, WorkOrder, WorkOrderStatus } from "../types";
import { workOrderService } from "../services/workOrderService";
import { db, firebaseReady } from "../services/firebaseClient";
import { useAuth } from "./useAuth";

interface WorkOrdersContextValue {
    workOrders: WorkOrder[];
    loading: boolean;
    create: (input: CreateWorkOrderInput) => Promise<WorkOrder>;
    updateStatus: (id: string, status: WorkOrderStatus, note?: string) => Promise<void>;
    assign: (id: string, pic: string) => Promise<void>;
    updatePhoto: (id: string, field: "photo" | "photoAfter", dataUrl: string) => Promise<void>;
}
const Ctx = createContext<WorkOrdersContextValue | null>(null);

export function WorkOrderProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        let unsub: (() => void) | undefined;

        workOrderService.getAll().then((list) => {
            if (!alive) return;
            setWorkOrders(list);
            setLoading(false);

            // Mode Firebase: berlangganan realtime — WO baru dari device/tab lain
            // (termasuk customer yang mengisi form di HP) langsung muncul tanpa refresh.
            if (firebaseReady && db) {
                unsub = onSnapshot(
                    query(collection(db, "workorders"), orderBy("createdAt", "desc")),
                    (snap: { docs: any[]; }) => {
                        if (!alive) return;
                        setWorkOrders(snap.docs.map((d: { data: () => Omit<WorkOrder, "id">; id: any; }) => ({ ...(d.data() as Omit<WorkOrder, "id">), id: d.id })));
                    },
                    () => { /* gangguan jaringan — data awal tetap tampil */ }
                );
            }
        });

        return () => { alive = false; if (unsub) unsub(); };
    }, []);

    const replace = useCallback((wo: WorkOrder) => {
        setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? wo : w)));
    }, []);

    const create = useCallback(async (input: CreateWorkOrderInput) => {
        const wo = await workOrderService.create(input);
        setWorkOrders((prev) => [wo, ...prev]);
        return wo;
    }, []);

    const updateStatus = useCallback(async (id: string, status: WorkOrderStatus, note?: string) => {
        const wo = await workOrderService.updateStatus(id, status, user?.name ?? "System", note);
        if (wo) replace(wo);
    }, [user, replace]);

    const assign = useCallback(async (id: string, pic: string) => {
        const wo = await workOrderService.assign(id, pic, user?.name ?? "System");
        if (wo) replace(wo);
    }, [user, replace]);

    const updatePhoto = useCallback(async (id: string, field: "photo" | "photoAfter", dataUrl: string) => {
        const wo = await workOrderService.updatePhoto(id, field, dataUrl);
        if (wo) replace(wo);
    }, [replace]);

    const value = useMemo(
        () => ({ workOrders, loading, create, updateStatus, assign, updatePhoto }),
        [workOrders, loading, create, updateStatus, assign, updatePhoto]
    );
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkOrders(): WorkOrdersContextValue {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useWorkOrders harus dipakai di dalam WorkOrderProvider");
    return ctx;
}
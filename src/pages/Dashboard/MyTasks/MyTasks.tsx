import { useMemo } from "react";
import { Wrench } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useWorkOrders } from "../../../hooks/useWorkOrders";
import WorkOrderTable from "../../../components/dashboard/WorkOrderTable/WorkOrderTable";
import Empty from "../../../components/ui/Empty/Empty";
import Button from "../../../components/ui/Button/Button";
import styles from "./MyTasks.module.css";

export default function MyTasks() {
    const { user } = useAuth();
    const { workOrders, loading } = useWorkOrders();
    const mine = useMemo(
        () => workOrders.filter((w) => w.pic === user?.name && !["Completed", "Cancelled"].includes(w.status)),
        [workOrders, user]
    );
    const done = useMemo(() => workOrders.filter((w) => w.pic === user?.name && w.status === "Completed").length, [workOrders, user]);

    return (
        <div className={styles.page}>
            <div className={styles.summary}>
                <div><strong>{mine.length}</strong><span>Tugas aktif</span></div>
                <div><strong>{done}</strong><span>Selesai dikerjakan</span></div>
                <div><strong>{user?.division ?? "—"}</strong><span>Divisi</span></div>
            </div>
            {loading ? (
                <div className={styles.skeletons}>{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 52 }} />)}</div>
            ) : mine.length > 0 ? (
                <WorkOrderTable orders={mine} />
            ) : (
                <div className={styles.emptyWrap}>
                    <Empty icon={Wrench} title="Tidak ada tugas aktif" desc="Saat ini tidak ada work order yang ditugaskan pada Anda yang masih berjalan.">
                        <Button variant="outline" size="sm" to="/dashboard/work-orders">LIHAT SEMUA WORK ORDER</Button>
                    </Empty>
                </div>
            )}
        </div>
    );
}
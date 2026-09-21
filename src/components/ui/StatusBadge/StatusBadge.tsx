import type { WorkOrderStatus } from "../../../types";
import styles from "../badge.module.css";

const CLASS: Record<WorkOrderStatus, string> = {
    New: styles.stNew, Verified: styles.stVerified, Assigned: styles.stAssigned, "In Progress": styles.stProgress,
    "Quality Check": styles.stQC, Completed: styles.stCompleted, Cancelled: styles.stCancelled,
};
export default function StatusBadge({ status }: { status: WorkOrderStatus }) {
    return <span className={[styles.badge, CLASS[status]].join(" ")}><span className={styles.dot} />{status}</span>;
}
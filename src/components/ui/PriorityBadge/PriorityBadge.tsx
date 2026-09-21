import type { Priority } from "../../../types";
import styles from "../badge.module.css";

const CLASS: Record<Priority, string> = {
    Low: styles.prLow, Mid: styles.prMid, High: styles.prHigh,
};
export default function PriorityBadge({ priority }: { priority: Priority }) {
    return <span className={[styles.badge, CLASS[priority]].join(" ")}><span className={styles.dot} />{priority}</span>;
}
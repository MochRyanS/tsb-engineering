import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import type { WorkOrder } from "../../../types";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import PriorityBadge from "../../ui/PriorityBadge/PriorityBadge";
import { formatDate } from "../../../utils/format";
import styles from "./WorkOrderTable.module.css";

interface Props { orders: WorkOrder[]; compact?: boolean; }

export default function WorkOrderTable({ orders, compact }: Props) {
    const navigate = useNavigate();
    const open = (id: string) => navigate(`/dashboard/work-orders/${id}`);

    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>WO Number</th><th>Date</th><th>Requester</th>
                        {!compact && <><th>Department</th><th>Location</th><th>PIC</th></>}
                        <th>Division</th><th>Priority</th><th>Status</th><th aria-label="Aksi" />
                    </tr>
                </thead>
                <tbody>
                    {orders.map((wo) => (
                        <tr key={wo.id} tabIndex={0} onClick={() => open(wo.id)}
                            onKeyDown={(e) => { if (e.key === "Enter") open(wo.id); }}>
                            <td className={styles.mono}>{wo.woNumber}</td>
                            <td>{formatDate(wo.createdAt)}</td>
                            <td className={styles.strong}>{wo.requesterName}</td>
                            {!compact && <><td>{wo.department}</td><td>{wo.location}</td><td>{wo.pic ?? "—"}</td></>}
                            <td>{wo.division}</td>
                            <td><PriorityBadge priority={wo.priority} /></td>
                            <td><StatusBadge status={wo.status} /></td>
                            <td>
                                <button className={styles.eye} aria-label={`Buka detail ${wo.woNumber}`}
                                    onClick={(e) => { e.stopPropagation(); open(wo.id); }}>
                                    <Eye size={15} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
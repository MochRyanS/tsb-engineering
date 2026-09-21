import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "./ChartTooltip";
import styles from "./charts.module.css";
import { STATUS_COLORS } from "../../utils/constants";
import type { WorkOrderStatus } from "../../types";

export interface StatusPoint { name: WorkOrderStatus; value: number; }

export default function StatusChart({ data }: { data: StatusPoint[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    return (
        <div className={styles.wrap}>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                        {data.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name]} />)}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
                {data.map((d) => (
                    <div key={d.name} className={styles.legendRow}>
                        <span className={styles.legendDot} style={{ background: STATUS_COLORS[d.name] }} />
                        {d.name}
                        <span className={styles.legendVal}>{d.value} · {total ? Math.round((d.value / total) * 100) : 0}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "./ChartTooltip";
import styles from "./charts.module.css";
import { STATUS_COLORS } from "../../utils/constants";
import type { WorkOrderStatus } from "../../types";

/* REVISI 12: name diperlebar ke string — donut status kini menerima label
   hasil normalisasi (mis. "On Progress" → "In Progress") sehingga varian
   penulisan lama tetap terhitung; warna tak dikenal memakai abu-abu. */
export interface StatusPoint { name: string; value: number; }

const colorOf = (name: string) => STATUS_COLORS[name as WorkOrderStatus] ?? "#6B756F";

export default function StatusChart({ data }: { data: StatusPoint[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    return (
        <div className={styles.wrap}>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                        {data.map((d) => <Cell key={d.name} fill={colorOf(d.name)} />)}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
                {data.map((d) => (
                    <div key={d.name} className={styles.legendRow}>
                        <span className={styles.legendDot} style={{ background: colorOf(d.name) }} />
                        {d.name}
                        <span className={styles.legendVal}>{d.value} · {total ? Math.round((d.value / total) * 100) : 0}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
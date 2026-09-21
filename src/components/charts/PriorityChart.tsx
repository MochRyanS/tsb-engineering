import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { PRIORITY_COLORS } from "../../utils/constants";
import type { Priority } from "../../types";

export interface PriorityPoint { priority: Priority; total: number; }

export default function PriorityChart({ data }: { data: PriorityPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 34, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#E9EFF6" horizontal={false} />
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="priority" tick={{ fontSize: 11.5, fill: "#17221d", fontWeight: 600 }} axisLine={false} tickLine={false} width={62} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(18,55,42,0.04)" }} />
                <Bar dataKey="total" name="Total WO" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {data.map((d) => <Cell key={d.priority} fill={PRIORITY_COLORS[d.priority]} />)}
                    <LabelList dataKey="total" position="right" style={{ fontSize: 11, fill: "#6b756f", fontFamily: "IBM Plex Mono" }} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

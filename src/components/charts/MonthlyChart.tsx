import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "./ChartTooltip";

export interface MonthlyPoint { month: string; total: number; completed: number; }

export default function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#E9EFF6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b756f" }} axisLine={{ stroke: "#DFE6EE" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b756f" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="total" name="Total WO" stroke="#1F5490" strokeWidth={2.5} dot={{ r: 3, fill: "#4C9BE8", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="completed" name="Selesai" stroke="#4C9BE8" strokeWidth={2} strokeDasharray="5 4" dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}

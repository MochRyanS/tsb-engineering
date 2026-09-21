import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { DIVISION_COLORS } from "../../utils/constants";
import type { Division } from "../../types";

export interface DivisionPoint { division: Division; total: number; }

export default function DivisionChart({ data }: { data: DivisionPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#E9EFF6" vertical={false} />
                <XAxis dataKey="division" tick={{ fontSize: 11, fill: "#6b756f" }} axisLine={{ stroke: "#DFE6EE" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b756f" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(18,55,42,0.04)" }} />
                <Bar dataKey="total" name="Total WO" radius={[6, 6, 0, 0]} maxBarSize={54}>
                    {data.map((d) => <Cell key={d.division} fill={DIVISION_COLORS[d.division]} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

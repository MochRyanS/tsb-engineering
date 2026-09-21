import styles from "./charts.module.css";

interface TipRow { name?: string; value?: number | string; color?: string; }
interface TipProps { active?: boolean; label?: string; payload?: TipRow[]; }

export default function ChartTooltip(props: TipProps) {
    const { active, payload, label } = props;
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tip}>
            <span className={styles.tipLabel}>{label}</span>
            {payload.map((row, i) => (
                <div key={i} className={styles.tipRow}>
                    {row.color && <span className={styles.tipDot} style={{ background: row.color }} />}
                    {row.name}: <strong>{row.value}</strong>
                </div>
            ))}
        </div>
    );
}
import { motion } from "framer-motion";
import { Check, Loader } from "lucide-react";
import type { WorkOrder } from "../../types";
import { STATUS_STEPS, stepIndexFor } from "../../utils/wo";
import styles from "./StatusTimeline.module.css";

export default function StatusTimeline({ wo }: { wo: WorkOrder }) {
    const current = stepIndexFor(wo.status);
    const cancelled = wo.status === "Cancelled";
    return (
        <div className={styles.wrap}>
            {STATUS_STEPS.map((step, i) => {
                const done = i < current || (i === current && wo.status === "Completed");
                const active = i === current && wo.status !== "Completed";
                return (
                    <motion.div
                        key={step} className={styles.step}
                        initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}
                    >
                        <span className={[styles.node, done ? styles.done : "", active ? styles.active : "", cancelled ? styles.muted : ""].join(" ")}>
                            {done && <Check size={13} strokeWidth={3} />}
                            {active && <span className={styles.activeDot} />}
                        </span>
                        <div className={styles.labels}>
                            <span className={[styles.title, done || active ? styles.titleOn : ""].join(" ")}>{step}</span>
                            {active && <span className={styles.now}>Sedang berlangsung</span>}
                        </div>
                        {i < STATUS_STEPS.length - 1 && <span className={[styles.line, i < current ? styles.lineDone : ""].join(" ")} aria-hidden="true" />}
                    </motion.div>
                );
            })}
            {cancelled && (
                <div className={styles.cancelledNote}>
                    <Loader size={13} />Work order ini dibatalkan dan tidak akan diproses.
                </div>
            )}
        </div>
    );
}
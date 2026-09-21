import { motion } from "framer-motion";
import WorkOrderForm from "../../components/WorkOrderForm/WorkOrderForm";
import { fadeUp } from "../../utils/animations";
import styles from "./WorkOrder.module.css";

export default function WorkOrder() {
    return (
        <>
            <section className={styles.pageHead}>
                <div className="container">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible">
                        <span className={styles.eyebrow}>WORK ORDER — PERMINTAAN PEKERJAAN</span>
                        <h1 className={styles.title}>Ajukan Permintaan<br />Maintenance</h1>
                        <p className={styles.lead}>Isi form di bawah — tim kami akan memverifikasi dan menugaskan teknisi yang tepat. Anda akan menerima nomor work order untuk memantau progresnya.</p>
                    </motion.div>
                </div>
            </section>
            <section className={styles.formSection}>
                <div className="container">
                    <WorkOrderForm />
                </div>
            </section>
        </>
    );
}
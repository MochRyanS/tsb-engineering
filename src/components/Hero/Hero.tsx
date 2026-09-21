import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Activity, ShieldAlert, Gauge } from "lucide-react";
import { IMAGES } from "../../data/images";
import styles from "./Hero.module.css";

const line: Variants = {
    hidden: { opacity: 0, y: 44 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: 0.15 + i * 0.13, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <section className={styles.hero} ref={ref}>
            <motion.div className={styles.bg} style={{ y: bgY, scale: bgScale }} aria-hidden="true">
                {IMAGES.heroVideo ? (
                    <video className={styles.media} autoPlay muted loop playsInline poster={IMAGES.hero}>
                        <source src={IMAGES.heroVideo} type="video/mp4" />
                    </video>
                ) : (
                    <img className={styles.media} src={IMAGES.hero} alt="Aktivitas engineering di lingkungan Taman Safari Bogor"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
            </motion.div>
            <div className={styles.overlay} aria-hidden="true" />
            <div className={styles.gridOverlay} aria-hidden="true" />

            <motion.div className={styles.content} style={{ opacity: contentOpacity }}>
                <motion.p className={styles.eyebrow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.6 }}>
                    <span className={styles.eyebrowDot} />ENGINEERING DEPARTMENT — TAMAN SAFARI BOGOR
                </motion.p>
                <h1 className={styles.title}>
                    <motion.span custom={0} variants={line} initial="hidden" animate="visible" className={styles.lineBlock}>Keeping Every Experience</motion.span>
                    <motion.span custom={1} variants={line} initial="hidden" animate="visible" className={styles.lineBlock}>Safe, Comfortable</motion.span>
                    <motion.span custom={2} variants={line} initial="hidden" animate="visible" className={[styles.lineBlock, styles.accentLine].join(" ")}>&amp; Running.</motion.span>
                </h1>
                <motion.p className={styles.sub} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }}>
                    Dari kelistrikan hingga struktur bangunan — kami menjaga keandalan setiap fasilitas
                    agar jutaan pengalaman pengunjung berjalan aman, nyaman, dan tanpa henti.
                </motion.p>
                <motion.div className={styles.cta} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.85, duration: 0.45 }}>
                    <a href="#/work-order" className={styles.btnPrimary}>CREATE WORK ORDER<ArrowRight size={16} /></a>
                    <a href="#/divisions" className={styles.btnGhost}>OUR DIVISIONS</a>
                </motion.div>
            </motion.div>

            <div className={styles.chips} aria-hidden="true">
                <motion.div className={styles.chip} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0, y: [0, -10, 0] }} transition={{ opacity: { delay: 1.1 }, y: { repeat: Infinity, duration: 5, ease: "easeInOut" } }}>
                    <Activity size={13} />SYS — MONITORING 24/7
                </motion.div>
                <motion.div className={styles.chip} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0, y: [0, -12, 0] }} transition={{ opacity: { delay: 1.35 }, y: { repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 0.6 } }}>
                    <ShieldAlert size={13} />WO-2026-00028 / URGENT / ELECTRICAL
                </motion.div>
                <motion.div className={styles.chip} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0, y: [0, -8, 0] }} transition={{ opacity: { delay: 1.6 }, y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.1 } }}>
                    <Gauge size={13} />UTILITIES UPTIME — 99.2%
                </motion.div>
            </div>

            <div className={styles.scrollCue} aria-hidden="true">
                <span className={styles.cueLine} />SCROLL
            </div>
        </section>
    );
}
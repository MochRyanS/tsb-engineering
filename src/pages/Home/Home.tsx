import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Zap, Cog, Building2, Droplets } from "lucide-react";
import Hero from "../../components/Hero/Hero";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import DivisionCard from "../../components/DivisionCard/DivisionCard";
import { IMAGES } from "../../data/images";
import { liveStatus } from "../../data/divisions";
import { DIVISIONS } from "../../utils/constants";
import { fadeUp, stagger, viewportOnce } from "../../utils/animations";
import styles from "./Home.module.css";

const STATUS_CLASS = { Available: styles.sOk, Busy: styles.sBusy, "Emergency Response": styles.sEmergency };
const CHECKS = [
    "Keandalan utilitas, genset, dan jaringan listrik taman",
    "Struktur bangunan, jalan, dan fasilitas pengunjung",
    "Sistem air bersih, drainase, dan sanitasi area",
    " respons cepat 24/7 untuk kondisi darurat",
];

function useClock(): string {
    const [time, setTime] = useState(new Date().toLocaleTimeString("id-ID", { hour12: false }));
    useEffect(() => {
        const t = setInterval(() => setTime(new Date().toLocaleTimeString("id-ID", { hour12: false })), 1000);
        return () => clearInterval(t);
    }, []);
    return time;
}

export default function Home() {
    const clock = useClock();
    return (
        <>
            <Hero />

            {/* ——— ENGINEERING BEHIND THE EXPERIENCE ——— */}
            <section className="section">
                <div className="container">
                    <motion.div className={styles.introGrid} variants={stagger} initial="hidden" whileInView="visible" viewport={viewportOnce}>
                        <motion.div className={styles.introImage} variants={fadeUp}>
                            <img src={IMAGES.intro} alt="Tim engineering Taman Safari Bogor" loading="lazy" />
                            <span className={styles.introBadge}>
                                <strong>EST. 1986</strong>
                                <small>CISARUA · BOGOR · JAWA BARAT</small>
                            </span>
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <SectionHeader eyebrow="SEC / 01 — INTRODUCTION" title="Engineering Behind the Experience" />
                            <p className={styles.introText}>
                                Departemen Engineering Taman Safari Bogor bertanggung jawab dalam menjaga keandalan
                                fasilitas, utilitas, infrastruktur, dan sistem pendukung operasional agar seluruh
                                aktivitas dapat berjalan dengan aman, nyaman, dan optimal.
                            </p>
                            <ul className={styles.checks}>
                                {CHECKS.map((c) => (
                                    <li key={c}><CheckCircle2 size={17} />{c}</li>
                                ))}
                            </ul>
                            <Link to="/divisions" className={styles.introMore}>LIHAT DIVISI KAMI<ArrowRight size={15} /></Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ——— DIVISIONS ——— */}
            <section className="section">
                <div className="container">
                    <SectionHeader eyebrow="SEC / 02 — DIVISIONS" title="Our Engineering Divisions"
                        desc="Empat divisi teknis bekerja sebagai satu sistem untuk menjaga seluruh aset taman." />
                    <div className={styles.divGrid}>
                        {DIVISIONS.map((d, i) => <DivisionCard key={d} division={d} index={i} />)}
                    </div>
                </div>
            </section>

            {/* ——— LIVE STATUS ——— */}
            <section className="section">
                <div className="container">
                    <div className={styles.liveGrid}>
                        <div>
                            <SectionHeader eyebrow="SEC / 04 — LIVE STATUS" title="Engineering Live Status" />
                            <div className={styles.liveMeta}>
                                <span className={styles.liveTag}><i className={styles.liveBlink} />LIVE</span>
                                <span className={styles.liveClock}>{clock} WIB</span>
                            </div>
                            <p className={styles.liveDesc}>Status kesiapan tim setiap divisi, diperbarui dari jadwal shift dan beban work order aktif.</p>
                        </div>
                        <ul className={styles.liveList}>
                            {DIVISIONS.map((d) => (
                                <li key={d} className={styles.liveRow}>
                                    <span className={styles.liveName}>
                                        {d === "Electrical" && <Zap size={16} />}
                                        {d === "Mechanical" && <Cog size={16} />}
                                        {d === "Civil" && <Building2 size={16} />}
                                        {d === "Plumbing" && <Droplets size={16} />}
                                        {d}
                                    </span>
                                    <span className={[styles.liveStatus, STATUS_CLASS[liveStatus[d]]].join(" ")}>
                                        <i className={styles.pulseDot} />{liveStatus[d]}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ——— CTA ——— */}
            <section className={styles.cta}>
                <img src={IMAGES.cta} alt="" aria-hidden="true" className={styles.ctaBg} />
                <div className={styles.ctaOverlay} aria-hidden="true" />
                <span className={styles.ctaGhost} aria-hidden="true">ENGINEERING</span>
                <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
                        <span className={styles.ctaEyebrow}>SEC / 05 — SUPPORT</span>
                        <h2 className={styles.ctaTitle}>NEED ENGINEERING<br />SUPPORT?</h2>
                        <p className={styles.ctaDesc}>Submit a maintenance request and let our engineering team take care of it.</p>
                        <Link to="/work-order" className={styles.ctaBtn}>CREATE WORK ORDER<ArrowRight size={16} /></Link>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
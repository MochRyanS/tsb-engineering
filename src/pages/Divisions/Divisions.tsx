import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Cog, Building2, Droplets, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { divisionInfos } from "../../data/divisions";
import { IMAGES } from "../../data/images";
import { fadeUp, viewportOnce } from "../../utils/animations";
import styles from "./Divisions.module.css";

const ICONS: Record<string, LucideIcon> = { Electrical: Zap, Mechanical: Cog, Civil: Building2, Plumbing: Droplets };

export default function Divisions() {
    return (
        <>
            <section className={styles.pageHead}>
                <div className="container">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible">
                        <span className={styles.eyebrow}>DIVISIONS — FOUR UNITS, ONE SYSTEM</span>
                        <h1 className={styles.title}>Our Engineering<br />Divisions</h1>
                    </motion.div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    {divisionInfos.map((d, i) => {
                        const Icon = ICONS[d.id];
                        const reversed = i % 2 === 1;
                        return (
                            <motion.article key={d.id} className={[styles.divRow, reversed ? styles.reversed : ""].join(" ")}
                                initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce} transition={{ duration: 0.6 }}>
                                <div className={styles.divImage}>
                                    <img src={IMAGES.divisions[d.id]} alt={`Divisi ${d.id}`} loading="lazy" />
                                    <span className={styles.divIconChip}><Icon size={22} /></span>
                                </div>
                                <div className={styles.divBody}>
                                    <span className={styles.divIndex}>DIV / {String(i + 1).padStart(2, "0")}</span>
                                    <h2>{d.id}</h2>
                                    <p className={styles.divTagline}>{d.tagline}</p>
                                    <p className={styles.divDesc}>{d.description}</p>
                                    <div className={styles.chips}>
                                        {d.scope.map((s) => <span key={s} className={styles.chip}>{s}</span>)}
                                    </div>
                                    <div className={styles.divMeta}>
                                        <div><small>KEPALA DIVISI</small><strong>{d.head}</strong></div>
                                    </div>
                                    <Link to="/work-order" className={styles.divCta}>AJUKAN WORK ORDER<ArrowRight size={15} /></Link>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </section>
        </>
    );
}
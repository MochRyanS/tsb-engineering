import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Zap, Cog, Building2, Droplets } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Division } from "../../types";
import { divisionInfos } from "../../data/divisions";
import { IMAGES } from "../../data/images";
import styles from "./DivisionCard.module.css";

const ICONS: Record<Division, LucideIcon> = { Electrical: Zap, Mechanical: Cog, Civil: Building2, Plumbing: Droplets };

export default function DivisionCard({ division, index }: { division: Division; index: number }) {
    const info = divisionInfos.find((d) => d.id === division)!;
    const Icon = ICONS[division];
    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: index * 0.08 }} className={styles.card}
        >
            <Link to="/divisions" className={styles.cardLink} aria-label={`Lihat divisi ${division}`}>
                <div className={styles.imageWrap}>
                    <img className={styles.image} src={IMAGES.divisions[division]} alt={`Divisi ${division}`} loading="lazy" />
                    <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.iconChip}><Icon size={20} /></span>
                </div>
                <div className={styles.body}>
                    <h3 className={styles.name}>{division}</h3>
                    <p className={styles.tagline}>{info.tagline}</p>
                    <p className={styles.desc}>{info.description}</p>
                    <span className={styles.more}>PELAJARI DIVISI<ArrowUpRight size={14} /></span>
                </div>
            </Link>
        </motion.article>
    );
}
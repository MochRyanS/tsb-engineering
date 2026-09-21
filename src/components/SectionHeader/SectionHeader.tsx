import styles from "./SectionHeader.module.css";

interface SectionHeaderProps { eyebrow: string; title: string; desc?: string; dark?: boolean; align?: "left" | "center"; }
export default function SectionHeader({ eyebrow, title, desc, dark, align = "left" }: SectionHeaderProps) {
    return (
        <div className={[styles.wrap, dark ? styles.dark : "", align === "center" ? styles.center : ""].join(" ")}>
            <span className={styles.eyebrow}><i className={styles.tick} aria-hidden="true" />{eyebrow}</span>
            <h2>{title}</h2>
            {desc && <p className={styles.desc}>{desc}</p>}
        </div>
    );
}
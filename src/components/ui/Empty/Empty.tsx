import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Empty.module.css";

interface EmptyProps { icon: LucideIcon; title: string; desc?: string; children?: ReactNode; }
export default function Empty({ icon: Icon, title, desc, children }: EmptyProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.iconWrap}><Icon size={26} /></span>
      <h4>{title}</h4>
      {desc && <p>{desc}</p>}
      {children}
    </div>
  );
}
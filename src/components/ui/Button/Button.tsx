import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import styles from "./Button.module.css";

type Variant = "primary" | "dark" | "outline" | "ghost" | "danger";
interface CommonProps {
  variant?: Variant; size?: "sm" | "md" | "lg"; loading?: boolean; icon?: LucideIcon; to?: string; children?: ReactNode;
}
type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export default function Button({
  variant = "dark", size = "md", loading = false, icon: Icon, to, children, className, disabled, ...rest
}: ButtonProps) {
  const classes = [styles.btn, styles[variant], styles[size], className ?? "", loading ? styles.loading : ""]
    .filter(Boolean).join(" ");
  const content = (
    <>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {Icon && !loading && <Icon size={size === "sm" ? 15 : 17} strokeWidth={2.2} />}
      {children}
    </>
  );
  if (to) {
    return <Link to={to} className={classes}>{content}</Link>;
  }
  return (
    <button className={classes} disabled={disabled ?? loading} {...rest}>
      {content}
    </button>
  );
}
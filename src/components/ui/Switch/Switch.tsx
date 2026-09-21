import * as React from "react";
import styles from "./Switch.module.css";

interface SwitchProps { checked: boolean; onChange: (v: boolean) => void; label: string; }
export default function Switch({ checked, onChange, label }: SwitchProps) {
    return React.createElement(
        "button",
        {
            type: "button",
            role: "switch",
            "aria-checked": checked,
            "aria-label": label,
            className: [styles.sw, checked ? styles.on : ""].join(" "),
            onClick: () => onChange(!checked),
        },
        React.createElement("span", { className: styles.knob }),
    );
}
import * as React from "react";
import { HardHat } from "lucide-react";
import styles from "./PageLoader.module.css";

export default function PageLoader() {
    return React.createElement(
        "div",
        { className: styles.wrap, role: "status", "aria-label": "Memuat halaman" },
        React.createElement(
            "span",
            { className: styles.mark },
            React.createElement(HardHat, { size: 26, className: styles.spinIcon })
        ),
        React.createElement("span", { className: styles.label }, "ENGINEERING — TAMAN SAFARI BOGOR")
    );
}
import React from "react";
import { Link } from "react-router-dom";
import { HardHat, MapPin, Phone, Clock } from "lucide-react";
import styles from "./Footer.module.css";

const QUICK = [
    { to: "/", label: "Home" },
    { to: "/divisions", label: "Divisions" },
    { to: "/facilities", label: "Facilities" },
    { to: "/work-order", label: "Work Order" },
];
const ENGINEERING = ["Electrical", "Mechanical", "Civil", "Plumbing"];

export default function Footer() {
    const quickLinks = QUICK.map((l) => React.createElement(Link, { key: l.to, to: l.to }, l.label));
    const engineeringLinks = ENGINEERING.map((d) => React.createElement(Link, { key: d, to: "/divisions" }, d));

    return React.createElement(
        "footer",
        { className: styles.footer },
        React.createElement(
            "div",
            { className: styles.grid },
            React.createElement(
                "div",
                { className: styles.brandCol },
                React.createElement(
                    "div",
                    { className: styles.brand },
                    React.createElement("span", { className: styles.mark }, React.createElement(HardHat, { size: 18 })),
                    React.createElement(
                        "span",
                        null,
                        React.createElement("strong", null, "ENGINEERING DEPARTMENT"),
                        React.createElement("small", null, "TAMAN SAFARI BOGOR")
                    )
                ),
                React.createElement("p", { className: styles.tagline }, "“Keeping Every Experience Safe, Comfortable & Running.”"),
                React.createElement(
                    "ul",
                    { className: styles.contact },
                    React.createElement(
                        "li",
                        null,
                        React.createElement(MapPin, { size: 14 }),
                        "Jl. Raya Puncak No. 601, Cisarua, Bogor"
                    ),
                    React.createElement(
                        "li",
                        null,
                        React.createElement(Phone, { size: 14 }),
                        "Ext. 350 — Engineering Office"
                    ),
                    React.createElement(
                        "li",
                        null,
                        React.createElement(Clock, { size: 14 }),
                        "Standby 24/7 untuk kondisi darurat"
                    )
                )
            ),
            React.createElement(
                "nav",
                { className: styles.col, "aria-label": "Tautan cepat" },
                React.createElement("h4", null, "QUICK LINKS"),
                ...quickLinks
            ),
            React.createElement(
                "nav",
                { className: styles.col, "aria-label": "Divisi engineering" },
                React.createElement("h4", null, "ENGINEERING"),
                ...engineeringLinks
            ),
            React.createElement(
                "div",
                { className: styles.col },
                React.createElement("h4", null, "PORTAL INTERNAL"),
                React.createElement(
                    "p",
                    { className: styles.note },
                    "Ajukan permintaan perbaikan, pantau status, dan kelola pekerjaan maintenance dalam satu sistem."
                ),
                React.createElement(
                    Link,
                    { to: "/login", className: styles.loginLink },
                    "Login Staf"
                )
            )
        ),
        React.createElement(
            "div",
            { className: styles.bottom },
            React.createElement("span", null, "© 2026 Engineering Department — Taman Safari Bogor"),
            React.createElement("span", { className: styles.version }, "INTERNAL SYSTEM v1.0")
        )
    );
}
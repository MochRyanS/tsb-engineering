/** @jsx React.createElement */
import * as React from "react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HardHat, Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useScrollY } from "../../hooks/useScrollY";
import styles from "./Navbar.module.css";

const LINKS = [
    { to: "/", label: "HOME" },
    { to: "/divisions", label: "DIVISIONS" },
    { to: "/facilities", label: "FACILITIES" },
    { to: "/work-order", label: "WORK ORDER" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const scrolled = useScrollY(40);
    const { pathname } = useLocation();
    const { user } = useAuth();
    const transparent = pathname === "/" && !scrolled && !open;

    return React.createElement(
        "header",
        { className: [styles.nav, transparent ? styles.transparent : styles.solid].join(" ") },
        React.createElement(
            "div",
            { className: styles.inner },
            React.createElement(
                Link,
                { to: "/", className: styles.brand, "aria-label": "Beranda Engineering TSB" },
                React.createElement("span", { className: styles.mark }, React.createElement(HardHat, { size: 18 })),
                React.createElement(
                    "span",
                    { className: styles.brandText },
                    React.createElement("strong", null, "ENGINEERING"),
                    React.createElement("small", null, "TAMAN SAFARI BOGOR")
                )
            ),
            React.createElement(
                "nav",
                { className: styles.links, "aria-label": "Navigasi utama" },
                ...LINKS.map((l) =>
                    React.createElement(
                        NavLink,
                        {
                            key: l.to,
                            to: l.to,
                            end: l.to === "/",
                            className: ({ isActive }: { isActive: boolean }) =>
                                [styles.link, isActive ? styles.active : ""].join(" "),
                        },
                        l.label
                    )
                )
            ),
            React.createElement(
                "div",
                { className: styles.actions },
                user
                    ? React.createElement(
                        Link,
                        { to: "/dashboard", className: styles.loginBtn },
                        React.createElement(LayoutDashboard, { size: 15 }),
                        "DASHBOARD"
                    )
                    : React.createElement(
                        Link,
                        { to: "/login", className: styles.loginBtn },
                        React.createElement(LogIn, { size: 15 }),
                        "LOGIN"
                    ),
                React.createElement(
                    "button",
                    {
                        className: styles.burger,
                        "aria-label": open ? "Tutup menu" : "Buka menu",
                        "aria-expanded": open,
                        onClick: () => setOpen((v: any) => !v),
                    },
                    open ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 })
                )
            )
        ),
        React.createElement(
            AnimatePresence,
            null,
            open &&
            React.createElement(
                motion.nav,
                {
                    className: styles.mobileMenu,
                    "aria-label": "Menu mobile",
                    initial: { height: 0, opacity: 0 },
                    animate: { height: "auto", opacity: 1 },
                    exit: { height: 0, opacity: 0 },
                    transition: { duration: 0.3, ease: "easeOut" },
                },
                ...LINKS.map((l) =>
                    React.createElement(
                        NavLink,
                        {
                            key: l.to,
                            to: l.to,
                            end: l.to === "/",
                            onClick: () => setOpen(false),
                            className: ({ isActive }: { isActive: boolean }) =>
                                [styles.mobileLink, isActive ? styles.mobileActive : ""].join(" "),
                        },
                        l.label
                    )
                ),
                React.createElement(
                    Link,
                    { to: user ? "/dashboard" : "/login", onClick: () => setOpen(false), className: styles.mobileLogin },
                    user ? "DASHBOARD" : "LOGIN"
                )
            )
        )
    );
}
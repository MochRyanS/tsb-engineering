import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout() {
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const { pathname } = useLocation();

    return (
        <div className={styles.shell}>
            <Sidebar open={open} onClose={() => setOpen(false)} collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />
            {open && <div className={styles.overlay} onClick={() => setOpen(false)} aria-hidden="true" />}
            <div className={[styles.main, collapsed ? styles.mainWide : ""].join(" ")}>
                <Topbar onMenu={() => setOpen(true)} />
                <motion.main
                    key={pathname} className={styles.content}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                >
                    <Outlet />
                </motion.main>
            </div>
        </div>
    );
}
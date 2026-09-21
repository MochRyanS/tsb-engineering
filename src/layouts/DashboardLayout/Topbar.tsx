import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Bell, LogOut, Settings, ClipboardList, ShieldAlert, CheckCircle2, Plus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useWorkOrders } from "../../hooks/useWorkOrders";
import { relativeTime } from "../../utils/format";
import styles from "./DashboardLayout.module.css";

const TITLES: Array<[string, string]> = [
    ["/dashboard/work-orders/", "Detail Work Order"],
    ["/dashboard/work-orders", "Work Orders"],
    ["/dashboard/my-tasks", "My Tasks"],
    ["/dashboard/technicians", "Technicians"],
    ["/dashboard/divisions", "Divisions"],
    ["/dashboard/locations", "Locations"],
    ["/dashboard/reports", "Reports"],
    ["/dashboard/users", "Users"],
    ["/dashboard/settings", "Settings"],
    ["/dashboard", "Dashboard"],
];
const READ_KEY = "tsb_notif_read";

interface NotifItem { id: string; icon: "new" | "assigned" | "completed" | "urgent"; message: string; time: string; }

function Topbar({ onMenu }: { onMenu: () => void }) {
    const { user, logout } = useAuth();
    const { workOrders } = useWorkOrders();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [notifOpen, setNotifOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Dashboard";

    const notifications: NotifItem[] = useMemo(() => {
        return workOrders.slice(0, 8).map((wo) => {
            if (wo.priority === "High" && wo.status !== "Completed" && wo.status !== "Cancelled") {
                return { id: wo.id, icon: "urgent", message: `Perhatian: ${wo.woNumber} berprioritas TINGGI — ${wo.title}`, time: wo.createdAt };
            }
            if (wo.status === "New") return { id: wo.id, icon: "new", message: `Work order baru dari ${wo.requesterName} — ${wo.title}`, time: wo.createdAt };
            if (wo.status === "Assigned" && wo.pic) return { id: wo.id, icon: "assigned", message: `${wo.woNumber} ditugaskan ke ${wo.pic}`, time: wo.createdAt };
            if (wo.status === "Completed") return { id: wo.id, icon: "completed", message: `${wo.woNumber} telah selesai`, time: wo.completedAt ?? wo.createdAt };
            return { id: wo.id, icon: "assigned", message: `${wo.woNumber} — status: ${wo.status}`, time: wo.createdAt };
        });
    }, [workOrders]);

    const [readIds, setReadIds] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem(READ_KEY) ?? "[]") as string[]; } catch { return []; }
    });
    const unread = notifications.filter((n) => !readIds.includes(n.id)).length;

    const markAll = () => {
        const ids = notifications.map((n) => n.id);
        setReadIds(ids);
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    };

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const NOTIF_ICONS = { new: ClipboardList, assigned: CheckCircle2, completed: CheckCircle2, urgent: ShieldAlert };
    const ICON_COLOR = { new: styles.nIconNew, assigned: styles.nIconAssign, completed: styles.nIconDone, urgent: styles.nIconUrgent };

    return (
        <header className={styles.topbar}>
            <button className={styles.menuBtn} onClick={onMenu} aria-label="Buka menu navigasi"><Menu size={19} /></button>
            <div className={styles.titleWrap}>
                <h1 className={styles.pageTitle}>{title}</h1>
                <span className={styles.pageCrumb}>ENGINEERING / {title.toUpperCase()}</span>
            </div>
            <div className={styles.topActions}>
                <Link to="/work-order" className={styles.quickAdd}><Plus size={15} />BUAT WO</Link>
                <div ref={notifRef} className={styles.notifWrap}>
                    <button className={styles.iconBtn} onClick={() => setNotifOpen((v) => !v)} aria-label="Notifikasi" aria-expanded={notifOpen}>
                        <Bell size={18} />
                        {unread > 0 && <span className={styles.badgeCount}>{unread}</span>}
                    </button>
                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div className={styles.dropdown}
                                initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.18 }}>
                                <div className={styles.ddHeader}>
                                    <strong>NOTIFIKASI</strong>
                                    <button className={styles.markAll} onClick={markAll}>Tandai semua dibaca</button>
                                </div>
                                <div className={styles.notifList}>
                                    {notifications.map((n) => {
                                        const Icon = NOTIF_ICONS[n.icon];
                                        return (
                                            <button key={n.id} className={styles.notifItem}
                                                onClick={() => { navigate(`/dashboard/work-orders/${n.id}`); setNotifOpen(false); }}>
                                                <span className={[styles.nIcon, ICON_COLOR[n.icon]].join(" ")}><Icon size={15} /></span>
                                                <span className={styles.nBody}>
                                                    <span className={styles.nMsg}>{n.message}</span>
                                                    <span className={styles.nTime}>{relativeTime(n.time)}</span>
                                                </span>
                                                {!readIds.includes(n.id) && <span className={styles.nDot} aria-label="belum dibaca" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div ref={userRef} className={styles.userWrap}>
                    <button className={styles.userBtn} onClick={() => setUserOpen((v) => !v)} aria-expanded={userOpen}>
                        <span className={styles.avatar}>{user ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "?"}</span>
                        <span className={styles.userName}>{user?.name}</span>
                    </button>
                    <AnimatePresence>
                        {userOpen && (
                            <motion.div className={styles.dropdown}
                                initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.18 }}>
                                <div className={styles.ddUser}>
                                    <strong>{user?.name}</strong>
                                    <span>{user?.role}{user?.division ? ` · ${user.division}` : ""}</span>
                                </div>
                                <Link to="/dashboard/settings" className={styles.ddLink} onClick={() => setUserOpen(false)}><Settings size={15} />Pengaturan</Link>
                                <button className={styles.ddLink} onClick={logout}><LogOut size={15} />Keluar</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
export default Topbar;
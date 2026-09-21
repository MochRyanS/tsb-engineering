import { NavLink } from "react-router-dom";
import {
    LayoutDashboard, ClipboardList, Wrench, Users, Building2, MapPin,
    BarChart3, UserCog, Settings, HardHat, ChevronLeft, LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import styles from "./DashboardLayout.module.css";

interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean; }
const NAV: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/dashboard/work-orders", label: "Work Orders", icon: ClipboardList },
    { to: "/dashboard/my-tasks", label: "My Tasks", icon: Wrench },
    { to: "/dashboard/technicians", label: "Technicians", icon: Users },
    { to: "/dashboard/divisions", label: "Divisions", icon: Building2 },
    { to: "/dashboard/locations", label: "Locations", icon: MapPin },
    { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { to: "/dashboard/users", label: "Users", icon: UserCog },
    { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps { open: boolean; onClose: () => void; collapsed: boolean; onToggleCollapse: () => void; }

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
    const { user, logout } = useAuth();
    return (
        <aside className={[styles.sidebar, open ? styles.sidebarOpen : "", collapsed ? styles.sidebarCollapsed : ""].join(" ")} aria-label="Navigasi dashboard">
            <div className={styles.brand}>
                <span className={styles.brandMark}><HardHat size={18} /></span>
                {!collapsed && (
                    <span className={styles.brandText}>
                        <strong>ENGINEERING</strong>
                        <small>DASH · TSB</small>
                    </span>
                )}
            </div>

            <nav className={styles.nav}>
                {NAV.map((item) => (
                    <NavLink
                        key={item.to} to={item.to} end={item.end} onClick={onClose} title={item.label}
                        className={({ isActive }) => [styles.navLink, isActive ? styles.navActive : ""].join(" ")}
                    >
                        <item.icon size={17} strokeWidth={2} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className={styles.sideFooter}>
                {!collapsed && user && (
                    <div className={styles.userMini}>
                        <span className={styles.avatar}>{user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                        <span className={styles.userMiniText}>
                            <strong>{user.name}</strong>
                            <small>{user.role}</small>
                        </span>
                    </div>
                )}
                <div className={styles.sideActions}>
                    <button className={styles.collapseBtn} onClick={onToggleCollapse} aria-label={collapsed ? "Perluas sidebar" : "Persempit sidebar"}>
                        <ChevronLeft size={16} className={collapsed ? styles.chevFlip : ""} />
                    </button>
                    <button className={styles.logoutBtn} onClick={logout} title="Keluar" aria-label="Keluar">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
export default Sidebar;
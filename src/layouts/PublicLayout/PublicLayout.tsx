import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import FloatingAction from "../../components/FloatingAction/FloatingAction";
import styles from "./PublicLayout.module.css";

export default function PublicLayout() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
    return (
        <div className={styles.root}>
            <Navbar />
            <main className={styles.main}>
                <Outlet />
            </main>
            <Footer />
            <FloatingAction />
        </div>
    );
}
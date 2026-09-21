import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    Trees, UtensilsCrossed, Hotel, Building, Ticket, Car, FerrisWheel,
    PawPrint, Power, Bath, Warehouse, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import { useWorkOrders } from "../../hooks/useWorkOrders";
import { useLocations } from "../../hooks/useLocations";
import { viewportOnce } from "../../utils/animations";
import styles from "./Facilities.module.css";

const ICON_MAP: Record<string, LucideIcon> = {
    "Safari Park": Trees, Restaurant: UtensilsCrossed, Hotel: Hotel, Office: Building,
    Ticketing: Ticket, "Parking Area": Car, Wahana: FerrisWheel, "Animal Area": PawPrint,
    "Utility Area": Power, Toilet: Bath, Warehouse: Warehouse,
};

export default function Facilities() {
    const { locations, loading } = useLocations();
    const { workOrders } = useWorkOrders();

    const stats = useMemo(() => {
        const map = new Map<string, { total: number; open: number }>();
        for (const l of locations) map.set(l.name, { total: 0, open: 0 });
        for (const wo of workOrders) {
            const s = map.get(wo.location);
            if (s) { s.total++; if (!["Completed", "Cancelled"].includes(wo.status)) s.open++; }
        }
        return map;
    }, [locations, workOrders]);

    return (
        <section className="section">
            <div className="container">
                <SectionHeader eyebrow="FACILITIES — 11 ZONA LAYANAN" title="Fasilitas dalam Pengawasan Kami"
                    desc="Setiap zona lokasi di Taman Safari Bogor tercatat sebagai master data — memastikan permintaan maintenance selalu sampai ke tempat yang tepat." />
                {loading ? (
                    <div className={styles.skeletonGrid}>
                        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 130 }} />)}
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {locations.map((l, i) => {
                            const Icon = ICON_MAP[l.name] ?? Building;
                            const s = stats.get(l.name) ?? { total: 0, open: 0 };
                            return (
                                <motion.div key={l.id} className={styles.card}
                                    initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce}
                                    transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}>
                                    <div className={styles.cardTop}>
                                        <span className={styles.iconChip}><Icon size={19} /></span>
                                        <span className={styles.category}>{l.category}</span>
                                    </div>
                                    <h3>{l.name}</h3>
                                    <div className={styles.cardStats}>
                                        <span><strong>{s.total}</strong> work order</span>
                                        {s.open > 0 && <span className={styles.openChip}><Wrench size={11} />{s.open} aktif</span>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
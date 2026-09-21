import { useMemo, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLocations } from "../../../hooks/useLocations";
import { useWorkOrders } from "../../../hooks/useWorkOrders";
import { useToast } from "../../../components/ui/Toast/Toast";
import Button from "../../../components/ui/Button/Button";
import Modal from "../../../components/ui/Modal/Modal";
import Input from "../../../components/ui/Input/Input";
import Select from "../../../components/ui/Select/Select";
import styles from "./Locations.module.css";

const CATEGORIES = ["Zona Pengunjung", "Layanan Pengunjung", "Zona Satwa", "Kantor", "Operasional"];

export default function Locations() {
    const { locations, add, remove } = useLocations();
    const { workOrders } = useWorkOrders();
    const { push } = useToast();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const counts = useMemo(() => {
        const map = new Map<string, number>();
        for (const wo of workOrders) map.set(wo.location, (map.get(wo.location) ?? 0) + 1);
        return map;
    }, [workOrders]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 3) { push("error", "Nama lokasi minimal 3 karakter."); return; }
        if (!category) { push("error", "Pilih kategori lokasi."); return; }
        setBusy(true);
        try {
            await add(name.trim(), category);
            push("success", `Lokasi "${name.trim()}" ditambahkan.`);
            setOpen(false); setName(""); setCategory("");
        } catch (err) {
            push("error", err instanceof Error ? err.message : "Gagal menambah lokasi.");
        } finally { setBusy(false); }
    };

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <p className={styles.count}>{locations.length} lokasi terdaftar sebagai master data</p>
                <Button variant="dark" icon={Plus} onClick={() => setOpen(true)}>TAMBAH LOKASI</Button>
            </div>

            <div className={styles.grid}>
                {locations.map((l, i) => (
                    <motion.div key={l.id} className={styles.card}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
                        <span className={styles.iconChip}><MapPin size={17} /></span>
                        <div className={styles.cardBody}>
                            <h3>{l.name}</h3>
                            <span className={styles.cat}>{l.category}</span>
                        </div>
                        <div className={styles.cardSide}>
                            <span className={styles.wo}>{counts.get(l.name) ?? 0} WO</span>
                            <button className={styles.del} onClick={() => setConfirmId(l.id)} aria-label={`Hapus lokasi ${l.name}`}><Trash2 size={14} /></button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal open={open} onClose={() => setOpen(false)} title="Tambah Lokasi Baru">
                <form onSubmit={submit} className={styles.modalForm}>
                    <Input label="Nama Lokasi" required value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Baby Zoo" />
                    <Select label="Kategori" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Pilih kategori" options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
                    <div className={styles.modalActions}>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>BATAL</Button>
                        <Button type="submit" variant="primary" loading={busy}>SIMPAN</Button>
                    </div>
                </form>
            </Modal>

            <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Hapus Lokasi">
                <div className={styles.confirmBody}>
                    <p>Lokasi akan dihapus dari master data. Work order lama tetap menyimpan nama lokasinya.</p>
                    <div className={styles.modalActions}>
                        <Button variant="ghost" onClick={() => setConfirmId(null)}>BATAL</Button>
                        <Button variant="danger" loading={busy}
                            onClick={async () => { if (confirmId) { await remove(confirmId); push("success", "Lokasi dihapus."); setConfirmId(null); } }}>
                            HAPUS
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
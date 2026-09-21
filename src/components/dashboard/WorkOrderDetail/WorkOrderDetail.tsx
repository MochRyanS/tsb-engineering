import react from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft, User, Building2, MapPin, Phone, CalendarDays, Wrench, Tag, Camera, Trash2, Upload, Package,
} from "lucide-react";
import { useWorkOrders } from "../../../hooks/useWorkOrders";
import { useTechnicians } from "../../../hooks/useTechnicians";
import { useToast } from "../../../components/ui/Toast/Toast";
import StatusBadge from "../../../components/ui/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge/PriorityBadge";
import StatusTimeline from "../../../components/Timeline/StatusTimeline";
import Button from "../../../components/ui/Button/Button";
import Modal from "../../../components/ui/Modal/Modal";
import Empty from "../../../components/ui/Empty/Empty";
import { formatDate, formatDateTime, readFileAsDataURL } from "../../../utils/format";
import styles from "./WorkOrderDetail.module.css";

export default function WorkOrderDetail() {
    const { id } = useParams<{ id: string }>();
    const { workOrders, updateStatus, assign, updatePhoto, loading } = useWorkOrders();
    const { technicians } = useTechnicians();
    const { push } = useToast();
    const [busy, setBusy] = react.useState(false);
    const [assignOpen, setAssignOpen] = react.useState(false);
    const [assignPic, setAssignPic] = react.useState("");
    const [cancelOpen, setCancelOpen] = react.useState(false);

    const wo = react.useMemo(() => workOrders.find((w) => w.id === id), [workOrders, id]);

    const act = async (fn: () => Promise<void>, message: string) => {
        setBusy(true);
        try { await fn(); push("success", message); }
        catch { push("error", "Aksi gagal. Coba lagi."); }
        finally { setBusy(false); }
    };

    if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />;
    if (!wo) {
        return (
            <div className={styles.emptyWrap}>
                <Empty icon={Wrench} title="Work order tidak ditemukan" desc="Data mungkin telah dihapus atau nomor tidak valid.">
                    <Button variant="outline" to="/dashboard/work-orders" icon={ArrowLeft}>KEMBALI KE DAFTAR</Button>
                </Empty>
            </div>
        );
    }

    const canAssign = ["New", "Verified"].includes(wo.status);
    const canStart = wo.status === "Assigned";
    const canResume = wo.status === "Waiting Material";
    const canQuality = ["In Progress", "Waiting Material"].includes(wo.status);
    const canComplete = wo.status === "Quality Check";
    const canCancel = !["Completed", "Cancelled"].includes(wo.status);

    const uploadPhoto = async (field: "photo" | "photoAfter") => {
        // dipicu lewat input file tersembunyi
        const input = document.createElement("input");
        input.type = "file"; input.accept = "image/*";
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) { push("error", "Ukuran foto maksimal 2MB."); return; }
            const dataUrl = await readFileAsDataURL(file);
            await updatePhoto(wo.id, field, dataUrl);
            push("success", field === "photo" ? "Foto sebelum diperbarui." : "Foto setelah diperbarui.");
        };
        input.click();
    };

    return (
        <motion.div className={styles.page} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Link to="/dashboard/work-orders" className={styles.back}><ArrowLeft size={15} />Kembali ke Work Orders</Link>

            <header className={styles.head}>
                <div>
                    <span className={styles.woNumber}>{wo.woNumber}</span>
                    <h1>{wo.title}</h1>
                </div>
                <div className={styles.headBadges}>
                    <StatusBadge status={wo.status} />
                    <PriorityBadge priority={wo.priority} />
                </div>
            </header>

            <div className={styles.grid}>
                <div className={styles.main}>
                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>INFORMASI PERMINTAAN</h3>
                        <p className={styles.desc}>{wo.description}</p>
                        <dl className={styles.metaGrid}>
                            <div><dt><User size={13} />Requester</dt><dd>{wo.requesterName}</dd></div>
                            <div><dt><Phone size={13} />Kontak</dt><dd>{wo.contactNumber}</dd></div>
                            <div><dt><Building2 size={13} />Departemen</dt><dd>{wo.department}</dd></div>
                            <div><dt><MapPin size={13} />Lokasi</dt><dd>{wo.location}</dd></div>
                        </dl>
                    </section>

                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>DOKUMENTASI FOTO</h3>
                        <div className={styles.photos}>
                            <figure className={styles.photoSlot}>
                                {wo.photo ? <img src={wo.photo} alt="Foto kondisi sebelum dikerjakan" /> : <span className={styles.photoEmpty}><Camera size={20} />Foto sebelum belum ada</span>}
                                <figcaption>
                                    BEFORE
                                    {canCancel && <button className={styles.photoUp} onClick={() => void uploadPhoto("photo")} aria-label="Unggah foto sebelum"><Upload size={12} /></button>}
                                </figcaption>
                            </figure>
                            <figure className={styles.photoSlot}>
                                {wo.photoAfter ? <img src={wo.photoAfter} alt="Foto kondisi setelah dikerjakan" /> : <span className={styles.photoEmpty}><Camera size={20} />Foto setelah belum ada</span>}
                                <figcaption>
                                    AFTER
                                    {canCancel && <button className={styles.photoUp} onClick={() => void uploadPhoto("photoAfter")} aria-label="Unggah foto setelah"><Upload size={12} /></button>}
                                </figcaption>
                            </figure>
                        </div>
                    </section>

                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>STATUS TIMELINE</h3>
                        <StatusTimeline wo={wo} />
                    </section>

                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>ACTIVITY TIMELINE</h3>
                        <ul className={styles.activity}>
                            {wo.activity.map((a) => (
                                <li key={a.id}>
                                    <span className={styles.actDot} />
                                    <div>
                                        <strong>{a.action}</strong>

                                        {a.note && (
                                            <span className={styles.actNote}>
                                                {a.note}
                                            </span>
                                        )}

                                        <span className={styles.actMeta}>
                                            {formatDateTime(a.date)} — oleh {a.by}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {wo.notes.length > 0 && (
                            <div className={styles.notes}>
                                <h4>CATATAN TEKNISI</h4>
                                {wo.notes.map((n: string | number | boolean | react.ReactElement<any, string | react.JSXElementConstructor<any>> | Iterable<react.ReactNode> | react.ReactPortal | null | undefined, i: react.Key | null | undefined) => <p key={i}>“{n}”</p>)}
                            </div>
                        )}
                    </section>

                    {wo.materials.length > 0 && (
                        <section className={styles.card}>
                            <h3 className={styles.cardTitle}>MATERIAL DIGUNAKAN</h3>
                            <ul className={styles.materials}>
                                {wo.materials.map((m: { name: string | number | boolean | react.ReactElement<any, string | react.JSXElementConstructor<any>> | Iterable<react.ReactNode> | react.ReactPortal | null | undefined; qty: string | number | boolean | react.ReactElement<any, string | react.JSXElementConstructor<any>> | Iterable<react.ReactNode> | react.ReactPortal | null | undefined; unit: string | number | boolean | react.ReactElement<any, string | react.JSXElementConstructor<any>> | Iterable<react.ReactNode> | react.ReactPortal | null | undefined; }, i: react.Key | null | undefined) => (
                                    <li key={i}><Package size={14} />{m.name} <strong>{m.qty} {m.unit}</strong></li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className={styles.aside}>
                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>DETAIL</h3>
                        <dl className={styles.asideList}>
                            <div><dt><Wrench size={13} />Divisi</dt><dd>{wo.division}</dd></div>
                            <div><dt><Tag size={13} />Kategori</dt><dd>{wo.category}</dd></div>
                            <div><dt><User size={13} />PIC / Teknisi</dt><dd>{wo.pic ?? "—"}</dd></div>
                            <div><dt><CalendarDays size={13} />Dibuat</dt><dd>{formatDate(wo.createdAt)}</dd></div>
                            <div><dt><CalendarDays size={13} />Dikerjakan</dt><dd>{formatDate(wo.startedAt)}</dd></div>
                            <div><dt><CalendarDays size={13} />Selesai</dt><dd>{formatDate(wo.completedAt)}</dd></div>
                        </dl>
                    </section>

                    <section className={[styles.card, styles.actionCard].join(" ")}>
                        <h3 className={styles.cardTitle}>AKSI WORKFLOW</h3>
                        <div className={styles.actions}>
                            {canAssign && <Button variant="dark" loading={busy} onClick={() => setAssignOpen(true)}>ASSIGN</Button>}
                            {canStart && <Button variant="primary" loading={busy} onClick={() => act(() => updateStatus(wo.id, "In Progress"), "Pekerjaan dimulai.")}>START WORK</Button>}
                            {canResume && <Button variant="primary" loading={busy} onClick={() => act(() => updateStatus(wo.id, "In Progress"), "Pekerjaan dilanjutkan kembali.")}>RESUME WORK</Button>}
                            {canResume && <Button variant="outline" loading={busy} onClick={() => act(() => updateStatus(wo.id, "Waiting Material", "Material sedang diurus"), "Status: menunggu material.")}>WAITING MATERIAL</Button>}
                            {canQuality && <Button variant="outline" loading={busy} onClick={() => act(() => updateStatus(wo.id, "Quality Check"), "Pekerjaan masuk quality check.")}>QUALITY CHECK</Button>}
                            {canComplete && <Button variant="primary" loading={busy} onClick={() => act(() => updateStatus(wo.id, "Completed"), "Work order selesai.")}>COMPLETE</Button>}
                            {canCancel && <Button variant="danger" loading={busy} onClick={() => setCancelOpen(true)}>CANCEL</Button>}
                            {["Completed", "Cancelled"].includes(wo.status) && <p className={styles.terminalNote}>Work order ini telah berakhir dan tidak dapat diubah.</p>}
                        </div>
                    </section>
                </aside>
            </div>

            <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Teknisi">
                <div className={styles.modalBody}>
                    <p className={styles.modalHint}>Pilih teknisi untuk {wo.woNumber} — divisi {wo.division}.</p>
                    <div className={styles.techList}>
                        {technicians.map((t) => 
                            <button
                                key={t.id}
                                className={[
                                    styles.techOpt,
                                    assignPic === t.name ? styles.techSel : "",
                                    t.division !== wo.division ? styles.techDim : ""
                                ].join(" ")}
                                onClick={() => setAssignPic(t.name)}
                            >
                                <span className={styles.techAvatar}>
                                    {t.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                                </span>
                                <span>
                                    <strong>{t.name}</strong>
                                    <small>{t.division} · {t.activeTasks} tugas aktif · {t.status}</small>
                                </span>
                            </button>
                        )}
                    </div>
                    <div className={styles.modalActions}>
                        <Button variant="ghost" onClick={() => setAssignOpen(false)}>BATAL</Button>
                        <Button variant="primary" loading={busy} disabled={!assignPic}
                            onClick={() => { void act(async () => { await assign(wo.id, assignPic); setAssignOpen(false); }, `Ditugaskan ke ${assignPic}.`); }}>
                            TUGASKAN
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Batalkan Work Order">
                <div className={styles.modalBody}>
                    <p className={styles.modalHint}>Batalkan <strong>{wo.woNumber}</strong>? Tindakan ini mengakhiri proses work order.</p>
                    <div className={styles.modalActions}>
                        <Button variant="ghost" onClick={() => setCancelOpen(false)}>TIDAK</Button>
                        <Button variant="danger" loading={busy} icon={Trash2}
                            onClick={() => { void act(async () => { await updateStatus(wo.id, "Cancelled", "Dibatalkan oleh admin"); setCancelOpen(false); }, "Work order dibatalkan."); }}>
                            YA, BATALKAN
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
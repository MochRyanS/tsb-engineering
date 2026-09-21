import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, CheckCircle2 } from "lucide-react";
import type { Category, JenisPekerjaan, Priority } from "../../types";
import {
    CATEGORIES, DEPARTMENTS, JENIS_PEKERJAAN, PRIORITIES,
    PRIORITY_HINT, TEMUAN_DIVISION,
} from "../../utils/constants";
import { useWorkOrders } from "../../hooks/useWorkOrders";
import { useToast } from "../ui/Toast/Toast";
import { compressImage } from "../../utils/image";
import Button from "../ui/Button/Button";
import Modal from "../ui/Modal/Modal";
import styles from "./WorkOrderForm.module.css";

interface FormState {
    nama: string; wa: string; departemen: string; lokasi: string;
    temuan: Category | ""; judul: string; tanggal: string;
    jenisPekerjaan: JenisPekerjaan | ""; priority: Priority | "";
}
const INITIAL: FormState = {
    nama: "", wa: "", departemen: "", lokasi: "",
    temuan: "", judul: "", tanggal: "", jenisPekerjaan: "", priority: "",
};
type Errors = Partial<Record<keyof FormState, string>>;

export default function WorkOrderForm() {
    const [form, setForm] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<Errors>({});
    const [photos, setPhotos] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [successNumber, setSuccessNumber] = useState<string | null>(null);
    const { create } = useWorkOrders();
    const { push } = useToast();

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const validate = (): Errors => {
        const e: Errors = {};
        if (!form.nama.trim()) e.nama = "Nama pelapor wajib diisi.";
        if (!form.wa.trim()) e.wa = "Nomor WhatsApp wajib diisi.";
        if (!form.departemen) e.departemen = "Pilih departemen.";
        if (!form.lokasi.trim()) e.lokasi = "Lokasi/tempat wajib diisi.";
        if (!form.temuan) e.temuan = "Pilih jenis temuan.";
        if (!form.judul.trim()) e.judul = "Temuan/alat yang rusak wajib diisi.";
        if (!form.tanggal) e.tanggal = "Tanggal dilaporkan wajib diisi.";
        if (!form.jenisPekerjaan) e.jenisPekerjaan = "Pilih jenis pekerjaan.";
        if (!form.priority) e.priority = "Pilih tingkat prioritas.";
        return e;
    };

    const onPhotos = async (files: FileList | null) => {
        if (!files?.length) return;
        const slots = 5 - photos.length;
        if (slots <= 0) { push("error", "Maksimal 5 foto."); return; }
        const list = Array.from(files).slice(0, slots);
        const urls: string[] = [];
        for (const f of list) {
            if (!f.type.startsWith("image/")) { push("error", `${f.name} bukan berkas gambar.`); continue; }
            if (f.size > 10 * 1024 * 1024) { push("error", `${f.name} melebihi 10MB.`); continue; }
            urls.push(await compressImage(f));
        }
        if (urls.length) setPhotos((p) => [...p, ...urls].slice(0, 5));
    };

    const removePhoto = (index: number) => setPhotos((p) => p.filter((_, i) => i !== index));

    const submit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) { push("error", "Lengkapi isian yang bertanda *."); return; }
        if (photos.length === 0) { push("error", "Minimal 1 foto temuan wajib diunggah."); return; }
        setSubmitting(true);
        try {
            const cat = form.temuan as Category;
            const wo = await create({
                requesterName: form.nama.trim(),
                contactNumber: form.wa.trim(),
                department: form.departemen,
                location: form.lokasi.trim(),
                title: form.judul.trim(),
                category: cat,
                division: TEMUAN_DIVISION[cat],
                jenisPekerjaan: form.jenisPekerjaan as JenisPekerjaan,
                priority: form.priority as Priority,
                tanggalDilaporkan: new Date(form.tanggal).toISOString(),
                photos,
            });
            setSuccessNumber(wo.woNumber);
            push("success", "Terima kasih! Work order Anda telah kami terima.");
        } catch {
            push("error", "Gagal menyimpan work order. Coba lagi.");
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setSuccessNumber(null);
        setForm(INITIAL);
        setPhotos([]);
    };

    return (
        <>
            <form className={styles.formCard} onSubmit={submit} noValidate>
                <header className={styles.formHead}>
                    <h2>FORM WORK ORDER</h2>
                    <p>
                        Formulir ini bertujuan mengorganisir pekerjaan secara terstruktur dan efisien,
                        memastikan komunikasi yang jelas, serta menjamin setiap pekerjaan selesai sesuai rencana.
                    </p>
                </header>

                <div className={styles.note}>
                    <span className={styles.noteTitle}>NOTE — TINGKAT URGENSI</span>
                    <div className={styles.noteItem}><i className={`${styles.noteDot} ${styles.ndHigh}`} />
                        <span><strong>HIGH URGENCY</strong> — pekerjaan yang harus segera ditangani karena berkaitan dengan keselamatan.</span>
                    </div>
                    <div className={styles.noteItem}><i className={`${styles.noteDot} ${styles.ndMid}`} />
                        <span><strong>MID URGENCY</strong> — pekerjaan yang perlu segera ditangani, namun tidak darurat.</span>
                    </div>
                    <div className={styles.noteItem}><i className={`${styles.noteDot} ${styles.ndLow}`} />
                        <span><strong>LOW URGENCY</strong> — pekerjaan yang dapat ditunda atau memiliki dampak kecil.</span>
                    </div>
                </div>

                <div className={styles.questions}>
                    <div className={styles.question}>
                        <label className={styles.qLabel} htmlFor="f-nama">NAMA PELAPOR <span className={styles.req}>*</span></label>
                        <input id="f-nama" className={errors.nama ? styles.fInputError : styles.fInput}
                            value={form.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Nama lengkap pelapor" />
                        {errors.nama && <span className={styles.fError} role="alert">{errors.nama}</span>}
                    </div>

                    <div className={styles.question}>
                        <label className={styles.qLabel} htmlFor="f-wa">NOMOR WHATSAPP PELAPOR <span className={styles.req}>*</span></label>
                        <input id="f-wa" className={errors.wa ? styles.fInputError : styles.fInput} inputMode="tel"
                            value={form.wa} onChange={(e) => set("wa", e.target.value)} placeholder="cth. 0812-3456-7890" />
                        {errors.wa && <span className={styles.fError} role="alert">{errors.wa}</span>}
                    </div>

                    <fieldset className={styles.question}>
                        <legend className={styles.qLabel}>DEPARTEMENT <span className={styles.req}>*</span></legend>
                        <div className={styles.deptGrid} role="radiogroup" aria-label="Departemen">
                            {DEPARTMENTS.map((d) => (
                                <button type="button" key={d} role="radio" aria-checked={form.departemen === d}
                                    className={[styles.opt, form.departemen === d ? styles.optOn : ""].join(" ")}
                                    onClick={() => set("departemen", d)}>{d}</button>
                            ))}
                        </div>
                        {errors.departemen && <span className={styles.fError} role="alert">{errors.departemen}</span>}
                    </fieldset>

                    <div className={styles.question}>
                        <label className={styles.qLabel} htmlFor="f-lokasi">LOKASI / TEMPAT <span className={styles.req}>*</span></label>
                        <input id="f-lokasi" className={errors.lokasi ? styles.fInputError : styles.fInput}
                            value={form.lokasi} onChange={(e) => set("lokasi", e.target.value)} placeholder="cth. Toilet Selatan, area plaza wahana…" />
                        {errors.lokasi && <span className={styles.fError} role="alert">{errors.lokasi}</span>}
                    </div>

                    <fieldset className={styles.question}>
                        <legend className={styles.qLabel}>JENIS TEMUAN <span className={styles.req}>*</span></legend>
                        <div className={styles.chips} role="radiogroup" aria-label="Jenis temuan">
                            {CATEGORIES.map((c) => (
                                <button type="button" key={c} role="radio" aria-checked={form.temuan === c}
                                    className={[styles.opt, form.temuan === c ? styles.optOn : ""].join(" ")}
                                    onClick={() => set("temuan", c)}>{c}</button>
                            ))}
                        </div>
                        {form.temuan && (
                            <span className={styles.divHint}>Divisi penanganan otomatis: <strong>{TEMUAN_DIVISION[form.temuan as Category]}</strong></span>
                        )}
                        {errors.temuan && <span className={styles.fError} role="alert">{errors.temuan}</span>}
                    </fieldset>

                    <div className={styles.question}>
                        <label className={styles.qLabel} htmlFor="f-judul">TEMUAN / ALAT YANG RUSAK <span className={styles.req}>*</span></label>
                        <input id="f-judul" className={errors.judul ? styles.fInputError : styles.fInput}
                            value={form.judul} onChange={(e) => set("judul", e.target.value)} placeholder="cth. Lampu area WC mati total" />
                        {errors.judul && <span className={styles.fError} role="alert">{errors.judul}</span>}
                    </div>

                    <div className={styles.question}>
                        <label className={styles.qLabel} htmlFor="f-tanggal">TANGGAL DILAPORKAN <span className={styles.req}>*</span></label>
                        <input id="f-tanggal" type="date" className={errors.tanggal ? styles.fInputError : styles.fInput}
                            value={form.tanggal} onChange={(e) => set("tanggal", e.target.value)} />
                        {errors.tanggal && <span className={styles.fError} role="alert">{errors.tanggal}</span>}
                    </div>

                    <fieldset className={styles.question}>
                        <legend className={styles.qLabel}>JENIS PEKERJAAN <span className={styles.req}>*</span></legend>
                        <div className={styles.chips} role="radiogroup" aria-label="Jenis pekerjaan">
                            {JENIS_PEKERJAAN.map((j) => (
                                <button type="button" key={j} role="radio" aria-checked={form.jenisPekerjaan === j}
                                    className={[styles.opt, styles.optBig, form.jenisPekerjaan === j ? styles.optOn : ""].join(" ")}
                                    onClick={() => set("jenisPekerjaan", j)}>{j.toUpperCase()}</button>
                            ))}
                        </div>
                        {errors.jenisPekerjaan && <span className={styles.fError} role="alert">{errors.jenisPekerjaan}</span>}
                    </fieldset>

                    <fieldset className={styles.question}>
                        <legend className={styles.qLabel}>PRIORITY SCALE (URGENT) <span className={styles.req}>*</span></legend>
                        <div className={styles.chips} role="radiogroup" aria-label="Prioritas">
                            {PRIORITIES.map((p) => (
                                <button type="button" key={p} role="radio" aria-checked={form.priority === p}
                                    className={[styles.opt, styles.optBig, form.priority === p ? styles[`sel${p}`] : ""].join(" ")}
                                    onClick={() => set("priority", p)}>
                                    <span className={styles.pName}>{p.toUpperCase()}</span>
                                    <span className={styles.optHint}>{PRIORITY_HINT[p]}</span>
                                </button>
                            ))}
                        </div>
                        {errors.priority && <span className={styles.fError} role="alert">{errors.priority}</span>}
                    </fieldset>

                    <fieldset className={styles.question}>
                        <legend className={styles.qLabel}>FOTO TEMUAN / ALAT YANG RUSAK <span className={styles.req}>*</span></legend>
                        <span className={styles.qHint}>Unggah hingga 5 foto, masing-masing maksimal 10MB.</span>
                        {photos.length > 0 && (
                            <div className={styles.photoGrid}>
                                {photos.map((src, i) => (
                                    <div key={i} className={styles.photoItem}>
                                        <img src={src} alt={`Foto temuan ${i + 1}`} />
                                        <button type="button" className={styles.photoRemove} onClick={() => removePhoto(i)}
                                            aria-label={`Hapus foto ${i + 1}`}><X size={13} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {photos.length < 5 && (
                            <label className={styles.dropzone}>
                                <Upload size={18} />
                                <span className={styles.dropText}>Klik untuk menambah foto temuan</span>
                                <span className={styles.dropHint}>{photos.length}/5 foto terunggah</span>
                                <input type="file" accept="image/*" multiple hidden onChange={(e) => void onPhotos(e.target.files)} />
                            </label>
                        )}
                    </fieldset>
                </div>

                <div className={styles.submitWrap}>
                    <div className={styles.submitRow}>
                        <Button type="submit" variant="primary" size="lg" loading={submitting}>SUBMIT WORK ORDER</Button>
                    </div>
                </div>
            </form>

            <Modal open={!!successNumber} onClose={closeModal}>
                <div className={styles.success}>
                    <motion.span className={styles.successIcon} initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}>
                        <CheckCircle2 size={46} strokeWidth={1.6} />
                    </motion.span>
                    <h3>TERIMA KASIH!</h3>
                    <p className={styles.successMsg}>
                        Work order Anda telah berhasil dikirim dan akan segera ditinjau
                        oleh tim Engineering kami.
                    </p>
                    <div className={styles.successActions}>
                        <Button variant="primary" onClick={closeModal}>TUTUP</Button>
                    </div>
                </div>
            </Modal>      <Modal open={!!successNumber} onClose={closeModal}>
                <div className={styles.success}>
                    <motion.span className={styles.successIcon} initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}>
                        <CheckCircle2 size={46} strokeWidth={1.6} />
                    </motion.span>
                    <h3>TERIMA KASIH!</h3>
                    <p className={styles.successMsg}>
                        Work order Anda telah berhasil dikirim dan akan segera ditinjau
                        oleh tim Engineering kami.
                    </p>
                    <div className={styles.successActions}>
                        <Button variant="primary" onClick={closeModal}>TUTUP</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
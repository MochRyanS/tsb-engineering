import { useState } from "react";
import { Save, LogOut } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../components/ui/Toast/Toast";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Switch from "../../../components/ui/Switch/Switch";
import styles from "./Settings.module.css";

interface Prefs { notifNew: boolean; dailyDigest: boolean; emailAlert: boolean; }
const PREF_KEY = "tsb_settings";
const DEFAULT_PREFS: Prefs = { notifNew: true, dailyDigest: false, emailAlert: true };

function loadPrefs(): Prefs {
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}") }; } catch { return DEFAULT_PREFS; }
}

export default function Settings() {
    const { user, logout } = useAuth();
    const { push } = useToast();
    const [displayName, setDisplayName] = useState(user?.name ?? "");
    const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        setTimeout(() => {
            localStorage.setItem(PREF_KEY, JSON.stringify({ ...prefs, displayName }));
            push("success", "Pengaturan tersimpan.");
            setSaving(false);
        }, 400);
    };

    const TOGGLES: Array<[keyof Prefs, string, string]> = [
        ["notifNew", "Notifikasi work order baru", "Tampilkan pemberitahuan saat ada permintaan masuk."],
        ["dailyDigest", "Ringkasan harian", "Kirim ringkasan status WO setiap akhir shift."],
        ["emailAlert", "Email untuk WO urgent", "Kirim email saat ada WO berprioritas urgent."],
    ];

    return (
        <div className={styles.page}>
            <section className={styles.card}>
                <h3 className={styles.title}>PROFIL</h3>
                <div className={styles.profile}>
                    <span className={styles.avatar}>{user?.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}</span>
                    <div className={styles.profileMeta}>
                        <strong>{user?.name}</strong>
                        <span>{user?.role}{user?.division ? ` · ${user.division}` : ""} · @{user?.username}</span>
                    </div>
                </div>
                <div className={styles.nameForm}>
                    <Input label="Nama Tampilan" value={displayName} onChange={(e: { target: { value: any; }; }) => setDisplayName(e.target.value)} />
                    <span className={styles.hint}>Disimpan lokal untuk prototype ini; di produksi tersimpan di profil backend.</span>
                </div>
            </section>

            <section className={styles.card}>
                <h3 className={styles.title}>NOTIFICATION PREFERENCES</h3>
                <ul className={styles.prefs}>
                    {TOGGLES.map(([key, label, desc]) => (
                        <li key={key}>
                            <div>
                                <strong>{label}</strong>
                                <span>{desc}</span>
                            </div>
                            <Switch checked={prefs[key]} label={label} onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
                        </li>
                    ))}
                </ul>
            </section>

            <div className={styles.actions}>
                <Button variant="primary" icon={Save} loading={saving} onClick={save}>SIMPAN PENGATURAN</Button>
            </div>

            <section className={[styles.card, styles.sessionCard].join(" ")}>
                <h3 className={styles.title}>SESI AKTIF</h3>
                <div className={styles.sessionRow}>
                    <span>Anda masuk sebagai <strong>{user?.username}</strong>. Keluar dari dashboard pada perangkat ini.</span>
                    <Button variant="danger" icon={LogOut} onClick={logout}>KELUAR</Button>
                </div>
                <p className={styles.version}>ENGINEERING WO SYSTEM v1.0 — PROTOTYPE</p>
            </section>
        </div>
    );
}
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HardHat, LogIn, KeyRound } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast/Toast";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import { IMAGES } from "../../data/images";
import styles from "./Login.module.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { push } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, password, remember);
            push("success", "Selamat datang kembali.");
            navigate(from, { replace: true });
        } catch (err) {
            push("error", err instanceof Error ? err.message : "Gagal masuk.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.visual}>
                <img src={IMAGES.login} alt="" aria-hidden="true" />
                <div className={styles.visualOverlay} />
                <div className={styles.visualContent}>
                    <span className={styles.mark}><HardHat size={22} /></span>
                    <div>
                        <strong>ENGINEERING</strong>
                        <small>TAMAN SAFARI BOGOR</small>
                    </div>
                    <p className={styles.quote}>“Keeping Every Experience Safe, Comfortable & Running.”</p>
                </div>
            </div>

            <div className={styles.formSide}>
                <motion.div className={styles.formCard} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                    <span className={styles.eyebrow}>PORTAL INTERNAL</span>
                    <h1>Masuk ke Sistem<br />Work Order</h1>
                    <p className={styles.sub}>Gunakan akun internal engineering untuk mengelola permintaan maintenance.</p>

                    <form onSubmit={submit} className={styles.form}>
                        <Input label="Username" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" autoCapitalize="none" />
                        <Input label="Password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        <div className={styles.row}>
                            <label className={styles.remember}>
                                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                Remember me
                            </label>
                            <button type="button" className={styles.forgot}
                                onClick={() => push("info", "Silakan hubungi Engineering Office (Ext. 350) untuk reset password.")}>
                                Forgot password?
                            </button>
                        </div>
                        <Button type="submit" variant="primary" size="lg" loading={loading} icon={LogIn}>LOGIN</Button>
                    </form>

                    <div className={styles.demo}>
                        <div className={styles.demoHead}><KeyRound size={13} />AKUN DEMO — KLIK UNTUK MENGISI OTOMATIS</div>
                        <div className={styles.demoGrid}>
                            <button type="button" className={styles.demoCard} onClick={() => { setUsername("admin"); setPassword("admin123"); }}>
                                <strong>Admin</strong><span>admin / admin123</span>
                            </button>
                            <button type="button" className={styles.demoCard} onClick={() => { setUsername("technician"); setPassword("tech123"); }}>
                                <strong>Technician</strong><span>technician / tech123</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
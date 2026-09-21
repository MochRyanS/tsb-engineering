import { useEffect, useState } from "react";
import { Users as UsersIcon } from "lucide-react";
import { authService } from "../../../services/authService";
import type { AppUser } from "../../../types";
import { formatDateTime } from "../../../utils/format";
import styles from "./Users.module.css";

export default function Users() {
    const [users, setUsers] = useState<AppUser[]>([]);

    useEffect(() => {
        // authService.listUsers() adalah synchronous
        const data = authService.listUsers();
        setUsers(data);
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Nama</th>
                            <th>Role</th>
                            <th>Divisi</th>
                            <th>Email</th>
                            <th>Login Terakhir</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className={styles.mono}>{u.username}</td>
                                <td className={styles.strong}>{u.name}</td>
                                <td>
                                    <span className={u.role === "Admin" ? styles.rAdmin : u.role === "Supervisor" ? styles.rSup : styles.rTech}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>{u.division ?? "—"}</td>
                                <td>{u.email}</td>
                                <td>{formatDateTime(u.lastLogin)}</td>
                                <td><span className={styles.active}>Active</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.cards}>
                {users.map((u) => (
                    <div key={u.id} className={styles.card}>
                        <strong>{u.name}</strong>
                        <span>{u.username} · {u.role}{u.division ? ` · ${u.division}` : ""}</span>
                    </div>
                ))}
            </div>

            <p className={styles.note}>
                <UsersIcon size={13} /> Manajemen user penuh (tambah/nonaktifkan/reset password) dikelola melalui authService saat terhubung backend.
            </p>
        </div>
    );
}
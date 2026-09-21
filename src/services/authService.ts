import type { AppUser, AuthUser } from "../types";
import { mockUsers } from "../data/mockUsers";

const SESSION_KEY = "tsb_auth_session";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Nantinya tinggal diganti implementasi HTTP (axios) ke backend — kontrak fungsi tetap.
export const authService = {
    async login(username: string, password: string, remember: boolean): Promise<AuthUser> {
        await delay(700);
        const found = mockUsers.find((u) => u.username === username && u.password === password);
        if (!found) throw new Error("Username atau password salah.");
        const { password: _pw, ...session } = found;
        const store = remember ? localStorage : sessionStorage;
        store.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    },
    logout(): void {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
    },
    getSession(): AuthUser | null {
        const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw) as AuthUser; } catch { return null; }
    },
    listUsers(): AppUser[] {
        return mockUsers.map((u) => ({ ...u, lastLogin: u.lastLogin }));
    },
};
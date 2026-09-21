import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types";
import { authService } from "../services/authService";

interface AuthContextValue {
    user: AuthUser | null;
    login: (username: string, password: string, remember: boolean) => Promise<void>;
    logout: () => void;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => authService.getSession());
    const login = useCallback(async (username: string, password: string, remember: boolean) => {
        const session = await authService.login(username, password, remember);
        setUser(session);
    }, []);
    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);
    const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
    return ctx;
}
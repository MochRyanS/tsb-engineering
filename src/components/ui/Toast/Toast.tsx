import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import styles from "./Toast.module.css";

type ToastType = "success" | "error" | "info";
interface ToastItem { id: number; type: ToastType; message: string; }
interface ToastContextValue { push: (type: ToastType, message: string) => void; }
const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const idRef = useRef(0);
    const push = useCallback((type: ToastType, message: string) => {
        const id = ++idRef.current;
        setToasts((prev: any) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev: any[]) => prev.filter((t: { id: number; }) => t.id !== id)), 4200);
    }, []);

    return React.createElement(
        ToastContext.Provider,
        { value: { push } },
        children,
        React.createElement(
            "div",
            { className: styles.stack, "aria-live": "polite" },
            React.createElement(
                AnimatePresence,
                null,
                toasts.map((t: { type: ToastType; id: number; message: string }) => {
                    const Icon = ICONS[t.type];
                    return React.createElement(
                        motion.div,
                        {
                            key: t.id,
                            className: [styles.toast, styles[t.type]].join(" "),
                            initial: { opacity: 0, x: 40, scale: 0.96 },
                            animate: { opacity: 1, x: 0, scale: 1 },
                            exit: { opacity: 0, x: 40, scale: 0.96 },
                            transition: { duration: 0.25 }
                        },
                        React.createElement(Icon, { size: 17 }),
                        React.createElement("span", null, t.message)
                    );
                })
            )
        )
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
    return ctx;
}
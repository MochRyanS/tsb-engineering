import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
};
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};
export const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
export const viewportOnce = { once: true, margin: "-60px" } as const;
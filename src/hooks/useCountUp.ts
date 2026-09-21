import { useEffect, useState } from "react";
import { animate, useInView } from "framer-motion";
import type { RefObject } from "react";

export function useCountUp(target: number, ref: RefObject<HTMLElement>, duration = 1600): number {
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, target, { duration, ease: "easeOut", onUpdate: (v: number) => setValue(Math.round(v)) });
        return () => controls.stop();
    }, [inView, target, duration]);
    return value;
}
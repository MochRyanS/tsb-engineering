import { useEffect, useState } from "react";

export function useScrollY(threshold: number): boolean {
    const [passed, setPassed] = useState(false);
    useEffect(() => {
        const onScroll = () => setPassed(window.scrollY > threshold);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);
    return passed;
}
import { useEffect, useState } from "react";
import type { Technician } from "../types";
import { technicianService } from "../services/technicianService";

export function useTechnicians() {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        technicianService.getAll().then((list) => { setTechnicians(list); setLoading(false); });
    }, []);
    return { technicians, loading };
}
import { useCallback, useEffect, useState } from "react";
import type { Material } from "../types";
import { materialService } from "../services/materialService";

export function useMaterials() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async () => {
        setMaterials(await materialService.getAll());
        setLoading(false);
    }, []);
    useEffect(() => { void refresh(); }, [refresh]);
    const adjust = useCallback(async (id: string, delta: number) => {
        setMaterials(await materialService.adjustStock(id, delta));
    }, []);
    return { materials, loading, adjust, refresh };
}
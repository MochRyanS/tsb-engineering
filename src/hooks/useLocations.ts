import { useCallback, useEffect, useState } from "react";
import type { FacilityLocation } from "../types";
import { locationService } from "../services/locationService";

export function useLocations() {
    const [locations, setLocations] = useState<FacilityLocation[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        locationService.getAll().then((list) => { setLocations(list); setLoading(false); });
    }, []);
    const add = useCallback(async (name: string, category: string) => {
        setLocations(await locationService.add(name, category));
    }, []);
    const remove = useCallback(async (id: string) => {
        setLocations(await locationService.remove(id));
    }, []);
    return { locations, loading, add, remove };
}
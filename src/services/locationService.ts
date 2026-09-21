import type { FacilityLocation } from "../types";
import { mockLocations } from "../data/mockLocations";

const KEY = "tsb_locations_v1";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function load(): FacilityLocation[] {
    const raw = localStorage.getItem(KEY);
    if (raw) { try { return JSON.parse(raw) as FacilityLocation[]; } catch { /* reseed */ } }
    localStorage.setItem(KEY, JSON.stringify(mockLocations));
    return mockLocations;
}

export const locationService = {
    async getAll(): Promise<FacilityLocation[]> { await delay(200); return load(); },
    async add(name: string, category: string): Promise<FacilityLocation[]> {
        await delay(200);
        const list = load();
        if (list.some((l) => l.name.toLowerCase() === name.toLowerCase())) throw new Error("Lokasi sudah terdaftar.");
        const next = [...list, { id: `loc-${Date.now()}`, name, category, custom: true }];
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
    },
    async remove(id: string): Promise<FacilityLocation[]> {
        await delay(200);
        const next = load().filter((l) => l.id !== id);
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
    },
};
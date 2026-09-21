import type { Technician } from "../types";
import { mockTechnicians } from "../data/mockTechnicians";

export const technicianService = {
    async getAll(): Promise<Technician[]> {
        await new Promise((r) => setTimeout(r, 300));
        return mockTechnicians;
    },
};
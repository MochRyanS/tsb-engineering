import type { WorkOrder, WorkOrderStatus } from "../types";

export const STATUS_STEPS = ["Submitted", "Verified", "Assigned", "Technician Started", "Quality Check", "Completed"];

export function stepIndexFor(status: WorkOrderStatus): number {
    switch (status) {
        case "New": return 0;
        case "Verified": return 1;
        case "Assigned": return 2;
        case "In Progress": return 3;
        case "Waiting Material": return 3;
        case "Quality Check": return 4;
        case "Completed": return 5;
        default: return -1;
    }
}

export function generateWoNumber(existing: WorkOrder[]): string {
    const year = new Date().getFullYear();
    const count = existing.filter((w) => w.woNumber.includes(`-${year}-`)).length + 1;
    return `WO-${year}-${String(count).padStart(5, "0")}`;
}
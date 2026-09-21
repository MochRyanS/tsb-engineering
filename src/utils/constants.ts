import type { Category, Division, JenisPekerjaan, Priority, WorkOrderStatus } from "../types";

export const DIVISIONS: Division[] = ["Electrical", "Mechanical", "Civil", "Plumbing"];
export const PRIORITIES: Priority[] = ["Low", "Mid", "High"];
export const STATUSES: WorkOrderStatus[] = [
    "New", "Verified", "Assigned", "In Progress", "Waiting Material", "Quality Check", "Completed", "Cancelled",
];
export const CATEGORIES: Category[] = ["Equipment Restoran", "Plumbing", "Elektrikal", "Mekanikal", "General", "Civil"];
export const JENIS_PEKERJAAN: JenisPekerjaan[] = ["Project", "Maintenance"];

export const DEPARTMENTS = [
    "F&B", "ENTERTAINMENT", "OPERATOR WAHANA", "TRANSPORTASI", "LIFE SCIENCE",
    "RUMAH 2 PENANGKARAN", "BABY ZOO", "TAMAN BURUNG", "PRIMATA", "ISTANA PANDA",
    "EDUKASI", "CLEANING", "SAFARI WONDER",
];

export const STATUS_COLORS: Record<WorkOrderStatus, string> = {
    New: "#2E75B6",
    Verified: "#6FA3DC",
    Assigned: "#A9C4E4",
    "In Progress": "#16457E",
    "Waiting Material": "#D99A28",
    "Quality Check": "#6B756F",
    Completed: "#2E8B57",
    Cancelled: "#C94A4A",
};
export const PRIORITY_COLORS: Record<Priority, string> = { Low: "#6B756F", Mid: "#D99A28", High: "#C94A4A" };
export const DIVISION_COLORS: Record<Division, string> = {
    Electrical: "#4C9BE8",
    Mechanical: "#14355E",
    Civil: "#2E86C1",
    Plumbing: "#8FB2DA",
};

export const PRIORITY_HINT: Record<Priority, string> = {
    High: "Harus segera ditangani — berkaitan dengan keselamatan",
    Mid: "Perlu segera ditangani, namun tidak darurat",
    Low: "Dapat ditunda / dampak kecil",
};

export const TEMUAN_DIVISION: Record<Category, Division> = {
    "Equipment Restoran": "Mechanical",
    Plumbing: "Plumbing",
    Elektrikal: "Electrical",
    Mekanikal: "Mechanical",
    General: "Civil",
    Civil: "Civil",
};
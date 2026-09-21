import type { Technician } from "../types";

export const mockTechnicians: Technician[] = [
    { id: "t1", name: "Budi Santoso", division: "Electrical", role: "Teknisi Senior", activeTasks: 1, completedTasks: 42, performance: 92, status: "Available" },
    { id: "t2", name: "Joko Prasetyo", division: "Mechanical", role: "Teknisi Senior", activeTasks: 1, completedTasks: 38, performance: 88, status: "On Duty" },
    { id: "t3", name: "Asep Kurnia", division: "Civil", role: "Mandor", activeTasks: 1, completedTasks: 27, performance: 84, status: "Available" },
    { id: "t4", name: "Dedi Rustandi", division: "Plumbing", role: "Teknisi", activeTasks: 1, completedTasks: 31, performance: 90, status: "Available" },
    { id: "t5", name: "Eko Saputra", division: "Mechanical", role: "Teknisi", activeTasks: 1, completedTasks: 19, performance: 81, status: "On Duty" },
    { id: "t6", name: "Rina Marlina", division: "Electrical", role: "Teknisi", activeTasks: 0, completedTasks: 24, performance: 89, status: "Available" },
    { id: "t7", name: "Yusuf Hamdani", division: "Civil", role: "Teknisi", activeTasks: 0, completedTasks: 22, performance: 86, status: "Off Duty" },
    { id: "t8", name: "Putra Gani", division: "Plumbing", role: "Teknisi Junior", activeTasks: 0, completedTasks: 12, performance: 78, status: "Available" },
    { id: "t9", name: "Hendra Saputra", division: "Electrical", role: "Teknisi Junior", activeTasks: 0, completedTasks: 15, performance: 80, status: "On Duty" },
    { id: "t10", name: "Wawan Setiawan", division: "Mechanical", role: "Kepala Teknisi", activeTasks: 1, completedTasks: 45, performance: 94, status: "Available" },
];
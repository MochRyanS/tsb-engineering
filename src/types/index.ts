export type Division = "Electrical" | "Mechanical" | "Civil" | "Plumbing";
export type Priority = "Low" | "Mid" | "High";
export type WorkOrderStatus =
    | "New" | "Verified" | "Assigned" | "In Progress"
    | "Waiting Material" | "Quality Check" | "Completed" | "Cancelled";
export type Category = "Equipment Restoran" | "Plumbing" | "Elektrikal" | "Mekanikal" | "General" | "Civil";
export type JenisPekerjaan = "Project" | "Maintenance";
export type Role = "Admin" | "Supervisor" | "Technician";
export type DivisionStatus = "Available" | "Busy" | "Emergency Response";

export interface ActivityLog { id: string; date: string; action: string; by: string; note?: string; }
export interface MaterialUsed { name: string; qty: number; unit: string; }

export interface WorkOrder {
    id: string;
    woNumber: string;
    requesterName: string;
    department: string;
    contactNumber: string;
    location: string;
    title: string;
    category: Category;
    division: Division;
    jenisPekerjaan: JenisPekerjaan;
    description: string;
    priority: Priority;
    status: WorkOrderStatus;
    createdAt: string;
    tanggalDilaporkan: string;
    photos: string[];
    pic?: string;
    startedAt?: string;
    completedAt?: string;
    photo?: string;
    photoAfter?: string;
    activity: ActivityLog[];
    notes: string[];
    materials: MaterialUsed[];
}

export interface CreateWorkOrderInput {
    requesterName: string;
    contactNumber: string;
    department: string;
    location: string;
    title: string;
    category: Category;
    division: Division;
    jenisPekerjaan: JenisPekerjaan;
    priority: Priority;
    tanggalDilaporkan: string;
    photos: string[];
    description?: string;
}

export interface Technician {
    id: string; name: string; division: Division; role: string;
    activeTasks: number; completedTasks: number; performance: number;
    status: "Available" | "On Duty" | "Off Duty";
}

export interface Material { id: string; name: string; stock: number; unit: string; minStock: number; }
export interface FacilityLocation { id: string; name: string; category: string; custom?: boolean; }

export interface AuthUser { id: string; username: string; name: string; role: Role; division: Division | null; email: string; }
export interface AppUser extends AuthUser { password: string; lastLogin: string; }
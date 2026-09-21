import type { AppUser } from "../types";

export const mockUsers: AppUser[] = [
    {
        id: "u1",
        username: "Admin_engineering",
        password: "admin.TSI1",
        name: "Admin Engineering",
        role: "Admin",
        division: null,
        email: "admin_enggineering@tamansafari.co.id",
        lastLogin: "2026-01-14T08:02:00",
    },
    {
        id: "u2",
        username: "USERNAME_TEKNISI_ANDA",
        password: "PASSWORD_TEKNISI_ANDA",
        name: "Budi Santoso",
        role: "Technician",
        division: "Electrical",
        email: "budi.santoso@tamansafari.co.id",
        lastLogin: "2026-01-14T07:15:00",
    },
    {
        id: "u3",
        username: "supervisor",
        password: "super123",
        name: "Sri Wahyuni",
        role: "Supervisor",
        division: null,
        email: "sri.wahyuni@tamansafari.co.id",
        lastLogin: "2026-01-13T16:40:00",
    },
];
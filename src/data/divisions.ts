import type { Division, DivisionStatus } from "../types";

export interface DivisionInfo {
    liveStatusKey: any;
    id: Division; tagline: string; description: string; scope: string[]; head: string; headcount: number;
}

export const divisionInfos: DivisionInfo[] = [
    {
        id: "Electrical", tagline: "Daya, penerangan & sistem kontrol",
        description: "Bertanggung jawab atas sistem kelistrikan, penerangan, panel distribusi, genset, dan infrastruktur listrik di seluruh area Taman Safari Bogor.",
        scope: ["Panel & MDP", "Genset & UPS", "Penerangan area", "Instalasi sipil listrik", "Sistem kontrol & CCTV"],
        head: "Tikno",
        liveStatusKey: undefined,
        headcount: 0
    },
    {
        id: "Mechanical", tagline: "Mesin, pompa & peralatan bergerak",
        description: "Bertanggung jawab atas mesin-mesin, pompa, motor, peralatan mekanikal, dan sistem perawatan mekanis pendukung operasional taman.",
        scope: ["Pompa & hidrolik", "Motor & conveyor", "AC & ventilasi", "Wahana mekanik", "Bengkel mesin"],
        head: "Wawan Setiawan", headcount: 10,
        liveStatusKey: undefined
    },
    {
        id: "Civil", tagline: "Bangunan, struktur & jalan",
        description: "Bertanggung jawab atas gedung, struktur, jalan, fasilitas bangunan, dan infrastruktur sipil agar aman dan nyaman digunakan.",
        scope: ["Struktur & atap", "Jalan & paving", "Pengecatan", "Renovasi ringan", "Drainase permukaan"],
        head: "Asep Kurnia", headcount: 12,
        liveStatusKey: undefined
    },
    {
        id: "Plumbing", tagline: "Air bersih, kotor & sanitasi",
        description: "Bertanggung jawab atas pasokan air bersih, drainage, sanitasi, perpipaan, dan sistem plumbing di seluruh fasilitas.",
        scope: ["Jaringan air bersih", "Drainase & resapan", "Sanitasi & toilet", "Irigasi taman", "Pompa air"],
        head: "Dedi Rustandi", headcount: 7,
        liveStatusKey: undefined
    },
];

export const liveStatus: Record<Division, DivisionStatus> = {
    Electrical: "Available", Mechanical: "Busy", Civil: "Available", Plumbing: "Emergency Response",
};
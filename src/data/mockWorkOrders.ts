import type { ActivityLog, Category, MaterialUsed, WorkOrder, WorkOrderStatus } from "../types";
import { TEMUAN_DIVISION } from "../utils/constants";

interface Seed {
    [x: string]: any;
    t: string; r: string; c: string; d: string; l: string; v: WorkOrder["division"];
    cat: string; p: "Low" | "Mid" | "High"; s: WorkOrderStatus; pic?: string; at: string; desc: string;
    notes?: string[]; mats?: Array<[string, number, string]>; photo?: [string] | [string, string];
}

const seeds: Seed[] = [
    { t: "Lampu penerangan Toilet Selatan mati total", r: "Ratna Sari", c: "0812-8765-4410", d: "CLEANING", l: "Toilet", v: "Electrical", cat: "Repair", p: "Mid", s: "Completed", pic: "Budi Santoso", at: "2025-02-04", desc: "Empat titik lampu di Toilet Selatan mati bersamaan sejak pagi. Kemungkinan MCB di panel turun. Area menjadi gelap saat sore dan mengganggu kenyamanan pengunjung." },
    { t: "Pompa air kolam flamingo bocor dan berisik", r: "drh. Maya Kusuma", c: "0817-5566-1204", d: "LIFE SCIENCE", l: "Animal Area", v: "Mechanical", cat: "Repair", p: "High", s: "Completed", pic: "Joko Prasetyo", at: "2025-02-18", desc: "Pompa sirkulasi kolam flamingo mengeluarkan suara kasar dan terjadi kebocoran pada packing. Debit air kolam menurun dan perlu segera ditangani demi kesehatan satwa.", mats: [["Seal kit pompa", 1, "set"], ["Bearing 6204", 2, "pcs"]] },
    { t: "Genset utama tidak start saat tes mingguan", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Utility Area", v: "Electrical", cat: "Repair", p: "High", s: "Completed", pic: "Budi Santoso", at: "2025-03-02", desc: "Saat tes rutin mingguan, genset utama gagal start. Indikator baterai lemah. Genset adalah cadangan listrik utama jika PLN padam, harus siap selalu.", mats: [["Baterai 12V 45Ah", 1, "unit"], ["Oli mesin SAE 15W-40", 2, "liter"]] },
    { t: "Paving Blok F area Safari Park amblas", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Safari Park", v: "Civil", cat: "Repair", p: "High", s: "Completed", pic: "Asep Kurnia", at: "2025-03-14", desc: "Paving di Blok F amblas sekitar 8 meter akibat aliran air hujan di bawah permukaan. Berbahaya untuk kendaraan pengunjung yang melintas.", photo: ["tsb-wo-04a", "tsb-wo-04b"] },
    { t: "Pipa air panas kamar 208 Hotel bocor", r: "Dewi Lestari", c: "0812-9931-7788", d: "F&B", l: "Hotel", v: "Plumbing", cat: "Repair", p: "High", s: "Completed", pic: "Dedi Rustandi", at: "2025-03-27", desc: "Kebocoran pada jalur pipa air panas kamar 208 menimbulkan rembesan di plafon kamar di bawahnya. Perlu ditutup sementara sampai perbaikan selesai." },
    { t: "Instalasi lampu taman area Wahana Komedi", r: "Tono Hartono", c: "0821-3390-5567", d: "OPERATOR WAHANA", l: "Wahana", v: "Electrical", cat: "Installation", p: "Mid", s: "Completed", pic: "Rina Marlina", at: "2025-04-05", desc: "Penambahan 12 titik lampu taman LED di area Wahana Komedi untuk mendukung acara malam weekend. Butuh jalur kabel baru dari panel terdekat." },
    { t: "Pintu otomatis gerbang masuk macet", r: "Agus Salim", c: "0813-5522-7741", d: "TRANSPORTASI", l: "Safari Park", v: "Mechanical", cat: "Repair", p: "High", s: "Completed", pic: "Joko Prasetyo", at: "2025-04-16", desc: "Pintu otomatis gerbang masuk staff macet setengah terbuka. Motor slidernya berbunyi decit dan limit switch perlu disesuaikan ulang." },
    { t: "Pengecatan ulang pagar Parkir Timur", r: "Hendra Wijaya", c: "0815-7788-1209", d: "HRD & GA", l: "Parking Area", v: "Civil", cat: "Maintenance", p: "Low", s: "Completed", pic: "Yusuf Hamdani", at: "2025-04-28", desc: "Pagar Parkir Timur mulai mengelupas dan berkarat di beberapa titik. Perlu diamplas dan dicat ulang dua lapis sebelum karat merembet." },
    { t: "Sumur resapan Toilet Barat tersumbat", r: "Ratna Sari", c: "0812-8765-4410", d: "CLEANING", l: "Toilet", v: "Plumbing", cat: "Repair", p: "Mid", s: "Completed", pic: "Putra Gani", at: "2025-05-09", desc: "Air di floor drain Toilet Barat menggenang lama. Sumur resapan diduga tersumbat endapan dan perlu disedot serta diperbaiki." },
    { t: "Pemeriksaan berkala panel MLDP Restaurant", r: "Bagus Wibowo", c: "0856-1144-9032", d: "F&B", l: "Restaurant", v: "Electrical", cat: "Inspection", p: "Mid", s: "Completed", pic: "Budi Santoso", at: "2025-05-21", desc: "Pemeriksaan termal dan pengencangan terminal panel MLDP Restaurant sesuai jadwal preventif triwulan. Termograf untuk mendeteksi titik panas." },
    { t: "Perbaikan atap bocor Gudang Alat", r: "Hendra Wijaya", c: "0815-7788-1209", d: "HRD & GA", l: "Warehouse", v: "Civil", cat: "Repair", p: "High", s: "Completed", pic: "Asep Kurnia", at: "2025-06-03", desc: "Dua titik kebocoran di atap Gudang Alat saat hujan deras mengenai rak penyimpanan material. Perlu penggantian beberapa lembar spandek dan sealing ulang." },
    { t: "Motor conveyor pakan ternak overheat", r: "drh. Maya Kusuma", c: "0817-5566-1204", d: "LIFE SCIENCE", l: "Utility Area", v: "Mechanical", cat: "Repair", p: "High", s: "Completed", pic: "Eko Saputra", at: "2025-06-15", desc: "Motor conveyor jalur pakan overheat dan trip terus. Bearing terlalu panas. Distribusi pakan terganggu, satwa menunggu.", mats: [["Bearing 6204", 2, "pcs"], ["Belt B-42", 1, "pcs"]] },
    { t: "Penggantian keran cuci taman utama", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Safari Park", v: "Plumbing", cat: "Maintenance", p: "Low", s: "Completed", pic: "Dedi Rustandi", at: "2025-06-27", desc: "Tiga keran cuci tangan taman utama rusak tidak bisa ditutup sehingga air terus mengalir. Penggantian seal dan beberapa unit keran." },
    { t: "Instalasi jalur listrik stan Marketing Event", r: "Fajar Nugroho", c: "0812-6690-3341", d: "ENTERTAINMENT", l: "Parking Area", v: "Electrical", cat: "Installation", p: "Mid", s: "Completed", pic: "Hendra Saputra", at: "2025-07-08", desc: "Persiapan event akhir pekan: instalasi 6 jalur listrik untuk stan di area parkir, termasuk MCB khusus dan kabel gulung sesuai standar outdoor." },
    { t: "Peningkatan pencahayaan Toilet Bawah", r: "Tono Hartono", c: "0821-3390-5567", d: "OPERATOR WAHANA", l: "Toilet", v: "Electrical", cat: "Improvement", p: "Mid", s: "Completed", pic: "Rina Marlina", at: "2025-07-19", desc: "Toilet Bawah terasa redup. Penggantian seluruh titik dengan LED 18W dan penambahan lampu cermin untuk kenyamanan pengunjung." },
    { t: "Perbaikan mesin air mancur Plaza Utama", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Safari Park", v: "Mechanical", cat: "Repair", p: "Mid", s: "Completed", pic: "Joko Prasetyo", at: "2025-08-01", desc: "Air mancur Plaza Utama mati total. Impeller pompa terkunci oleh endapan lumut. Perlu bongkar, bersihkan, dan ganti seal.", photo: ["tsb-wo-16a", "tsb-wo-16b"] },
    { t: "Rangka kanopi Ticketing berkarat", r: "Sinta Maharani", c: "0819-4471-2260", d: "SAFARI WONDER", l: "Ticketing", v: "Civil", cat: "Repair", p: "High", s: "Completed", pic: "Yusuf Hamdani", at: "2025-08-12", desc: "Rangka baja kanopi loket tiket menunjukkan korosi cukup dalam di sambungan. Perlu pengamplasan, pengelasan penutup, dan cat anti karat." },
    { t: "Perbaikan unit AC ruang Ticketing", r: "Sinta Maharani", c: "0819-4471-2260", d: "SAFARI WONDER", l: "Ticketing", v: "Mechanical", cat: "Repair", p: "Mid", s: "Completed", pic: "Eko Saputra", at: "2025-08-23", desc: "Satu unit AC split ruang ticketing tidak dingin. Kemungkinan kekurangan freon dan filter kotor. Ruangan menjadi panas saat antrean ramai." },
    { t: "Pembersihan dan kalibrasi pompa distribusi", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Utility Area", v: "Mechanical", cat: "Maintenance", p: "Mid", s: "Completed", pic: "Wawan Setiawan", at: "2025-09-04", desc: "Maintenance preventif bulanan dua pompa distribusi utama: pembersihan impeller, kalibrasi tekanan, dan pengecekan getaran bearing." },
    { t: "Penggantian lampu sorot parkir barat", r: "Agus Salim", c: "0813-5522-7741", d: "TRANSPORTASI", l: "Parking Area", v: "Electrical", cat: "Maintenance", p: "Low", s: "Completed", pic: "Hendra Saputra", at: "2025-09-15", desc: "Lima lampu sorot LED parkir barat sudah melewati umur pakai dan redup. Penggantian dengan unit 100W dan pembersihan reflektor." },
    { t: "Renovasi kecil ruang gudang Warehouse", r: "Hendra Wijaya", c: "0815-7788-1209", d: "HRD & GA", l: "Warehouse", v: "Civil", cat: "Improvement", p: "Mid", s: "Completed", pic: "Asep Kurnia", at: "2025-09-26", desc: "Penambahan sekat dan rak penyimpanan di ruang gudang warehouse agar material dan alat terpisah serta mudah diinventarisasi." },
    { t: "Kebocoran pipa irigasi taman Orchid", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Safari Park", v: "Plumbing", cat: "Repair", p: "High", s: "Completed", pic: "Dedi Rustandi", at: "2025-10-08", desc: "Jalur irigasi taman Orchid bocor di dua sambungan. Tanah sekitar selalu basah dan tanaman terancam busuk akar. Ganti sambungan dan fitting.", mats: [["Pipa PVC 3 inch", 6, "meter"]] },
    { t: "Instalasi CCTV jalur keluar parkir", r: "Agus Salim", c: "0813-5522-7741", d: "TRANSPORTASI", l: "Parking Area", v: "Electrical", cat: "Installation", p: "High", s: "Completed", pic: "Rina Marlina", at: "2025-10-20", desc: "Pemasangan 4 titik CCTV di jalur keluar parkir untuk meningkatkan pengawasan. Termasuk jalur kabel dan PoE switch." },
    { t: "Pintu kandang quarantine macet", r: "drh. Maya Kusuma", c: "0817-5566-1204", d: "LIFE SCIENCE", l: "Animal Area", v: "Mechanical", cat: "Repair", p: "High", s: "Completed", pic: "Joko Prasetyo", at: "2025-11-01", desc: "Pintu sliding kandang quarantine macet dan sulit dibuka cepat saat prosedur darurat. Rel dan roller perlu diganti, engsel berat diservis." },
    { t: "Jalan keluar Safari Park berlubang", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Safari Park", v: "Civil", cat: "Repair", p: "High", s: "Completed", pic: "Asep Kurnia", at: "2025-11-12", desc: "Aspal jalan keluar berlubang di dua titik selebar hampir satu meter. Berbahaya bagi bus pengunjung. Pengaspalan patching segera dibutuhkan." },
    { t: "Penggantian MCB panel Office lantai 1", r: "Hendra Wijaya", c: "0815-7788-1209", d: "HRD & GA", l: "Office", v: "Electrical", cat: "Maintenance", p: "Mid", s: "Completed", pic: "Budi Santoso", at: "2025-11-24", desc: "MCB jalur ruang rapat lantai 1 sering trip meski beban normal. Penggantian MCB 16A dan pengecekan beban tiap jalur." },
    { t: "Perbaikan pagar pembatas Animal Hospital", r: "drh. Maya Kusuma", c: "0817-5566-1204", d: "LIFE SCIENCE", l: "Animal Area", v: "Civil", cat: "Repair", p: "Mid", s: "Verified", at: "2026-01-06", desc: "Dua tiang pagar pembatas area Animal Hospital miring akibat tertabrak. Perlu direkteifikasi dan dicor ulang pondasinya." },
    { t: "Ventilasi gudang pakan tidak berfungsi", r: "drh. Maya Kusuma", c: "0817-5566-1204", d: "LIFE SCIENCE", l: "Warehouse", v: "Mechanical", cat: "Repair", p: "High", s: "Waiting Material", pic: "Eko Saputra", at: "2026-01-07", desc: "Exhaust fan gudang pakan mati sehingga kelembapan tinggi dan pakan berisiko jamur. Motor fan perlu diganti, menunggu kedatangan sparepart.", notes: ["Motor fan sudah dibongkar, waiting bearing + kabel tahan panas dari supplier."], mats: [["Bearing 6204", 2, "pcs"]] },
    { t: "Pompa kolam Wahana Piranha mati", r: "Tono Hartono", c: "0821-3390-5567", d: "OPERATOR WAHANA", l: "Wahana", v: "Mechanical", cat: "Repair", p: "High", s: "In Progress", pic: "Joko Prasetyo", at: "2026-01-05", desc: "Pompa utama kolam Wahana Piranha mati mendadak. Air tidak tersirkulasi dan wahana ditutup sementara. Kondisi darurat untuk operasional akhir pekan.", notes: ["Pompa sudah dibongkar di workshop, kerusakan pada winding motor."], photo: ["tsb-wo-27a"] },
    { t: "Lampu sorot plaza wahana putus massal", r: "Tono Hartono", c: "0821-3390-5567", d: "OPERATOR WAHANA", l: "Wahana", v: "Electrical", cat: "Repair", p: "High", s: "New", at: "2026-01-08", desc: "Enam lampu sorot plaza wahana putus bersamaan sejak malam tadi. Kemungkinan kabel bawah tanah terputus. Plaza gelap dan perlu penanganan sebelum akhir pekan." },
    { t: "Kran toilet lobi Hotel rusak", r: "Dewi Lestari", c: "0812-9931-7788", d: "F&B", l: "Hotel", v: "Plumbing", cat: "Repair", p: "Mid", s: "Assigned", pic: "Dedi Rustandi", at: "2026-01-09", desc: "Kran toilet lobi Hotel tidak bisa dimatikan sepenuhnya dan menetes terus. Ganti cartridge keran dan cek tekanan air." },
    { t: "Stop kran Toilet Bawah rusak", r: "Ratna Sari", c: "0812-8765-4410", d: "CLEANING", l: "Toilet", v: "Plumbing", cat: "Repair", p: "Low", s: "New", at: "2026-01-10", desc: "Stop kran salah satu toilet bawah macet sehingga air terus mengalir ke closet. Penghematan air dan kebersihan terganggu." },
    { t: "Penerangan jalur malam Safari Park redup", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Safari Park", v: "Electrical", cat: "Improvement", p: "Mid", s: "In Progress", pic: "Budi Santoso", at: "2026-01-11", desc: "Jalur malam Safari Park terasa redup di beberapa segmen. Penambahan titik lampu jalan dan penggantian unit tua diminta sebelum event malam." },
    { t: "Paving area Restaurant berlubang", r: "Bagus Wibowo", c: "0856-1144-9032", d: "F&B", l: "Restaurant", v: "Civil", cat: "Repair", p: "Mid", s: "Quality Check", pic: "Asep Kurnia", at: "2026-01-12", desc: "Paving jalan setapak area Restaurant berlubang di dekat dapur. Pengunjung berpotensi tersandung. Sudah dilapisi ulang, menunggu pemeriksaan akhir." },
    { t: "Penambahan titik air stan F&B", r: "Bagus Wibowo", c: "0856-1144-9032", d: "F&B", l: "Restaurant", v: "Plumbing", cat: "Installation", p: "Mid", s: "Cancelled", at: "2026-01-03", desc: "Permintaan penambahan dua titik air untuk stan F&B baru di area Restaurant." },
    { t: "Servis kompresor bengkel teknik", r: "Rizky Hidayat", c: "0813-2244-8890", d: "SAFARI WONDER", l: "Utility Area", v: "Mechanical", cat: "Maintenance", p: "Mid", s: "Assigned", pic: "Wawan Setiawan", at: "2026-01-13", desc: "Kompresor udara bengkel teknik servis berkala: ganti oli, cek safety valve, dan bersihkan filter udara." },
];

const plus = (iso: string, hours: number) => new Date(new Date(iso).getTime() + hours * 3600000).toISOString();
const PROJECT_CATS = new Set(["Installation", "Improvement"]);

export function buildMockWorkOrders(): WorkOrder[] {
    const sorted = [...seeds].sort((a, b) => a.at.localeCompare(b.at));
    const counters: Record<string, number> = {};
    const worked = new Set(["In Progress", "Waiting Material", "Quality Check", "Completed"]);
    return sorted.map((s, i) => {
        const year = s.at.slice(0, 4);
        counters[year] = (counters[year] ?? 0) + 1;
        const id = `wo-${String(i + 1).padStart(3, "0")}`;
        const createdAt = new Date(s.at).toISOString();
        const hasWork = worked.has(s.s);
        const verified = s.s !== "New";
        const activity: ActivityLog[] = [
            { id: `${id}-a1`, date: createdAt, action: "Work order dibuat", by: s.r, note: "Diajukan melalui form work order" },
        ];
        if (verified) activity.push({ id: `${id}-a2`, date: plus(s.at, 5), action: "Diverifikasi oleh supervisor", by: "Sri Wahyuni" });
        if (s.pic) activity.push({ id: `${id}-a3`, date: plus(s.at, 9), action: `Ditugaskan ke ${s.pic}`, by: "Andi Pratama" });
        if (hasWork) activity.push({ id: `${id}-a4`, date: plus(s.at, 26), action: "Pekerjaan dimulai", by: s.pic ?? "-" });
        if (s.s === "Waiting Material") activity.push({ id: `${id}-a5`, date: plus(s.at, 40), action: "Menunggu ketersediaan material", by: s.pic ?? "-" });
        if (s.s === "Quality Check") activity.push({ id: `${id}-a6`, date: plus(s.at, 90), action: "Pekerjaan selesai — masuk quality check", by: s.pic ?? "-" });
        const completedAt = s.s === "Completed" ? plus(s.at, (3 + (i % 9)) * 24) : undefined;
        if (s.s === "Completed") activity.push({ id: `${id}-a7`, date: completedAt!, action: "Dinyatakan selesai & diverifikasi", by: "Sri Wahyuni" });
        if (s.s === "Cancelled") activity.push({ id: `${id}-a8`, date: plus(s.at, 20), action: "Work order dibatalkan", by: "Andi Pratama", note: "Perubahan kebutuhan lapangan" });
        const materials: MaterialUsed[] = (s.mats ?? []).map(([name, qty, unit]) => ({ name, qty, unit }));
        const photo = s.photo?.[0] ? `https://picsum.photos/seed/${s.photo[0]}/640/420.jpg` : undefined;
        const photoAfter = s.photo?.[1] ? `https://picsum.photos/seed/${s.photo[1]}/640/420.jpg` : undefined;
        return {
            id,
            woNumber: `WO-${year}-${String(counters[year]).padStart(5, "0")}`,
            requesterName: s.r,
            department: s.d,
            contactNumber: s.c,
            location: s.l,
            title: s.t,
            category: (TEMUAN_DIVISION[s.v as keyof typeof TEMUAN_DIVISION] || s.v) as Category,
            division: s.v,
            jenisPekerjaan: PROJECT_CATS.has(s.cat) ? "Project" : "Maintenance",
            description: s.desc,
            priority: s.p,
            status: s.s,
            createdAt,
            tanggalDilaporkan: createdAt,
            photos: photo ? [photo] : [],
            photo,
            photoAfter,
            pic: s.pic,
            startedAt: hasWork ? plus(s.at, 26) : undefined,
            completedAt,
            activity,
            notes: s.notes ?? [],
            materials,
        };
    });
}
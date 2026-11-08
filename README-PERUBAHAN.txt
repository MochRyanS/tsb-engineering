================================================================
UPDATE FITUR — NOMOR TRACKING WORK ORDER (v1.1 / REVISI 2)
Engineering Department — Taman Safari Bogor
================================================================

PERBAIKAN REVISI 2 (untuk error Vercel: [MISSING_EXPORT]
"workOrderService" is not exported by "src/services/workOrderService.ts")
--------------
Penyebab: file lama di proyek Anda (hooks / halaman dashboard yang
tidak ikut di-update) meng-import `workOrderService` sebagai OBJEK,
sedangkan service baru mengekspor fungsi-fungsi terpisah.
Perbaikan: `workOrderService.ts` kini JUGA mengekspor objek
`workOrderService` (plus default export) yang membungkus semua
fungsi + alias nama metode umum (getAll, getById, create, update,
updateStatus, delete, subscribe, track, dsb.) — jadi file lama
Anda TIDAK perlu diubah sama sekali.
Cukup GANTI SATU FILE: src/services/workOrderService.ts
lalu commit & push. File lain sama dengan revisi sebelumnya.

APA YANG BARU
--------------
1. Setiap Work Order yang dikirim lewat form otomatis mendapat
   NO. TRACKING berformat: WO-YYMMDD-XXXX  (contoh: WO-261106-7K2F)
   Nomor ini sekaligus menjadi ID dokumen Firestore, jadi pasti unik.
2. Setelah SUBMIT, modal "TERIMA KASIH!" kini menampilkan nomor
   tracking + tombol SALIN + tombol "LACAK STATUS" (langsung membuka
   halaman tracking dengan nomor sudah terisi).
3. HALAMAN BARU di website utama: /tracking  (menu navbar: TRACKING)
   - Klien memasukkan nomor tracking -> melihat status pekerjaannya.
   - REAL-TIME: status berubah sendiri tanpa refresh (Firebase
     onSnapshot) - ada badge "REALTIME" hijau di pojok kartu.
   - Isinya: badge status, stepper DILAPORKAN -> DIPROSES -> SELESAI,
     info lengkap WO (departement, lokasi, divisi, priority, pelapor,
     no. WA, temuan), riwayat status, FOTO TEMUAN + FOTO SETELAH
     PEKERJAAN (klik untuk memperbesar / lightbox), dan banner merah
     bila WO dibatalkan.
4. Dashboard admin (menu WORK ORDERS):
   - Kolom pertama kini NO. TRACKING (klik nomor di baris = menyalin).
   - WO baru masuk / status berubah -> tabel ikut berubah real-time
     tanpa refresh.
   - Tabel tetap dua bagian: AKTIF + RIWAYAT (selesai / dibatalkan).
   - Pencarian & filter tetap ada, dan kini juga mencari no. tracking.

DAFTAR FILE (letakkan di proyek dengan path yang sama persis)
------------------------------------------------------------
GANTI (timpa file lama):
  src/services/workOrderService.ts
  src/pages/WorkOrder/WorkOrder.tsx
  src/pages/WorkOrder/WorkOrder.module.css
  src/pages/Dashboard/WorkOrders/WorkOrders.tsx
  src/pages/Dashboard/WorkOrders/WorkOrders.module.css
  src/components/dashboard/WorkOrderTable/WorkOrderTable.tsx
  src/components/dashboard/WorkOrderTable/WorkOrderTable.module.css
  src/components/Navbar.tsx
  src/components/Navbar.module.css

BARU (belum ada sebelumnya):
  src/pages/Tracking/Tracking.tsx
  src/pages/Tracking/Tracking.module.css
  firestore.rules

TIDAK disentuh sama sekali:
  src/types/index.ts, src/services/firebaseClient.ts,
  src/hooks/* (termasuk useWorkOrders), WorkOrderDetail,
  halaman dashboard lain (DashboardHome, MyTasks, Divisions, dll.).
  -> Modul lama Anda tetap jalan; file baru ini yang mengambil alih
     fungsi pembacaan/pembuatan data untuk form, tracking, dan tabel.

LANGKAH PENERAPAN
-----------------
LANGKAH 1 — Copy file
  Ekstrak zip ini, copy folder src/ ke proyek Anda (timpa bila
  diminta). Bila letak komponen di proyek Anda berbeda (misalnya
  WorkOrderTable atau Navbar tidak di path di atas), taruh file di
  lokasi yang DIPAKAI proyek Anda - yang penting isinya.

LANGKAH 2 — App.tsx (WAJIB, tambah 2 baris saja, JANGAN timpa
                       seluruh App.tsx Anda)
  a) Di bagian atas App.tsx, bersama import lazy yang lain, tambah:
       const Tracking = lazy(() => import("./pages/Tracking/Tracking"));
  b) Di dalam blok route publik (yang berisi /work-order), tambah:
       <Route path="/tracking" element={<Tracking />} />
  Contoh jadi:
       <Route element={<PublicLayout />}>
         <Route path="/" element={<Home />} />
         <Route path="/divisions" element={<Divisions />} />
         <Route path="/facilities" element={<Facilities />} />
         <Route path="/work-order" element={<WorkOrder />} />
         <Route path="/tracking" element={<Tracking />} />  {/* BARU */}
       </Route>

LANGKAH 3 — Navbar (dua pilihan, pilih salah satu)
  a) TIMPA src/components/Navbar.tsx + Navbar.module.css dengan versi
     zip ini (menu otomatis + link TRACKING), ATAU
  b) Pertahankan Navbar lama Anda, cukup tambahkan satu NavLink
     di antara link WORK ORDER dan tombol DASHBOARD:
       <NavLink to="/tracking" className={...}>TRACKING</NavLink>

LANGKAH 4 — Firestore Rules (WAJIB)
  - Firebase Console -> Firestore Database -> tab "Rules"
  - Hapus isinya, tempel seluruh isi file "firestore.rules" dari zip,
    lalu klik PUBLISH.
  - Isinya: izin baca/buat/ubah untuk publik (dibutuhkan halaman
    tracking + dashboard yang login-nya masih mock), dan DELETE
    ditolak supaya data work order tidak bisa dihapus dari klien.

LANGKAH 5 — Uji coba lokal
  npm run dev, lalu:
  1. Buka /work-order -> isi form -> SUBMIT.
  2. Di modal sukses akan muncul NO. TRACKING (contoh: WO-261106-A1B2).
     Klik SALIN, lalu klik "LACAK STATUS".
  3. Halaman /tracking terbuka dengan nomor sudah terisi -> kartu
     status muncul (status awal: New).
  4. Buka dashboard -> WORK ORDERS: WO tadi tampil di tabel AKTIF
     dengan nomor tracking-nya. Ubah status dari halaman detail
     (tombol ASSIGN/CANCEL dsb.) -> halaman /tracking di tab lain
     berubah sendiri (real-time).

LANGKAH 6 — Deploy
  git add .  /  git commit -m "fitur no. tracking work order"  /
  git push  -> Vercel otomatis build & deploy.

CATATAN PENTING
---------------
- WO LAMA (dibuat sebelum update ini) TIDAK punya nomor tracking:
  di tabel tampil "-" dan tidak bisa dilacak. Hanya WO baru yang
  otomatis mendapat nomor. Data lama tetap utuh dan tetap muncul di
  dashboard (badge & split AKTIF/RIWAYAT tetap bekerja untuk data
  lama karena semua varian status lama dikenali).
- Nama collection Firestore harus "workOrders" (sama seperti yang
  sudah Anda pakai sekarang) - jangan dibuat ulang.
- workOrderService membaca db dari firebaseClient Anda lewat beberapa
  nama kandidat (db / firestoreDb / firestore) dan otomatis fallback
  ke mode mock bila tidak ada. Bila setelah update daftar WO tiba-tiba
  kosong padahal Firebase aktif, kirim isi firebaseClient.ts Anda -
  kemungkinan nama ekspornya berbeda dan perlu saya sesuaikan.
- Label departemen di form diambil dari form Google asli perusahaan
  (hasil baca video), termasuk "RUMAH PENANGKARAN 2". Mohon dicek
  sekilas: bila di form aslinya tertulis lain, edit satu baris saja
  di DEPARTMENT_OPTIONS (src/pages/WorkOrder/WorkOrder.tsx).
- Pemetaan Jenis Temuan -> Divisi engineering ada di SATU tempat:
  const TEMUAN_DIVISION = { ... }  (di WorkOrder.tsx). Ubah di sana
  bila pembagian divisi ingin disesuaikan.
- Foto form otomatis dikompres (maks sisi 900px, JPEG kualitas 65%)
  supaya aman terhadap batas ukuran dokumen Firestore (maks 5 foto).
- Keamanan rules saat ini terbuka untuk baca/buat/ubah karena login
  dashboard masih mock (tanpa Firebase Auth asli). Untuk jangka
  panjang disarankan menambah Firebase Auth asli, lalu memperketat
  rules - bisa kita kerjakan di update berikutnya.

ALUR PENGGUNAAN (RINGKAS)
-------------------------
- KLIEN: website -> WORK ORDER -> isi form -> SUBMIT -> catat nomor
  tracking yang muncul -> menu TRACKING -> ketik nomornya kapan saja
  untuk melihat status pekerjaan secara real-time.
- KARYAWAN ENGINEERING: login dashboard -> WORK ORDERS -> WO baru
  muncul sendiri (real-time) lengkap dengan NO. TRACKING -> kerjakan,
  ubah status/PIC lewat halaman detail seperti biasa -> status klien
  ikut berubah secara langsung.
================================================================

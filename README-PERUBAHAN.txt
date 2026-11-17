=====================================================================
PAKET REVISI 12 — PERBAIKAN HITUNGAN DASHBOARD + TABEL DIPISAH
=====================================================================

ISI PERBAIKAN (3 hal)
---------------------
1. KARTU "IN PROGRESS" DI DASHBOARD TIDAK AKURAT + TOTAL SALAH
   - Penyebab 1: dashboard hanya melanggan SATU koleksi data,
     sehingga 2 dari 8 work order tidak terhitung (total sempat
     tampil 6 padahal ada 8). Kini dashboard memakai langganan
     gabungan yang sama dengan halaman Work Orders.
   - Penyebab 2: kartu IN PROGRESS hanya menghitung status persis
     "In Progress", padahal WO yang sudah diambil teknisi (status
     "Assigned" — punya PIC) juga sedang dikerjakan. Kini kartu
     IN PROGRESS menghitung: Assigned, In Progress, Waiting
     Material, dan Quality Check — konsisten dengan tahap
     "Diproses" di halaman Tracking. Dengan data Anda sekarang,
     kartu ini akan menunjukkan 1 (WO Wahyudi yang ditangani
     Tatang Supriatna).

2. TABEL WORK ORDERS DIPISAH PER KELOMPOK STATUS
   Halaman WORK ORDERS kini menampilkan 4 tabel terpisah:
     - BARU    — WO baru masuk, belum ditugaskan (status New)
     - PENDING — menunggu verifikasi admin
     - PROGRESS — sedang dikerjakan (Assigned / In Progress /
                  Waiting Material / Quality Check)
     - SELESAI / DIBATALKAN — riwayat
   Baris jumlah di atas tabel: "… ditemukan · n baru · n pending ·
   n progress · n selesai". Pencarian & filter tetap berlaku untuk
   semua tabel.

3. BONUS: tabel "WORK ORDER TERBARU" di halaman Dashboard selama
   ini SELALU KOSONG (salah nama properti) — kini terisi.

CARA MEMINDAHKAN WO ANTAR TABEL (alur yang ada, tidak berubah):
   BARU   : tekan ASSIGN + pilih teknisi  -> pindah ke PROGRESS
   PROGRESS: START WORK / QUALITY CHECK   -> tetap di PROGRESS
   PROGRESS: COMPLETE                     -> pindah ke SELESAI
   CATATAN: kelompok PENDING hanya terisi bila ada WO berstatus
   Waiting Verification / Verified.

CARA PASANG — 6 FILE (semua REPLACE, tidak ada file baru)
---------------------
Cara termudah:
1. Ekstrak "update-revisi-12.zip".
2. Buka foldernya, copy folder "src" ke dalam
   C:\program\website-WO\  -> pilih REPLACE bila ditanya.
   (Folder src di zip hanya berisi 6 file ini — file lain di
   proyek Anda tidak tersentuh.)

Daftar 6 file (kalau ingin copy satu per satu — REPLACE semua):
   src\services\workOrderService.ts
   src\hooks\useWorkOrders.tsx
   src\pages\Dashboard\DashboardHome\DashboardHome.tsx
   src\pages\Dashboard\WorkOrders\WorkOrders.tsx
   src\components\charts\StatusChart.tsx
   src\components\dashboard\WorkOrderTable\WorkOrderTable.tsx

LALU:
3. Terminal VSCode:

     git add -A
     git status

   Pastikan muncul "modified:" untuk 6 file di atas.
4. Lanjut:

     git commit -m "revisi 12: hitungan dashboard akurat + tabel per status"
     git push

5. vercel.com > Deployments > tunggu HIJAU "Ready".
6. Buka dashboard > Ctrl+Shift+R (hard refresh).

HASIL YANG DILIHAT (dengan data Anda saat ini)
----------------------------------------------
- Dashboard: TOTAL WORK ORDERS = 8 (bukan 6), IN PROGRESS = 1.
- Tabel "WORK ORDER TERBARU" di dashboard terisi 5 baris.
- Halaman WORK ORDERS: BARU (3) · PENDING (0) · PROGRESS (1) ·
  SELESAI (4).
- Donut STATUS di dashboard menghitung semua varian penulisan
  status lama (mis. "On Progress" dihitung sebagai In Progress).

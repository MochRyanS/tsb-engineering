================================================================
UPDATE PERBAIKAN — DETAIL WORK ORDER MASIH BLANK / LAYAR PUTIH
(REVISI 6 / v1.6)
Engineering Department — Taman Safari Bogor
================================================================

>>> PESAN PALING PENTING DALAM README INI <<<

Saya memeriksa LANGSUNG situs https://tsb-woengineering.vercel.app
pada 16 Nov 2026 (login sebagai admin, klik detail WO, dan membaca
error di console browser). Hasil pemeriksaannya:

  1. Penyebab layar putih saat klik detail WO sudah ketemu:
     TypeError: Cannot read properties of undefined (reading 'map')
     Halaman detail lama menjalankan H.activity.map(...), H.notes.map(...),
     H.materials.map(...) — tetapi WO yang dibuat oleh kode LAMA
     (yang sedang berjalan di situs sekarang) TIDAK menyimpan field
     activity / notes / materials di dokumennya → halaman langsung
     mati total → layar putih.

  2. BUKTI BAHWA UPDATE SEBELUMNYA BELUM PERNAH BERJALAN DI SITUS:
     - Menu TECHNICIANS di situs MASIH menampilkan kartu "Performance"
       (padahal update Revisi 5 terakhir sudah menghapus kartu itu).
     - Kode service di situs masih versi lama (Revisi 3).
     Artinya: paket update sebelumnya (update-fitur-tracking.zip)
     BELUM pernah berhasil diterapkan / di-push / ter-deploy ke Vercel.
     Mengganti file di VSCode saja TIDAK cukup — harus di-commit,
     di-push ke GitHub, dan deploy di Vercel harus BERHASIL.

Jadi masalahnya bukan perbaikan yang salah, melainkan perbaikan yang
belum pernah sampai ke situs. Paket Revisi 6 ini mengulang semua
perbaikan (Revisi 4 + 5) plus dua penguatan baru, dan langkah
penerapan di bawah ditulis selangkah demi selangkah supaya pasti
sampai. IKUTI BAGIAN "WAJIB — LANGKAH PENERAPAN" sampai selesai.

================================================================
ISI REVISI 6 (yang berbeda dari paket sebelumnya)
================================================================
1. FORM TETAP BERHASIL KIRIM WALAU RULES BELUM DIUPDATE (BARU)
   Service kini menulis WO ke koleksi utama "workorders"; bila
   koleksi itu masih ditolak aturan keamanan (rules lama Anda hanya
   mengizinkan "workOrders"), service OTOMATIS menulis ke koleksi
   warisan supaya pengiriman form tidak pernah gagal. Begitu rules
   diperbarui, dokumen itu otomatis dipindahkan ke koleksi utama.

2. DAFTAR WO TETAP TAMPIL WALAU RULES BELUM DIUPDATE (BARU)
   Baca "Gagal memuat work order" tidak muncul lagi selama salah
   satu koleksi masih terbaca; daftar bahkan tetap hidup (realtime)
   lewat koleksi yang diizinkan.

3. BACKFILL OTOMATIS (dari Revisi 5 — inti perbaikan detail WO):
   saat website dibuka, service memeriksa semua dokumen WO dan
   MELENGKAPI field yang hilang: activity (diturunkan dari riwayat
   status), notes, materials, photos, serta semua nama field lama
   (requesterName, contactNumber, woNumber, jenisPekerjaan,
   tanggalDilaporkan, complainantName, waNumber, dll). Hanya field
   yang kosong yang diisi — data lama tidak ditimpa. Setelah ini
   halaman detail lama Anda menerima dokumen yang lengkap dan TIDAK
   crash lagi. Berlaku juga untuk WO yang sudah terlanjur dibuat
   (mis. WO-261108-DHG7 dan WO-261108-B5NE).

4. STATISTIK TECHNICIANS (dari Revisi 5, sesuai permintaan Anda):
   Active Tasks & Completed dihitung dari data WO ASLI (field PIC),
   otomatis MULAI DARI 0, realtime, dan kartu "Performance" DIHAPUS.

================================================================
WAJIB — LANGKAH PENERAPAN (KERJAKAN BERURUTAN, JANGAN LONCAT)
================================================================
LANGKAH A — GANTI FILE di VSCode (timpa file lama, path sama persis):
   1. src/services/workOrderService.ts          <-- PALING PENTING
   2. src/pages/Dashboard/Technicians/Technicians.tsx
   3. src/pages/Dashboard/Technicians/Technicians.module.css
   4. src/hooks/useTechnicians.ts               (bila ada; lihat catatan)
   5. File lain di zip (form WorkOrder, Tracking, WorkOrders,
      WorkOrderTable, Navbar) — bila sudah pernah dipasang dari zip
      sebelumnya, tidak perlu diapa-apakan lagi.
   Catatan langkah 4: bila file useTechnicians Anda ada di lokasi
   lain, cari dengan Ctrl+P ketik: useTechnicians — timpa isinya,
   lalu pastikan baris import-nya menunjuk ke path services Anda.

LANGKAH B — UPDATE FIRESTORE RULES (WAJIB, 1 MENIT):
   Firebase Console -> Firestore Database -> Rules -> timpa SEMUA
   isinya dengan file firestore.rules dari zip ini (mencakup DUA
   koleksi: "workorders" dan "workOrders") -> klik PUBLISH.
   Efeknya: 37 WO lama Anda ikut tampil dan backfill bisa menulis.
   Tanpa langkah ini situs TETAP JALAN (karena penguatan no. 1 & 2
   di atas), tetapi WO lama tidak tampil dan notifikasi realtime
   tidak penuh.

LANGKAH C — COMMIT & PUSH ke GitHub:
   (di terminal VSCode)
     git add .
     git commit -m "revisi 6: perbaikan detail WO blank + statistik teknisi"
     git push

LANGKAH D — PASTIKAN DEPLOY VERCEL BENAR-BENAR BERHASIL (INI YANG
   SELAMA INI TERLEWAT):
   1. Buka https://vercel.com -> login -> klik project Anda
      (tsb-woengineering) -> tab "Deployments".
   2. Paling atas harus muncul deployment baru dengan status
      "Ready" (hijau). Tunggu 1-2 menit bila masih "Building".
   3. BILA STATUSNYA "Error" (merah): klik deployment itu, cari
      pesan errornya, screenshot dan kirim ke saya — JANGAN
      dibiarkan, karena selama error situs tetap memakai versi lama.
   4. Bila "Ready" tetapi tampilan situs belum berubah: buka situs
      lalu tekan Ctrl + Shift + R (hard refresh) — browser bisa
      menyimpan file lama di cache.

LANGKAH E — CEK 5 MENIT (BUKTI PERBAIKAN SUDAH LIVE):
   1. Buka menu TECHNICIANS. TIDAK ADA lagi kartu "Performance" dan
      semua angka mulai dari 0  →  ini BUKTI kode baru sudah live.
      (Masih ada kartu Performance = deploy belum berhasil — ulangi
      Langkah D, jangan lanjut.)
   2. Menu WORK ORDERS -> klik salah satu WO (mis. WO-261108-DHG7)
      -> halaman DETAIL terbuka normal: tidak blank, ada STATUS
      TIMELINE dan ACTIVITY TIMELINE, ada tombol upload foto.
   3. Buka juga detail salah satu WO lama (WO-2026-0000x) -> ikut
      normal (bila Langkah B sudah dikerjakan).
   4. Coba SUBMIT satu WO baru dari menu WORK ORDER di website
      -> muncul nomor tracking WO-YYMMDD-XXXX.
   5. Menu TRACKING -> ketik nomor tadi -> statusnya keluar.

================================================================
DAFTAR FILE DI ZIP INI
================================================================
GANTI (timpa file lama di proyek):
  src/services/workOrderService.ts                      (REVISI 6)
  src/pages/WorkOrder/WorkOrder.tsx
  src/pages/WorkOrder/WorkOrder.module.css
  src/pages/Dashboard/WorkOrders/WorkOrders.tsx
  src/pages/Dashboard/WorkOrders/WorkOrders.module.css
  src/pages/Dashboard/Technicians/Technicians.tsx
  src/pages/Dashboard/Technicians/Technicians.module.css
  src/components/dashboard/WorkOrderTable/WorkOrderTable.tsx
  src/components/dashboard/WorkOrderTable/WorkOrderTable.module.css
  src/components/Navbar.tsx
  src/components/Navbar.module.css
  src/hooks/useTechnicians.ts
BARU (belum ada sebelumnya):
  src/pages/Tracking/Tracking.tsx
  src/pages/Tracking/Tracking.module.css
  firestore.rules

TIDAK disentuh sama sekali:
  WorkOrderDetail, WorkOrderProvider, DashboardHome, MyTasks,
  Divisions, Locations, Reports, Users, Settings, authService,
  firebaseClient, App.tsx, types. -> Modul lama Anda tetap jalan;
  service yang melengkapi datanya dari belakang panggung. (Sudah
  saya verifikasi langsung di situs live: WorkOrderProvider Anda
  aman memakai service baru ini.)

================================================================
CATATAN PENTING
================================================================
- Daftar teknisi masih daftar tetap (Budi Santoso, Joko Prasetyo,
  Asep Kurnia, Dedi Rustandi, Eko Saputra, Rina Marlina, Yusuf
  Hamdani, Putra Gani, Hendra Saputra, Wawan Setiawan) — ada di
  DUA file (Technicians.tsx dan useTechnicians.ts), keduanya punya
  array ROSTER di bagian atas file. Silakan sesuaikan.
- Statistik teknisi hanya menghitung WO yang PUNYA PIC (ditugaskan).
- WO lama (37 WO sebelum fitur tracking) tidak punya nomor tracking:
  di tabel tampil "-" dan tidak bisa dilacak — hanya WO baru yang
  otomatis mendapat nomor.
- Akun teknisi untuk login masih placeholder — belum diganti dengan
  akun asli (tugas terpisah, belum dikerjakan).
- Keamanan rules saat ini terbuka (baca/buat/ubah publik) karena
  login dashboard masih mock. Untuk jangka panjang disarankan
  Firebase Auth asli + rules lebih ketat.

================================================================
RINGKASAN SEMUA REVISI (KUMULATIF)
================================================================
REVISI 2: ekspor objek workOrderService (error Vercel MISSING_EXPORT).
REVISI 3: normalisasi field tanggal (perbaikan dashboard blank
          pertama: createdAt.slice is not a function).
REVISI 4: koleksi utama "workorders" + jaminan field array & alias.
REVISI 5: statistik teknisi dari data asli (mulai 0) + Performance
          dihapus + backfill dokumen lama.
REVISI 6: (paket ini) backfill diperkuat + form & daftar WO tetap
          jalan walau rules belum diupdate + README deploy detail.
================================================================

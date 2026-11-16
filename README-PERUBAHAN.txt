=========================================================
PAKET REVISI 7 — NAMA TEKNISI ASLI (22 PERSONIL)
=========================================================

KENAPA KEMARIN NAMA TIDAK BERUBAH DI WEBSITE?
---------------------------------------------
Ada 2 penyebab sekaligus:

1. FILE YANG DIEDIT TIDAK DIPAKAI SITUS.
   Anda mengedit "src/data/mockTechnicians.ts". File itu adalah
   sisa template LAMA dan TIDAK dibaca oleh halaman Technicians
   yang sekarang. Daftar nama yang benar-benar dipakai ada di:
     - src/pages/Dashboard/Technicians/Technicians.tsx  (daftar ROSTER)
   Jadi walaupun file itu diubah, halaman tidak akan berubah.

2. BELUM DI-PUSH KE GITHUB.
   Mengedit file di VSCode saja TIDAK mengubah website. Perubahan
   baru sampai ke website setelah "git push" DAN deploy Vercel
   selesai dengan status HIJAU "Ready". Setiap kali mengubah kode,
   langkah push + cek deploy WAJIB dilakukan.

APA YANG DIUBAH DI PAKET INI?
-----------------------------
Daftar teknisi (ROSTER) diganti dengan 22 personil asli departemen
Engineering:

  ELECTRICAL (10): Swanto (SPV Engineer), Aji Aryanto, Didi Sunardi,
    M. Ismail, Fikri Adam, Edhi Suparman (Teknisi Junior),
    Jaka Gitaya (Teknisi Junior), Hermanudin, Ade Wahyudin, Arifin
  PLUMBING (2): M. Didin, Daudi Lutang
  CIVIL (2): Usep Saepudin, Tim Civil
  MECHANICAL (8): Tatang Supriatna, Deni Supriadi, Ismayadhi,
    Bois Sianippar, Tim Maintenance, Tim Aspald, Tim Las, Tim Bengkel

Catatan:
- "Tim Civil" saya masukkan ke divisi CIVIL (di data Anda tertulis
  Mechanical — kemungkinan salah tempel). Kalau memang salah, kabari
  saya atau edit langsung barisnya di Technicians.tsx.
- Semua status ketersediaan saya set "Available".
- Angka Active Tasks / Completed dihitung otomatis dari WO yang
  PIC-nya persis sama dengan nama di daftar (mulai dari 0).

File "src/data/mockTechnicians.ts" lama BOLEH DIHAPUS dari proyek
(tidak dipakai), atau dibiarkan juga tidak masalah.

CARA PASANG (5 MENIT)
---------------------
1. Download "update-revisi-7.zip" lalu ekstrak (klik kanan > Extract).
2. Buka folder hasil ekstrak. Di dalamnya ada folder "src" dan file
   "firestore.rules".
3. Copy SEMUA isi folder "src" ke dalam folder proyek website Anda
   (C:\program\website-WO\src) -> pilih REPLACE / TIMPA file.
4. (Hanya jika belum pernah) Buka firestore.rules, copy isinya ke
   Firebase Console > Firestore Database > Rules > Publish.
5. Buka Terminal di VSCode (menu Terminal > New Terminal), ketik:

     git add .
     git commit -m "revisi 7: nama teknisi asli"
     git push

6. BUKA VERCEL.COM > project Anda > tab Deployments. TUNGU sampai
   deployment terbaru berstatus HIJAU "Ready".
   Kalau MERAH "Error": klik deployment itu, screenshot pesan
   errornya, kirim ke saya. SELAMA MASIH MERAH, situs tetap
   memakai versi lama.
7. Buka website, tekan Ctrl + Shift + R (hard refresh). Buka menu
   Technicians -> yang tampil harus 22 nama asli, tanpa kartu
   Performance, angka mulai dari 0.

PENTING UNTUK KE DEPANNYA
-------------------------
- File mockData apa pun (mockTechnicians, mockUsers, mockWorkOrders,
  mockLocations) TIDAK dipakai situs — jangan diedit untuk mengubah
  isi website.
- Data WO & tracking disimpan di Firestore (Firebase), bukan di file.
- Setiap selesai mengubah kode: push + pastikan deploy Vercel hijau.

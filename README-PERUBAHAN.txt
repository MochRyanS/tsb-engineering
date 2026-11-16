=========================================================
PAKET REVISI 8 — HAPUS FACILITIES + PERBAIKI TOMBOL HERO
=========================================================

APA YANG DIPERBAIKI?
--------------------
1. HALAMAN FACILITIES DIHAPUS.
   - Menu "FACILITIES" di navbar hilang.
   - Halaman /facilities tidak ada lagi. URL lama /facilities
     (bookmark atau link lama) otomatis dialihkan ke halaman Home.

2. TOMBOL "CREATE WORK ORDER", "OUR DIVISIONS" (hero, halaman depan)
   DAN TOMBOL MENGAMBANG "+ CREATE WORK ORDER" (pojok kanan bawah)
   SEKARANG BERFUNGSI.
   Akar masalahnya: tombol-tombol itu memakai link gaya lama
   "#/work-order" (pakai tanda #). Website ini memakai router tanpa
   tanda #, jadi klik tombol hanya menambah "#..." di belakang URL —
   halaman tidak pernah pindah. Sekarang ada komponen HashRedirect
   yang otomatis mengalihkan semua link gaya itu ke halaman yang
   benar, jadi tombol hero + tombol mengambang langsung berfungsi
   tanpa mengubah file halaman Anda.

FILE YANG WAJIB DIPASANG untuk update ini (3 file):
---------------------------------------------------
  1. src/App.tsx                                (DIUBAH)
  2. src/components/Navbar.tsx                  (DIUBAH)
  3. src/components/HashRedirect.tsx            (FILE BARU)

File lain di zip ini adalah perbaikan Revisi 4-7 (kumulatif) —
boleh ikut ditempel (aman), tapi minimal 3 file di atas harus
masuk supaya perubahan ini bekerja.

SETELAH FILE DITEMPEL (PILIHAN, OPSIONAL):
------------------------------------------
- Folder "src/pages/Facilities" di proyek Anda boleh DIHAPUS
  (klik kanan folder > Delete). TAPI hati-hati urutannya: TEMPEL
  DULU file App.tsx yang baru, BARU hapus foldernya. Kalau tidak
  yakin, biarkan saja foldernya — tidak berefuk apa pun karena
  sudah tidak dipakai.

CATATAN SOAL FOOTER:
--------------------
Di bagian paling bawah website ada link kecil "Facilities" yang
berasal dari file Footer di proyek Anda (file itu tidak termasuk
paket ini). Setelah update ini, link tersebut hanya membawa ke
halaman Home. Kalau ingin menghapus tulisannya juga: buka file
Footer di proyek Anda (src/components/Footer), hapus baris yang
berisi label `Facilities`.

CARA PASANG
-----------
1. Download "update-revisi-8.zip" lalu ekstrak.
2. Copy folder "src" ke folder proyek website Anda
   (C:\program\website-WO) -> pilih REPLACE / TIMPA file.
   (File HashRedirect.tsx otomatis masuk ke src\components.)
3. Terminal VSCode:

     git add .
     git status        <- cek file yang ikut ter-upload
     git commit -m "hapus facilities + perbaiki tombol hero"
     git push

   (Tulisan dalam tanda kutip bebas — catatan saja.)
4. Buka vercel.com > project Anda > Deployments > tunggu HIJAU
   "Ready". Kalau MERAH: klik deployment, screenshot errornya,
   kirim ke saya.
5. Buka website, tekan Ctrl + Shift + R (hard refresh).

CEK HASILNYA
------------
- Navbar: menu FACILITIES sudah tidak ada.
- Ketik manual alamat .../facilities -> otomatis kembali ke Home.
- Halaman depan: klik "CREATE WORK ORDER" -> masuk halaman form
  Work Order. Klik "OUR DIVISIONS" -> masuk halaman Divisions.
- Tombol mengambang "+ CREATE WORK ORDER" di pojok kanan bawah ->
  masuk halaman form Work Order.
- Menu Technicians: 22 nama teknisi asli (bawaan Revisi 7), tanpa
  kartu Performance.

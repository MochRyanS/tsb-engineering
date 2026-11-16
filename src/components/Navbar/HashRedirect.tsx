import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* =====================================================================
   REVISI 8 — PERBAIKAN TOMBOL "CREATE WORK ORDER" / "OUR DIVISIONS"
   ---------------------------------------------------------------------
   Akar masalah: tombol hero di halaman Home dan tombol mengambang
   (FAB) memakai link bergaya hash, contoh:  <a href="#/work-order">.
   Aplikasi ini memakai React Router TANPA hash, sehingga klik tombol
   hanya mengubah "#..." di belakang URL — halaman tidak pernah pindah.

   Komponen ini memantau event "hashchange": begitu ada hash berbentuk
   "#/xxx", ia langsung bernavigasi ke path "/xxx" yang benar lalu
   membersihkan hash. Dengan begitu SEMUA link gaya lama (hero, FAB,
   maupun lainnya) otomatis berfungsi tanpa perlu mengubah file
   halaman mereka satu per satu.
   ===================================================================== */

export default function HashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#/')) return; // anchor biasa (#section) dibiarkan
      const path = hash.slice(1); // "#/work-order" -> "/work-order"
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      navigate(path, { replace: true });
    };

    redirect(); // hash sudah ada saat halaman dibuka (mis. dari bookmark lama)
    window.addEventListener('hashchange', redirect);
    return () => window.removeEventListener('hashchange', redirect);
  }, [navigate]);

  return null;
}

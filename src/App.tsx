import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import PublicLayout from './layouts/PublicLayout/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PageLoader from './components/ui/PageLoader/PageLoader';

/* =====================================================================
   REVISI 10 — App.tsx versi struktur asli proyek (perbaikan deploy)
   ---------------------------------------------------------------------
   App.tsx Revisi 8/9 memakai path yang tidak cocok dengan struktur
   proyek ini (contoh: ./layouts/DashboardLayout padahal file aslinya
   di ./layouts/DashboardLayout/DashboardLayout.tsx) sehingga build
   gagal "Could not resolve ...". Versi ini kembali ke struktur asli
   template + perubahan yang diminta:
   1. Halaman Facilities DIHAPUS — URL lama /facilities dialihkan ke
      halaman Home.
   2. Tombol hero "CREATE WORK ORDER" / "OUR DIVISIONS" dan tombol
      mengambang memakai link gaya lama "#/work-order" sehingga klik
      tidak pernah berpindah halaman. Fungsi HashRedirect di bawah
      mengalihkan semua link gaya itu ke halaman yang benar.
   ===================================================================== */

const Home = lazy(() => import('./pages/Home/Home'));
const Divisions = lazy(() => import('./pages/Divisions/Divisions'));
const WorkOrder = lazy(() => import('./pages/WorkOrder/WorkOrder'));
const Login = lazy(() => import('./pages/Login/Login'));
const DashboardHome = lazy(() => import('./pages/Dashboard/DashboardHome/DashboardHome'));
const WorkOrders = lazy(() => import('./pages/Dashboard/WorkOrders/WorkOrders'));
const WorkOrderDetail = lazy(() => import('./pages/Dashboard/WorkOrderDetail/WorkOrderDetail'));
const MyTasks = lazy(() => import('./pages/Dashboard/MyTasks/MyTasks'));
const Technicians = lazy(() => import('./pages/Dashboard/Technicians/Technicians'));
const DivisionsDash = lazy(() => import('./pages/Dashboard/Divisions/Divisions'));
const Locations = lazy(() => import('./pages/Dashboard/Locations/Locations'));
const Reports = lazy(() => import('./pages/Dashboard/Reports/Reports'));
const Users = lazy(() => import('./pages/Dashboard/Users/Users'));
const Settings = lazy(() => import('./pages/Dashboard/Settings/Settings'));
const Tracking = lazy(() => import('./pages/Tracking/Tracking'));

/** Menangkap link bergaya lama "#/xxx" (tombol hero & tombol mengambang)
 *  lalu bernavigasi ke path "/xxx" yang benar. Anchor biasa (#section)
 *  dibiarkan bekerja seperti semula. */
function HashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#/')) return;
      const path = hash.slice(1); // "#/work-order" -> "/work-order"
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      navigate(path, { replace: true });
    };

    redirect(); // hash sudah ada saat halaman dibuka (bookmark lama)
    window.addEventListener('hashchange', redirect);
    return () => window.removeEventListener('hashchange', redirect);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<PageLoader />}>
        <HashRedirect />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/divisions" element={<Divisions />} />
            {/* Facilities dihapus — URL lama dialihkan ke Home */}
            <Route path="/facilities" element={<Navigate to="/" replace />} />
            <Route path="/work-order" element={<WorkOrder />} />
            <Route path="/tracking" element={<Tracking />} />
          </Route>

          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="work-orders" element={<WorkOrders />} />
            <Route path="work-orders/:id" element={<WorkOrderDetail />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="technicians" element={<Technicians />} />
            <Route path="divisions" element={<DivisionsDash />} />
            <Route path="locations" element={<Locations />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </MotionConfig>
  );
}

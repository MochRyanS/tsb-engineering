import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PageLoader from './components/ui/PageLoader';
import HashRedirect from './components/HashRedirect';

/* REVISI 8 — halaman Facilities DIHAPUS:
   - route & halaman /facilities tidak lagi ada; URL lama /facilities
     (menu lama, bookmark, atau link di Footer) otomatis dialihkan ke
     halaman Home.
   - HashRedirect memperbaiki tombol hero "CREATE WORK ORDER" /
     "OUR DIVISIONS" dan tombol mengambang yang memakai link gaya
     "#/work-order" (hash) supaya berpindah halaman dengan benar. */

const Home = lazy(() => import('./pages/Home/Home'));
const Divisions = lazy(() => import('./pages/DivisionsPub/DivisionsPub'));
const WorkOrder = lazy(() => import('./pages/WorkOrder/WorkOrder'));
const Tracking = lazy(() => import('./pages/Tracking/Tracking'));
const Login = lazy(() => import('./pages/Login/Login'));
const DashboardHome = lazy(() => import('./pages/Dashboard/DashboardHome/DashboardHome'));
const WorkOrders = lazy(() => import('./pages/Dashboard/WorkOrders/WorkOrders'));
const WorkOrderDetail = lazy(() => import('./pages/Dashboard/WorkOrderDetail/WorkOrderDetail'));
const MyTasks = lazy(() => import('./pages/Dashboard/MyTasks/MyTasks'));
const Technicians = lazy(() => import('./pages/Dashboard/Technicians/Technicians'));
const DashboardDivisions = lazy(() => import('./pages/Dashboard/Divisions/Divisions'));
const Locations = lazy(() => import('./pages/Dashboard/Locations/Locations'));
const Reports = lazy(() => import('./pages/Dashboard/Reports/Reports'));
const Users = lazy(() => import('./pages/Dashboard/Users/Users'));
const Settings = lazy(() => import('./pages/Dashboard/Settings/Settings'));

export default function App() {
  return (
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

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/work-orders" element={<WorkOrders />} />
          <Route path="/dashboard/work-orders/:id" element={<WorkOrderDetail />} />
          <Route path="/dashboard/my-tasks" element={<MyTasks />} />
          <Route path="/dashboard/technicians" element={<Technicians />} />
          <Route path="/dashboard/divisions" element={<DashboardDivisions />} />
          <Route path="/dashboard/locations" element={<Locations />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}

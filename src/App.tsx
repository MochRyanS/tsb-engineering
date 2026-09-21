import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import PublicLayout from "./layouts/PublicLayout/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PageLoader from "./components/ui/PageLoader/PageLoader";

const Home = lazy(() => import("./pages/Home/Home"));
const Divisions = lazy(() => import("./pages/Divisions/Divisions"));
const Facilities = lazy(() => import("./pages/Facilities/Facilities"));
const WorkOrder = lazy(() => import("./pages/WorkOrder/WorkOrder"));
const Login = lazy(() => import("./pages/Login/Login"));
const DashboardHome = lazy(() => import("./pages/Dashboard/DashboardHome/DashboardHome"));
const WorkOrders = lazy(() => import("./pages/Dashboard/WorkOrders/WorkOrders"));
const WorkOrderDetail = lazy(() => import("./pages/Dashboard/WorkOrderDetail/WorkOrderDetail"));
const MyTasks = lazy(() => import("./pages/Dashboard/MyTasks/MyTasks"));
const Technicians = lazy(() => import("./pages/Dashboard/Technicians/Technicians"));
const DivisionsDash = lazy(() => import("./pages/Dashboard/Divisions/Divisions"));
const Locations = lazy(() => import("./pages/Dashboard/Locations/Locations"));
const Reports = lazy(() => import("./pages/Dashboard/Reports/Reports"));
const Users = lazy(() => import("./pages/Dashboard/Users/Users"));
const Settings = lazy(() => import("./pages/Dashboard/Settings/Settings"));

export default function App() {
    return (
        <MotionConfig reducedMotion="user">
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/divisions" element={<Divisions />} />
                        <Route path="/facilities" element={<Facilities />} />
                        <Route path="/work-order" element={<WorkOrder />} />
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
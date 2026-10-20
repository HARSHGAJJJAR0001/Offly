import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/auth/Login";
import ChangePassword from "../pages/auth/ChangePassword";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Lazy load all pages
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const Departments = lazy(() => import("../pages/admin/Departments"));
const Employees = lazy(() => import("../pages/admin/Employees"));
const AdminLeaveRequests = lazy(() => import("../pages/admin/AdminLeaveRequests"));
const ActivityLogs = lazy(() => import("../pages/admin/ActivityLogs"));
const DepartmentAnalytics = lazy(() => import("../pages/admin/DepartmentAnalytics"));

const ManagerDashboard = lazy(() => import("../pages/manager/ManagerDashboard"));
const DepartmentEmployees = lazy(() => import("../pages/manager/DepartmentEmployees"));
const ManagerLeaveRequests = lazy(() => import("../pages/manager/ManagerLeaveRequests"));

const EmployeeDashboard = lazy(() => import("../pages/employee/EmployeeDashboard"));
const ApplyLeave = lazy(() => import("../pages/employee/ApplyLeave"));
const MyLeaves = lazy(() => import("../pages/employee/MyLeaves"));

const ProfilePage = lazy(() => import("../pages/Shared/ProfilePage"));

function Spinner() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0a0f1e",
      flexDirection: "column", gap: "14px",
    }}>
      <div style={{
        width: "44px", height: "44px", borderRadius: "50%",
        border: "3px solid rgba(20,184,166,0.15)",
        borderTopColor: "#14b8a6",
        animation: "spin 1s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ color: "rgba(100,116,139,0.5)", fontSize: "13px" }}>Loading…</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>

        {/* ── Public ─────────────────────────────────────────────────── */}
        <Route path="/" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Admin only ─────────────────────────────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Departments />
          </ProtectedRoute>
        } />
        <Route path="/admin/employees" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Employees />
          </ProtectedRoute>
        } />
        <Route path="/admin/leaves" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLeaveRequests />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute roles={["admin"]}><DepartmentAnalytics /></ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ActivityLogs />
          </ProtectedRoute>
        } />

        {/* ── Manager only ───────────────────────────────────────────── */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/manager/employees" element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <DepartmentEmployees />
          </ProtectedRoute>
        } />
        <Route path="/manager/leaves" element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerLeaveRequests />
          </ProtectedRoute>
        } />

        {/* ── Employee only ──────────────────────────────────────────── */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employee/apply-leave" element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <ApplyLeave />
          </ProtectedRoute>
        } />
        <Route path="/employee/my-leaves" element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <MyLeaves />
          </ProtectedRoute>
        } />

        {/* ── Shared — all roles ─────────────────────────────────────── */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={["admin", "manager", "employee"]}>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* ── 404 → Login ────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
}
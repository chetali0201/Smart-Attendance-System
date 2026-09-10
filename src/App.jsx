import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import EmployeeLayout from "./components/layout/EmployeeLayout";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeProfile from "./pages/employee/Profile";

import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEmployees from "./pages/admin/Employees";
import AdminEmployeeDetail from "./pages/admin/EmployeeDetail";
import AdminAttendance from "./pages/admin/Attendance";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-400">Loading…</div>;
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Employee routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="profile" element={<EmployeeProfile />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="employees/:id" element={<AdminEmployeeDetail />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="/"
          element={
            <Navigate to={user ? (user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard") : "/login"} replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

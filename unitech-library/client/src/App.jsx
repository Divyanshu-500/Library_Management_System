import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import Login from "./pages/admin/Login";
import ChangePassword from "./pages/admin/ChangePassword";
import Dashboard from "./pages/admin/Dashboard";
import Libraries from "./pages/admin/Libraries";
import Classes from "./pages/admin/Classes";
import Seats from "./pages/admin/Seats";
import Students from "./pages/admin/Students";
import Admissions from "./pages/admin/Admissions";
import Fees from "./pages/admin/Fees";
import Reports from "./pages/admin/Reports";
import AuditLogs from "./pages/admin/AuditLogs";

import Home from "./pages/public/Home";
import PublicLibraries from "./pages/public/Libraries";
import PublicLibraryDetail from "./pages/public/LibraryDetail";
import PublicSeatView from "./pages/public/SeatView";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", fontSize: "14px" } }} />
        <Routes>
          {/* Public site */}
          <Route path="/" element={<Home />} />
          <Route path="/libraries" element={<PublicLibraries />} />
          <Route path="/libraries/:id" element={<PublicLibraryDetail />} />
          <Route path="/classes/:id" element={<PublicSeatView />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected admin panel */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/change-password" element={<ChangePassword />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/libraries" element={<Libraries />} />
              <Route path="/admin/classes" element={<Classes />} />
              <Route path="/admin/seats" element={<Seats />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/admissions" element={<Admissions />} />
              <Route path="/admin/fees" element={<Fees />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

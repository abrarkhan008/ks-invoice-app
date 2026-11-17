import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import { Spinner } from "./components/ui.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Attendance from "./pages/Attendance.jsx";
import Payroll from "./pages/Payroll.jsx";
import TonList from "./pages/TonList.jsx";
import MyPayslips from "./pages/MyPayslips.jsx";
import Leaves from "./pages/Leaves.jsx";
import Chat from "./pages/Chat.jsx";
import MyProfile from "./pages/MyProfile.jsx";

const Documents = lazy(() => import("./App.jsx"));

function Protected({ admin, children }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!session || !profile) return <Navigate to="/login" replace />;
  if (admin && profile.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function Root() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login mode="employee" />} />
          <Route path="/admin-login" element={<Login mode="admin" />} />
          <Route
            element={
              <Protected>
                <Layout />
              </Protected>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="ton" element={<TonList />} />
            <Route path="payslips" element={<MyPayslips />} />
            <Route
              path="employees"
              element={
                <Protected admin>
                  <Employees />
                </Protected>
              }
            />
            <Route
              path="payroll"
              element={
                <Protected admin>
                  <Payroll />
                </Protected>
              }
            />
            <Route
              path="documents"
              element={
                <Protected admin>
                  <Suspense fallback={<Spinner />}>
                    <Documents />
                  </Suspense>
                </Protected>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

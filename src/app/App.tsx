import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import AppLayout from "./layout/AppLayout";
import LoginRoute from "./pages/LoginRoute";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import TimelinePage from "./pages/TimelinePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FocusPage from "./pages/FocusPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin } = useAppData();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppDataProvider>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="focus" element={<FocusPage />} />
          <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="roles" element={<AdminRoute><RolesPage /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppDataProvider>
  );
}

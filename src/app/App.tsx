import { Navigate, Route, Routes } from "react-router";
import { AppDataProvider } from "./context/AppDataContext";
import AppLayout from "./layout/AppLayout";
import LoginRoute from "./pages/LoginRoute";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import TimelinePage from "./pages/TimelinePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FocusPage from "./pages/FocusPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";

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
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppDataProvider>
  );
}

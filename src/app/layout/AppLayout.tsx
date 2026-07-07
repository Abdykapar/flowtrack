import { Navigate, Outlet, useNavigate } from "react-router";
import { useAppData } from "../context/AppDataContext";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

export default function AppLayout() {
  const { booting, currentUser, tasks, logout } = useAppData();
  const navigate = useNavigate();

  if (booting) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0F1115]">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="h-screen w-screen flex bg-background text-foreground overflow-hidden"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      <Sidebar
        onLogout={handleLogout}
        user={currentUser}
        inProgressCount={tasks.filter((t) => t.status === "in-progress").length}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

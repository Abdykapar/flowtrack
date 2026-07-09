import { NavLink } from "react-router";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Timer as TimerIcon,
  Users,
  Zap,
} from "lucide-react";
import type { User } from "@/lib/api";

const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/timeline", label: "Timeline", icon: CalendarDays },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  // { path: "/focus", label: "Focus Mode", icon: TimerIcon },
  { path: "/users", label: "Users", icon: Users },
  { path: "/roles", label: "Roles", icon: Shield },
] as const;

export function Sidebar({
  onLogout,
  user,
  inProgressCount,
}: {
  onLogout: () => void;
  user: User;
  inProgressCount: number;
}) {
  const isAdmin = user.role?.name === "admin";
  const nav = isAdmin ? NAV : NAV.filter((item) => item.path !== "/users" && item.path !== "/roles");

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full border-r border-white/5 bg-[#0D1017]">
      <div className="px-5 h-14 flex items-center gap-2.5 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap size={13} className="text-white" />
        </div>
        <span
          style={{ fontFamily: "Onest, sans-serif" }}
          className="font-semibold text-[15px] text-white tracking-tight"
        >
          FlowTrack
        </span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pt-1 pb-2">
          Workspace
        </p>
        {nav.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-indigo-500/15 text-indigo-300 font-medium"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={14} className={isActive ? "text-indigo-400" : ""} />
                <span className="text-[13px]">{label}</span>
                {path === "/tasks" && inProgressCount > 0 && (
                  <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">
                    {inProgressCount}
                  </span>
                )}
                {path === "/focus" && (
                  <span className="ml-auto text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
                    ●
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 h-px bg-white/5" />

      <div className="px-3 py-3 space-y-0.5">
        {/* <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <Settings size={14} />
          Settings
        </button> */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <LogOut size={14} />
          Sign out
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-all group">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-slate-200 font-medium truncate">
              {user.name} {user.surname}
            </div>
            <div className="text-[10px] text-slate-600 truncate">
              {user.role?.name ?? "No role"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

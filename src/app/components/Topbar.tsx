import { Link, useLocation } from "react-router";
import { Bell, Search, Timer as TimerIcon } from "lucide-react";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Task Board",
  "/timeline": "Timeline",
  "/analytics": "Analytics",
  "/focus": "Focus Mode",
  "/users": "Users",
  "/roles": "Roles",
};

export function Topbar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "FlowTrack";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="h-14 shrink-0 flex items-center gap-4 px-6 border-b border-white/5 bg-[#0F1115]/90 backdrop-blur-md">
      <h1
        style={{ fontFamily: "Onest, sans-serif" }}
        className="text-[15px] font-semibold text-white"
      >
        {title}
      </h1>

      <div className="flex-1 max-w-sm ml-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 border border-white/6 text-slate-500">
          <Search size={12} />
          <input
            placeholder="Search tasks, projects..."
            className="bg-transparent outline-none text-[12px] w-full placeholder:text-slate-600 text-slate-200"
          />
          <kbd className="text-[10px] text-slate-700 font-mono bg-white/5 px-1 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* <Link
          to="/focus"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[12px] font-medium transition-all border border-indigo-500/20"
        >
          <TimerIcon size={11} />
          Focus
        </Link> */}
        {/* <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors text-slate-500 hover:text-slate-200">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-[#0F1115]" />
        </button> */}
        <div
          className="text-[11px] text-slate-600 pl-2 border-l border-white/6"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {today}
        </div>
      </div>
    </header>
  );
}

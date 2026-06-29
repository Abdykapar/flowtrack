import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Timer as TimerIcon,
  Bell,
  Search,
  Plus,
  Play,
  Pause,
  MoreHorizontal,
  Clock,
  AlertCircle,
  Zap,
  Target,
  CheckCircle2,
  Flame,
  Settings,
  X,
  ArrowUpRight,
  Filter,
  RotateCcw,
  Activity,
  Coffee,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  LogOut,
  Users,
  Paperclip,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { LoginPage } from "./components/LoginPage";
import {
  api,
  type Task,
  type DocumentStatus,
  type User,
  type ActivityItem,
  type PlannedVsActualItem,
  type FocusScoreItem,
  type HeatmapItem,
  type CategoryItem,
  setToken,
  clearToken,
} from "../lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type View = "dashboard" | "tasks" | "timeline" | "analytics" | "focus";

type Analytics = {
  activity: ActivityItem[];
  plannedVsActual: PlannedVsActualItem[];
  focusScore: FocusScoreItem[];
  heatmap: HeatmapItem[];
  categories: CategoryItem[];
};

const EMPTY_ANALYTICS: Analytics = {
  activity: [],
  plannedVsActual: [],
  focusScore: [],
  heatmap: [],
  categories: [],
};

// ─── Static timeline data (no API endpoint) ──────────────────────────────────

const TIMELINE_EVENTS = [
  {
    id: 1,
    title: "Топосъемка",
    start: 9,
    duration: 1,
    color: "#6366F1",
    status: "completed",
    task: "Топографическая съемка участка",
  },
  {
    id: 2,
    title: "ЭП и ГП",
    start: 10.5,
    duration: 2.5,
    color: "#F59E0B",
    status: "active",
    task: "Разработка ЭП и ГП/Расчет нагрузок",
  },
  {
    id: 3,
    title: "Геология",
    start: 13,
    duration: 1.5,
    color: "#8B5CF6",
    status: "planned",
    task: "Инженерно-геологические изыскания",
  },
  {
    id: 4,
    title: "АГЗ",
    start: 14.5,
    duration: 2,
    color: "#6366F1",
    status: "planned",
    task: "Разработка АГЗ",
  },
  {
    id: 5,
    title: "Госэкспертиза",
    start: 16.5,
    duration: 1.5,
    color: "#10B981",
    status: "planned",
    task: "Прохождение Госэкспертизы",
  },
];

// ─── Utils ───────────────────────────────────────────────────────────────────

const CHART_COLORS = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#64748B", "#EF4444", "#06B6D4"];

const statusDot = (s: DocumentStatus) =>
  ({
    pending: "#475569",
    "in-progress": "#F59E0B",
    completed: "#10B981",
    overdue: "#EF4444",
  })[s];

const statusBadge = (s: DocumentStatus) =>
  ({
    pending: "bg-slate-500/12 text-slate-400",
    "in-progress": "bg-amber-500/12 text-amber-400",
    completed: "bg-emerald-500/12 text-emerald-400",
    overdue: "bg-red-500/12 text-red-400",
  })[s];

const statusLabel = (s: DocumentStatus) =>
  ({
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    overdue: "Overdue",
  })[s];

const heatColor = (v: number) =>
  v === 0
    ? "bg-white/4"
    : v <= 2
      ? "bg-indigo-900/70"
      : v <= 4
        ? "bg-indigo-700/70"
        : v <= 6
          ? "bg-indigo-500/80"
          : "bg-indigo-400";

function buildHeatmapGrid(items: HeatmapItem[]): number[][] {
  const countMap = new Map(items.map((i) => [i.date, i.count]));
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - dayOfWeek - 6 * 7);
  const weeks: number[][] = [];
  for (let w = 0; w < 7; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + w * 7 + d);
      const key = date.toISOString().split("T")[0];
      week.push(countMap.get(key) ?? 0);
    }
    weeks.push(week);
  }
  return weeks;
}

function fmtDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtChartDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E2330] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && (
        <div className="text-slate-400 mb-1.5 font-medium">{label}</div>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-mono font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "timeline", label: "Timeline", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "focus", label: "Focus Mode", icon: TimerIcon },
] as const;

function Sidebar({
  active,
  set,
  onLogout,
  user,
  inProgressCount,
}: {
  active: View;
  set: (v: View) => void;
  onLogout: () => void;
  user: User;
  inProgressCount: number;
}) {
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
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => set(id as View)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              active === id
                ? "bg-indigo-500/15 text-indigo-300 font-medium"
                : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Icon size={14} className={active === id ? "text-indigo-400" : ""} />
            <span className="text-[13px]">{label}</span>
            {id === "tasks" && inProgressCount > 0 && (
              <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">
                {inProgressCount}
              </span>
            )}
            {id === "focus" && (
              <span className="ml-auto text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
                ●
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mx-3 h-px bg-white/5" />

      <div className="px-3 py-3 space-y-0.5">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <Settings size={14} />
          Settings
        </button>
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
            <div className="text-[12px] text-slate-200 font-medium truncate">{user.name}</div>
            <div className="text-[10px] text-slate-600 truncate">
              {user.planType === "free" ? "Free Plan" : "Pro Plan"} · {user.streak}d streak 🔥
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────────────

function Topbar({ view, onFocus, streak }: { view: View; onFocus: () => void; streak: number }) {
  const titles: Record<View, string> = {
    dashboard: "Dashboard",
    tasks: "Task Board",
    timeline: "Timeline",
    analytics: "Analytics",
    focus: "Focus Mode",
  };
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
        {titles[view]}
      </h1>

      <div className="flex-1 max-w-sm ml-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 border border-white/6 text-slate-500">
          <Search size={12} />
          <input
            placeholder="Search tasks, projects..."
            className="bg-transparent outline-none text-[12px] w-full placeholder:text-slate-600 text-slate-200"
          />
          <kbd className="text-[10px] text-slate-700 font-mono bg-white/5 px-1 rounded">⌘K</kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onFocus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[12px] font-medium transition-all border border-indigo-500/20"
        >
          <TimerIcon size={11} />
          Focus
        </button>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Flame size={11} className="text-amber-400" />
          <span
            className="text-[11px] text-amber-400 font-semibold"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {streak}d
          </span>
        </div>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors text-slate-500 hover:text-slate-200">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-[#0F1115]" />
        </button>
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

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  Icon,
  accent,
  trend,
  up,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: React.ElementType;
  accent: string;
  trend?: string;
  up?: boolean;
}) {
  return (
    <div className="bg-[#171A21] border border-white/6 rounded-xl p-4 flex flex-col gap-3 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
          {label}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={13} />
        </div>
      </div>
      <div>
        <div
          className="text-[26px] font-bold text-white tracking-tight"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {value}
        </div>
        <div className="text-[11px] text-slate-600 mt-0.5">{sub}</div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
          <ArrowUpRight size={11} className={up ? "" : "rotate-180"} />
          {trend}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({
  tasks,
  activity,
  categories,
}: {
  tasks: Task[];
  activity: ActivityItem[];
  categories: CategoryItem[];
}) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const overdue = tasks.filter((t) => t.status === "overdue").length;
  const avgCompletion =
    total > 0
      ? Math.round(tasks.reduce((s, t) => s + t.completionPercent, 0) / total)
      : 0;

  const categoriesWithColor = categories.map((c, i) => ({
    ...c,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed" && t.endDate)
    .sort((a, b) => (a.endDate ?? "").localeCompare(b.endDate ?? ""))
    .slice(0, 5);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={String(total)}
          sub="Across all categories"
          Icon={Layers}
          accent="bg-indigo-500/15 text-indigo-400"
        />
        <StatCard
          label="Completed"
          value={String(completed)}
          sub={`${total > 0 ? Math.round((completed / total) * 100) : 0}% completion rate`}
          Icon={CheckCircle2}
          accent="bg-emerald-500/15 text-emerald-400"
          trend={completed > 0 ? `${completed} done` : undefined}
          up
        />
        <StatCard
          label="Overdue"
          value={String(overdue)}
          sub="Require attention"
          Icon={AlertCircle}
          accent="bg-red-500/15 text-red-400"
          trend={overdue > 0 ? `${overdue} tasks` : undefined}
          up={false}
        />
        <StatCard
          label="Avg Completion"
          value={`${avgCompletion}%`}
          sub="Across all tasks"
          Icon={Target}
          accent="bg-violet-500/15 text-violet-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#171A21] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                style={{ fontFamily: "Onest, sans-serif" }}
                className="text-[14px] font-semibold text-white"
              >
                Weekly Activity
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Tasks completed vs created</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Completed
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-500/50" />
                Created
              </div>
            </div>
          </div>
          {activity.length === 0 ? (
            <div className="h-[175px] flex items-center justify-center text-[12px] text-slate-600">
              No activity data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={175}>
              <AreaChart data={activity} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={fmtChartDay}
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip content={<ChartTip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#6366F1"
                  fill="url(#gC)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#8B5CF6"
                  fill="url(#gN)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[#171A21] border border-white/6 rounded-xl p-5">
          <h3
            style={{ fontFamily: "Onest, sans-serif" }}
            className="text-[14px] font-semibold text-white mb-0.5"
          >
            Categories
          </h3>
          <p className="text-[11px] text-slate-600 mb-4">Task distribution</p>
          {categoriesWithColor.length === 0 ? (
            <div className="h-[130px] flex items-center justify-center text-[12px] text-slate-600">
              No data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={categoriesWithColor}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {categoriesWithColor.map((e, i) => (
                      <Cell key={i} fill={e.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="bg-[#1E2330] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px]">
                          <span className="text-slate-300">{(payload[0] as any).name}</span>
                          <span className="text-white font-mono ml-2 font-semibold">
                            {(payload[0] as any).value}
                          </span>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {categoriesWithColor.slice(0, 5).map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-[11px] text-slate-400 flex-1 truncate">{c.name}</span>
                    <span
                      className="text-[11px] text-white font-semibold"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {c.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#171A21] border border-white/6 rounded-xl p-5">
          <h3
            style={{ fontFamily: "Onest, sans-serif" }}
            className="text-[14px] font-semibold text-white mb-4"
          >
            Task Overview
          </h3>
          <div className="space-y-3">
            {(["pending", "in-progress", "completed", "overdue"] as DocumentStatus[]).map((s) => {
              const count = tasks.filter((t) => t.status === s).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusBadge(s)}`}>
                      {statusLabel(s)}
                    </span>
                    <span
                      className="text-[11px] text-slate-400 font-mono"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: statusDot(s) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#171A21] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3
              style={{ fontFamily: "Onest, sans-serif" }}
              className="text-[14px] font-semibold text-white"
            >
              Upcoming Deadlines
            </h3>
            <button className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              View all <ChevronRight size={10} />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingTasks.length === 0 ? (
              <div className="text-[12px] text-slate-600 text-center py-4">No upcoming deadlines</div>
            ) : (
              upcomingTasks.map((task) => {
                const over = task.endDate ? new Date(task.endDate) < new Date() : false;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/4 transition-colors cursor-pointer"
                  >
                    <div
                      className="w-1 h-9 rounded-full shrink-0"
                      style={{ background: over ? "#EF4444" : statusDot(task.status) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-slate-200 font-medium truncate">{task.title}</p>
                      <p
                        className={`text-[10px] font-mono mt-0.5 ${over ? "text-red-400" : "text-slate-600"}`}
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {over ? "⚠ Overdue · " : ""}{fmtDate(task.endDate)}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono shrink-0">
                      {task.deadlineDays}d
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ───────────────────────────────────────────────────────────────

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const isOverdue =
    task.status === "overdue" ||
    (task.endDate && new Date(task.endDate) < new Date() && task.status !== "completed");

  return (
    <div
      onClick={onClick}
      className="bg-[#171A21] border border-white/6 rounded-xl p-3.5 cursor-pointer hover:border-indigo-500/30 hover:bg-[#1C1F28] transition-all group select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <h4 className="text-[12px] font-medium text-slate-200 leading-relaxed flex-1">
          {task.title}
        </h4>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-slate-300 p-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={12} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {task.category && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 truncate max-w-[160px]">
            {task.category.name}
          </span>
        )}
        {task.isParallel && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
            Parallel
          </span>
        )}
      </div>

      {task.completionPercent > 0 && (
        <div className="mb-3">
          <div className="h-1 bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${task.completionPercent}%` }}
            />
          </div>
          <div
            className="text-[10px] text-slate-600 mt-1"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {task.completionPercent}% complete
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {task.executorGO && (
            <div
              className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-300 shrink-0"
              title={`GO: ${task.executorGO}`}
            >
              {task.executorGO.slice(0, 2).toUpperCase()}
            </div>
          )}
          {task.executorNurzaman && (
            <div
              className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-[8px] font-bold text-violet-300 shrink-0"
              title={task.executorNurzaman}
            >
              {task.executorNurzaman.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-slate-600"}`}>
          <Clock size={9} />
          <span className="text-[10px]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {task.endDate ? fmtDate(task.endDate) : `${task.deadlineDays}d`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Board ────────────────────────────────────────────────────────────

function KanbanBoard({
  tasks,
  onTaskClick,
  onStatusChange,
  onDelete,
  onCreate,
}: {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  onStatusChange: (id: number, status: DocumentStatus) => void;
  onDelete: (id: number) => void;
  onCreate: (data: Omit<Task, "id" | "category">) => void;
}) {
  const cols: { id: DocumentStatus; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "in-progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
    { id: "overdue", label: "Overdue" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all">
          <Filter size={11} />
          Filter
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all">
          <SlidersHorizontal size={11} />
          Sort
        </button>
        <div
          className="ml-auto text-[11px] text-slate-600"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {tasks.length} tasks total
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-6 overflow-x-auto overflow-y-hidden">
        {cols.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="w-[256px] shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: statusDot(col.id) }}
                  />
                  <span
                    className="text-[12px] font-semibold text-slate-300"
                    style={{ fontFamily: "Onest, sans-serif" }}
                  >
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded-md">
                    {colTasks.length}
                  </span>
                </div>
                <button className="text-slate-600 hover:text-slate-300 transition-colors p-1 hover:bg-white/5 rounded-md">
                  <Plus size={12} />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
                {colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}
                {colTasks.length === 0 && (
                  <div className="h-20 border border-dashed border-white/8 rounded-xl flex items-center justify-center">
                    <span className="text-[11px] text-slate-700">Drop here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={async () => {
          const title = window.prompt("New task title:");
          if (!title?.trim()) return;
          await onCreate({
            title: title.trim(),
            deadlineDays: 14,
            startDate: null,
            endDate: null,
            completionPercent: 0,
            status: "pending",
            executorGO: null,
            executorNurzaman: null,
            comment: null,
            isParallel: false,
            parallelGroupId: null,
            attachments: [],
            orderIndex: 0,
          });
        }}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl text-white text-[13px] font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] transition-all"
        style={{ fontFamily: "Onest, sans-serif" }}
      >
        <Plus size={14} />
        New Task
      </button>
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function TimelineView() {
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  const now = new Date();
  const curH = now.getHours() + now.getMinutes() / 60;
  const [zoom, setZoom] = useState<"day" | "week" | "month">("day");

  const fmtHour = (h: number) =>
    h > 12 ? `${h - 12}pm` : h === 12 ? "12pm" : `${h}am`;

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-white/4 rounded-lg border border-white/6">
          {(["day", "week", "month"] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all ${zoom === z ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-200"}`}
            >
              {z}
            </button>
          ))}
        </div>
        <div
          style={{ fontFamily: "Onest, sans-serif" }}
          className="text-[13px] font-medium text-slate-300"
        >
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Completed
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Active
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            Planned
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#171A21] border border-white/6 rounded-xl overflow-hidden flex flex-col">
        <div className="flex border-b border-white/5 bg-[#13161E]">
          <div className="w-40 shrink-0 px-4 py-2.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
            Task
          </div>
          <div className="flex-1 flex">
            {hours.slice(0, -1).map((h) => (
              <div
                key={h}
                className="flex-1 text-center py-2.5 text-[10px] text-slate-700 border-l border-white/4"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {fmtHour(h)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative">
          {curH >= 8 && curH <= 20 && (
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{ left: `calc(${((curH - 8) / 12) * 100}% + 10rem)` }}
            >
              <div className="w-px h-full bg-red-500/60" />
              <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
            </div>
          )}

          {TIMELINE_EVENTS.map((event) => {
            const left = ((event.start - 8) / 12) * 100;
            const width = (event.duration / 12) * 100;
            const isActive = event.status === "active";
            const isDone = event.status === "completed";
            return (
              <div
                key={event.id}
                className="flex items-center border-b border-white/4 hover:bg-white/2 transition-colors min-h-[52px]"
              >
                <div className="w-40 shrink-0 px-4 py-3">
                  <div className="text-[12px] text-slate-300 font-medium truncate">{event.title}</div>
                  <div
                    className="text-[10px] text-slate-700 mt-0.5"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {fmtHour(Math.floor(event.start))} — {fmtHour(Math.floor(event.start + event.duration))}
                  </div>
                </div>
                <div className="flex-1 relative h-full flex items-center px-1 py-2">
                  <div className="w-full relative h-9">
                    <div
                      className={`absolute h-full rounded-lg flex items-center px-2.5 overflow-hidden transition-all ${isActive ? "ring-1 ring-amber-400/40" : ""}`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 6)}%`,
                        background: `${event.color}22`,
                        borderLeft: `2px solid ${event.color}${isDone ? "90" : "cc"}`,
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                        )}
                        {isDone && (
                          <CheckCircle2 size={9} className="text-emerald-400 shrink-0" />
                        )}
                        <span
                          className="text-[10px] font-medium truncate"
                          style={{ color: event.color, fontFamily: "DM Sans, sans-serif" }}
                        >
                          {event.task}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center border-b border-white/3 min-h-[52px]">
              <div className="w-40 shrink-0 px-4 py-3">
                <div className="h-2 w-20 bg-white/4 rounded" />
              </div>
              <div className="flex-1 px-1 py-2 flex items-center">
                <div className="flex-1 h-9 border border-dashed border-white/6 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] text-slate-700">Drop task here</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics ───────────────────────────────────────────────────────────────

function AnalyticsView({
  activity,
  plannedVsActual,
  focusScore,
  heatmap,
  categories,
}: {
  activity: ActivityItem[];
  plannedVsActual: PlannedVsActualItem[];
  focusScore: FocusScoreItem[];
  heatmap: HeatmapItem[];
  categories: CategoryItem[];
}) {
  const heatmapGrid = buildHeatmapGrid(heatmap);
  const categoriesWithColor = categories.map((c, i) => ({
    ...c,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Planned vs Actual */}
        <div className="bg-[#171A21] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ fontFamily: "Onest, sans-serif" }} className="text-[14px] font-semibold text-white">
                Planned vs Completion
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Days planned & avg completion %</p>
            </div>
            <div className="flex gap-3 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Planned Days
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Avg Completion
              </div>
            </div>
          </div>
          {plannedVsActual.length === 0 ? (
            <div className="h-[190px] flex items-center justify-center text-[12px] text-slate-600">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={plannedVsActual} barGap={3} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="plannedDays" name="Planned Days" fill="#6366F1" opacity={0.75} radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgCompletion" name="Avg Completion" fill="#10B981" opacity={0.8} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Focus Score */}
        <div className="bg-[#171A21] border border-white/6 rounded-xl p-5">
          <h3 style={{ fontFamily: "Onest, sans-serif" }} className="text-[14px] font-semibold text-white mb-0.5">
            Daily Focus Score
          </h3>
          <p className="text-[11px] text-slate-600 mb-5">Efficiency from focus sessions</p>
          {focusScore.length === 0 ? (
            <div className="h-[190px] flex items-center justify-center text-[12px] text-slate-600">
              No focus sessions yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={focusScore} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="day"
                  tickFormatter={fmtChartDay}
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-[#1E2330] border border-white/10 rounded-lg px-3 py-2 text-[11px] shadow-xl">
                        <span className="text-slate-400">{fmtChartDay(label ?? "")}: </span>
                        <span className="text-violet-400 font-mono font-bold">{(payload[0] as any).value}%</span>
                      </div>
                    ) : null
                  }
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: "#8B5CF6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-[#171A21] border border-white/6 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontFamily: "Onest, sans-serif" }} className="text-[14px] font-semibold text-white">
              Productivity Heatmap
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">Tasks completed — last 7 weeks by day</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <span>Less</span>
            {["bg-white/4", "bg-indigo-900/70", "bg-indigo-700/70", "bg-indigo-500/80", "bg-indigo-400"].map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, di) => (
            <div key={di} className="flex-1 flex flex-col gap-1.5">
              <div className="text-[9px] text-slate-700 text-center font-mono">{d}</div>
              {heatmapGrid.map((week, wi) => (
                <div
                  key={wi}
                  title={`${week[di]} tasks`}
                  className={`h-4 rounded-sm ${heatColor(week[di])} hover:ring-1 hover:ring-indigo-400/40 cursor-default transition-all`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Activity + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#171A21] border border-white/6 rounded-xl p-5">
          <h3 style={{ fontFamily: "Onest, sans-serif" }} className="text-[14px] font-semibold text-white mb-4">
            Daily Activity
          </h3>
          {activity.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-[12px] text-slate-600">
              No activity data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={activity} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={fmtChartDay}
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip content={<ChartTip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#6366F1"
                  fill="url(#gA)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[#171A21] border border-white/6 rounded-xl p-5">
          <h3 style={{ fontFamily: "Onest, sans-serif" }} className="text-[14px] font-semibold text-white mb-4">
            Category Breakdown
          </h3>
          {categoriesWithColor.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-[12px] text-slate-600">
              No categories yet
            </div>
          ) : (
            <div className="space-y-2.5">
              {categoriesWithColor.map((c) => {
                const total = categoriesWithColor.reduce((s, x) => s + x.value, 0);
                const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                        <span className="text-[11px] text-slate-400 truncate max-w-[160px]">{c.name}</span>
                      </div>
                      <span className="text-[11px] text-white font-mono">{c.value} ({pct}%)</span>
                    </div>
                    <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Focus Timer ──────────────────────────────────────────────────────────────

function FocusTimer({ tasks }: { tasks: Task[] }) {
  const POMODORO = 25 * 60;
  const [secs, setSecs] = useState(POMODORO);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selected, setSelected] = useState<Task | undefined>(undefined);
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const elapsedSecsRef = React.useRef(0);

  useEffect(() => {
    if (!selected) {
      const first = tasks.find((t) => t.status !== "completed");
      if (first) setSelected(first);
    }
  }, [tasks]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      elapsedSecsRef.current += 1;
      setSecs((s) => {
        if (s <= 1) {
          setRunning(false);
          if (phase === "focus") {
            setSessions((n) => n + 1);
            if (activeSessionId !== null) {
              const mins = Math.round(elapsedSecsRef.current / 60);
              api.focusSessions.update(activeSessionId, {
                endTime: new Date().toISOString(),
                durationMin: mins,
              }).catch(() => {});
              setActiveSessionId(null);
              elapsedSecsRef.current = 0;
            }
          }
          return POMODORO;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, activeSessionId]);

  const handlePlayPause = async () => {
    if (!running && phase === "focus" && activeSessionId === null) {
      try {
        const session = await api.focusSessions.create(selected?.id);
        setActiveSessionId(session.id);
        elapsedSecsRef.current = 0;
      } catch {
        // proceed with local timer even if API fails
      }
    } else if (running && activeSessionId !== null) {
      try {
        await api.focusSessions.update(activeSessionId, { paused: true });
      } catch {
        // ignore
      }
    }
    setRunning((r) => !r);
  };

  const handleReset = async () => {
    if (activeSessionId !== null) {
      const mins = Math.round(elapsedSecsRef.current / 60);
      try {
        await api.focusSessions.update(activeSessionId, {
          endTime: new Date().toISOString(),
          durationMin: mins,
        });
      } catch {
        // ignore
      }
      setActiveSessionId(null);
      elapsedSecsRef.current = 0;
    }
    setSecs(POMODORO);
    setRunning(false);
  };

  const mm = Math.floor(secs / 60).toString().padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");
  const pct = (secs / POMODORO) * 100;
  const R = 90;
  const C = 2 * Math.PI * R;

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-7 bg-gradient-to-b from-[#0C0F14] via-[#0F1115] to-[#0F1115]">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${running ? "bg-indigo-400 animate-pulse" : "bg-indigo-700"}`} />
          <span
            className="text-[12px] text-indigo-300 font-medium"
            style={{ fontFamily: "Onest, sans-serif" }}
          >
            {phase === "focus" ? "Focus Session" : "Short Break"}
          </span>
        </div>

        <div className="relative">
          <svg width="228" height="228" className="-rotate-90">
            <circle cx="114" cy="114" r={R} stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="none" />
            <circle
              cx="114"
              cy="114"
              r={R}
              stroke="url(#tGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (pct / 100) * C}
              style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }}
            />
            <defs>
              <linearGradient id="tGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-[52px] font-bold text-white tracking-tight leading-none"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {mm}:{ss}
            </div>
            <div className="text-[11px] text-slate-600 mt-2 font-mono">remaining</div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-600 mb-1.5">Currently working on</p>
          <h2 className="text-[16px] font-semibold text-white" style={{ fontFamily: "Onest, sans-serif" }}>
            {selected?.title ?? "No task selected"}
          </h2>
          {selected?.category && (
            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {selected.category.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white/6 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-[68px] h-[68px] rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/35 hover:shadow-indigo-500/55 hover:scale-[1.04] active:scale-[0.97] transition-all"
          >
            {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button
            onClick={() => {
              setPhase((p) => (p === "focus" ? "break" : "focus"));
              handleReset();
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white/6 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Coffee size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i < sessions % 4 ? "bg-indigo-400 scale-110" : "bg-white/10"}`}
            />
          ))}
          <span className="text-[11px] text-slate-600 ml-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {sessions} sessions today
          </span>
        </div>
      </div>

      <div className="w-[240px] border-l border-white/5 bg-[#0D1017] flex flex-col">
        <div className="p-4 border-b border-white/5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Select Task</p>
          <div className="space-y-1.5">
            {tasks
              .filter((t) => t.status !== "completed")
              .slice(0, 5)
              .map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelected(task)}
                  className={`w-full text-left p-2.5 rounded-lg text-[12px] transition-all ${
                    selected?.id === task.id
                      ? "bg-indigo-500/15 border border-indigo-500/25 text-indigo-200"
                      : "hover:bg-white/5 text-slate-400 border border-transparent"
                  }`}
                >
                  <div className="font-medium text-slate-200 truncate">{task.title}</div>
                  {task.category && (
                    <div className="text-[10px] text-slate-600 mt-0.5 truncate">{task.category.name}</div>
                  )}
                </button>
              ))}
          </div>
        </div>

        <div className="p-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Session Stats</p>
          <div className="space-y-3">
            {[
              { label: "Pomodoros", value: String(sessions) },
              { label: "Focus Time", value: `${sessions * 25}min` },
              { label: "Break Time", value: `${Math.floor(sessions / 4) * 15 + (sessions % 4) * 5}min` },
              { label: "Task Progress", value: `${selected?.completionPercent ?? 0}%` },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{s.label}</span>
                <span
                  className="text-[11px] text-white font-semibold"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Today&apos;s Goal</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  style={{ width: `${(sessions / 8) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-600 font-mono">{sessions}/8</span>
            </div>
            <p className="text-[10px] text-slate-700">{8 - Math.min(sessions, 8)} sessions to daily goal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

function TaskModal({
  task,
  onClose,
  onMarkDone,
  onStatusChange,
}: {
  task: Task;
  onClose: () => void;
  onMarkDone: (id: number) => void;
  onStatusChange: (id: number, status: DocumentStatus) => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#171A21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 style={{ fontFamily: "Onest, sans-serif" }} className="text-[16px] font-semibold text-white">
                {task.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusBadge(task.status)}`}>
                  {statusLabel(task.status)}
                </span>
                {task.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {task.category.name}
                  </span>
                )}
                {task.isParallel && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    Parallel
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-300 transition-colors p-1 hover:bg-white/6 rounded-lg"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/4 border border-white/6">
              <div className="text-[10px] text-slate-600 mb-1">Start Date</div>
              <div className="text-[13px] font-bold text-white" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                {fmtDate(task.startDate)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/4 border border-white/6">
              <div className="text-[10px] text-slate-600 mb-1">End Date</div>
              <div
                className={`text-[13px] font-bold ${task.endDate && new Date(task.endDate) < new Date() && task.status !== "completed" ? "text-red-400" : "text-white"}`}
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {fmtDate(task.endDate)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/4 border border-white/6">
              <div className="text-[10px] text-slate-600 mb-1">Deadline</div>
              <div className="text-[13px] font-bold text-white" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                {task.deadlineDays}d
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500">Completion</span>
              <span
                className="text-[11px] text-white font-semibold"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {task.completionPercent}%
              </span>
            </div>
            <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${task.completionPercent}%` }}
              />
            </div>
          </div>

          {/* Executors */}
          {(task.executorGO || task.executorNurzaman) && (
            <div className="flex items-center gap-2">
              <Users size={12} className="text-slate-600 shrink-0" />
              <div className="flex flex-wrap gap-2">
                {task.executorGO && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center text-[8px] font-bold text-indigo-300">
                      {task.executorGO.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] text-indigo-300">{task.executorGO}</span>
                  </div>
                )}
                {task.executorNurzaman && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="w-4 h-4 rounded-full bg-violet-500/30 flex items-center justify-center text-[8px] font-bold text-violet-300">
                      {task.executorNurzaman.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] text-violet-300">{task.executorNurzaman}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comment */}
          {task.comment && (
            <div className="p-3 rounded-xl bg-white/4 border border-white/6">
              <div className="text-[10px] text-slate-600 mb-1.5 flex items-center gap-1">
                <AlertCircle size={9} />
                Comment
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed">{task.comment}</p>
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Paperclip size={11} />
              <span>{task.attachments.length} attachment{task.attachments.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between bg-[#13161E]">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 text-[12px] text-slate-400 hover:text-slate-200 transition-all">
            <MoreHorizontal size={12} />
            More
          </button>
          <div className="flex items-center gap-2">
            {task.status === "pending" && (
              <button
                onClick={() => { onStatusChange(task.id, "in-progress"); onClose(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/12 hover:bg-amber-500/20 text-[12px] text-amber-400 border border-amber-500/20 transition-all"
              >
                <Activity size={10} />
                Start Work
              </button>
            )}
            {task.status !== "completed" && (
              <button
                onClick={() => onMarkDone(task.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-[12px] text-white transition-all font-medium"
              >
                <CheckCircle2 size={10} />
                Mark Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

import React from "react";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [taskModal, setTaskModal] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>(EMPTY_ANALYTICS);
  const [booting, setBooting] = useState(true);

  async function loadAnalytics() {
    const [activity, plannedVsActual, focusScore, heatmap, categories] = await Promise.all([
      api.analytics.activity(),
      api.analytics.plannedVsActual(),
      api.analytics.focusScore(),
      api.analytics.heatmap(),
      api.analytics.categories(),
    ]);
    setAnalytics({ activity, plannedVsActual, focusScore, heatmap, categories });
  }

  useEffect(() => {
    const token = localStorage.getItem("ft_token");
    if (!token) { setBooting(false); return; }
    api.auth.me()
      .then((user) => {
        setCurrentUser(user);
        return Promise.all([api.tasks.list(), loadAnalytics()]);
      })
      .then(([tasks]) => setTasks(tasks as Task[]))
      .catch(() => clearToken())
      .finally(() => setBooting(false));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    api.tasks.list().then(setTasks);
    loadAnalytics().catch(() => {});
  };

  const handleLogout = () => {
    api.auth.logout().catch(() => {});
    clearToken();
    setCurrentUser(null);
    setTasks([]);
    setAnalytics(EMPTY_ANALYTICS);
  };

  const handleMarkDone = (id: number) => {
    api.tasks.setStatus(id, "completed").then((updated) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setTaskModal(null);
    });
  };

  const handleStatusChange = (id: number, status: DocumentStatus) => {
    api.tasks.setStatus(id, status).then((updated) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    );
  };

  const handleDelete = (id: number) => {
    api.tasks.remove(id).then(() =>
      setTasks((prev) => prev.filter((t) => t.id !== id))
    );
  };

  const handleCreate = (data: Omit<Task, "id" | "category">) => {
    api.tasks.create(data).then((created) =>
      setTasks((prev) => [...prev, created])
    );
  };

  if (booting) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0F1115]">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div
      className="h-screen w-screen flex bg-background text-foreground overflow-hidden"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      <Sidebar
        active={view}
        set={setView}
        onLogout={handleLogout}
        user={currentUser}
        inProgressCount={tasks.filter((t) => t.status === "in-progress").length}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar view={view} onFocus={() => setView("focus")} streak={currentUser.streak} />
        <main className="flex-1 overflow-hidden">
          {view === "dashboard" && (
            <Dashboard
              tasks={tasks}
              activity={analytics.activity}
              categories={analytics.categories}
            />
          )}
          {view === "tasks" && (
            <KanbanBoard
              tasks={tasks}
              onTaskClick={setTaskModal}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onCreate={handleCreate}
            />
          )}
          {view === "timeline" && <TimelineView />}
          {view === "analytics" && (
            <AnalyticsView
              activity={analytics.activity}
              plannedVsActual={analytics.plannedVsActual}
              focusScore={analytics.focusScore}
              heatmap={analytics.heatmap}
              categories={analytics.categories}
            />
          )}
          {view === "focus" && <FocusTimer tasks={tasks} />}
        </main>
      </div>

      {taskModal && (
        <TaskModal
          task={taskModal}
          onClose={() => setTaskModal(null)}
          onMarkDone={handleMarkDone}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

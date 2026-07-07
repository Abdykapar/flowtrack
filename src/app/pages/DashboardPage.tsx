import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Layers,
  Target,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DocumentStatus } from "@/lib/api";
import { useAppData } from "../context/AppDataContext";
import { StatCard } from "../components/StatCard";
import { ChartTip } from "../components/ChartTooltip";
import { CHART_COLORS, fmtChartDay, fmtDate, statusBadge, statusDot, statusLabel } from "../lib/format";

export default function DashboardPage() {
  const { tasks, analytics } = useAppData();
  const { activity, categories } = analytics;

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

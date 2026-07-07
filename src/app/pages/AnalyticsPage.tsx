import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppData } from "../context/AppDataContext";
import { ChartTip } from "../components/ChartTooltip";
import { CHART_COLORS, buildHeatmapGrid, fmtChartDay, heatColor } from "../lib/format";

export default function AnalyticsPage() {
  const { analytics } = useAppData();
  const { activity, plannedVsActual, focusScore, heatmap, categories } = analytics;

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

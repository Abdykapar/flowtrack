import type { DocumentStatus, HeatmapItem } from "@/lib/api";

export const CHART_COLORS = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#64748B", "#EF4444", "#06B6D4"];

export const statusDot = (s: DocumentStatus) =>
  ({
    pending: "#475569",
    "in-progress": "#F59E0B",
    completed: "#10B981",
    overdue: "#EF4444",
  })[s];

export const statusBadge = (s: DocumentStatus) =>
  ({
    pending: "bg-slate-500/12 text-slate-400",
    "in-progress": "bg-amber-500/12 text-amber-400",
    completed: "bg-emerald-500/12 text-emerald-400",
    overdue: "bg-red-500/12 text-red-400",
  })[s];

export const statusLabel = (s: DocumentStatus) =>
  ({
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    overdue: "Overdue",
  })[s];

export const heatColor = (v: number) =>
  v === 0
    ? "bg-white/4"
    : v <= 2
      ? "bg-indigo-900/70"
      : v <= 4
        ? "bg-indigo-700/70"
        : v <= 6
          ? "bg-indigo-500/80"
          : "bg-indigo-400";

export function buildHeatmapGrid(items: HeatmapItem[]): number[][] {
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

export function fmtDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtChartDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

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

export default function TimelinePage() {
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

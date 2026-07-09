import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { TaskModal } from "../components/TaskModal";
import { TaskFormModal } from "../components/TaskFormModal";
import { statusDot } from "../lib/format";

type Zoom = "week" | "month" | "year";

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  return addDays(d, diff);
}

function diffDays(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function atMidnight(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TimelinePage() {
  const {
    tasks,
    users,
    isAdmin,
    taskModal,
    taskForm,
    openTaskModal,
    closeTaskModal,
    openEditForm,
    closeTaskForm,
    markDone,
    setStatus,
    deleteTask,
    submitTaskForm,
    uploadAttachment,
    removeAttachment,
  } = useAppData();

  const [zoom, setZoom] = useState<Zoom>("week");
  const today = useMemo(() => atMidnight(new Date()), []);
  const [cursor, setCursor] = useState(today);

  const { rangeStart, rangeDays, columns } = useMemo(() => {
    if (zoom === "week") {
      const start = startOfWeek(cursor);
      const cols = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i);
        return { label: d.toLocaleDateString("en-US", { weekday: "short" }), sub: String(d.getDate()), days: 1 };
      });
      return { rangeStart: start, rangeDays: 7, columns: cols };
    }
    if (zoom === "month") {
      const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const total = daysInMonth(cursor.getFullYear(), cursor.getMonth());
      const cols = Array.from({ length: total }, (_, i) => ({
        label: String(i + 1),
        sub: "",
        days: 1,
      }));
      return { rangeStart: start, rangeDays: total, columns: cols };
    }
    const start = new Date(cursor.getFullYear(), 0, 1);
    const cols = Array.from({ length: 12 }, (_, m) => {
      const days = daysInMonth(cursor.getFullYear(), m);
      const label = new Date(cursor.getFullYear(), m, 1).toLocaleDateString("en-US", { month: "short" });
      return { label, sub: "", days };
    });
    const total = cols.reduce((sum, c) => sum + c.days, 0);
    return { rangeStart: start, rangeDays: total, columns: cols };
  }, [zoom, cursor]);

  const todayIndex = diffDays(today, rangeStart);

  const navigate = (dir: 1 | -1) => {
    setCursor((prev) => {
      if (zoom === "week") return addDays(prev, 7 * dir);
      if (zoom === "month") return new Date(prev.getFullYear(), prev.getMonth() + dir, 1);
      return new Date(prev.getFullYear() + dir, 0, 1);
    });
  };

  const headerLabel =
    zoom === "week"
      ? `${rangeStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${addDays(rangeStart, rangeDays - 1).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : zoom === "month"
        ? cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : String(cursor.getFullYear());

  const dated = useMemo(
    () =>
      tasks
        .filter((t) => t.startDate && t.endDate)
        .map((t) => {
          const start = atMidnight(new Date(t.startDate as string));
          const endRaw = atMidnight(new Date(t.endDate as string));
          return { task: t, start, end: endRaw < start ? start : endRaw };
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [tasks]
  );

  const visible = dated
    .map(({ task, start, end }) => {
      const startIdx = Math.max(0, diffDays(start, rangeStart));
      const endIdxExclusive = Math.min(rangeDays, diffDays(end, rangeStart) + 1);
      if (endIdxExclusive <= 0 || startIdx >= rangeDays) return null;
      return {
        task,
        left: (startIdx / rangeDays) * 100,
        width: ((endIdxExclusive - startIdx) / rangeDays) * 100,
        rangeLabel: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-white/4 rounded-lg border border-white/6">
          {(["week", "month", "year"] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all ${zoom === z ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-200"}`}
            >
              {z}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/6 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setCursor(today)}
            style={{ fontFamily: "Onest, sans-serif" }}
            className="text-[13px] font-medium text-slate-300 hover:text-white transition-colors min-w-[160px] text-center"
          >
            {headerLabel}
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/6 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Completed
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            In Progress
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            Overdue
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            Pending
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#171A21] border border-white/6 rounded-xl overflow-hidden flex flex-col">
        <div className="flex border-b border-white/5 bg-[#13161E]">
          <div className="w-44 shrink-0 px-4 py-2.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
            Task
          </div>
          <div className="flex-1 flex">
            {columns.map((col, i) => (
              <div
                key={i}
                style={{ width: `${(col.days / rangeDays) * 100}%`, fontFamily: "JetBrains Mono, monospace" }}
                className="text-center py-2.5 text-[10px] text-slate-700 border-l border-white/4 truncate"
              >
                {col.label}
                {col.sub && <span className="text-slate-800">{" "}{col.sub}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative">
          {todayIndex >= 0 && todayIndex < rangeDays && (
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{ left: `calc(${((todayIndex + 0.5) / rangeDays) * 100}% + 11rem)` }}
            >
              <div className="w-px h-full bg-red-500/60" />
              <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
            </div>
          )}

          {visible.length === 0 && (
            <div className="flex items-center justify-center h-32 text-[12px] text-slate-600">
              No scheduled tasks in this range
            </div>
          )}

          {visible.map(({ task, left, width, rangeLabel }) => {
            const isDone = task.status === "completed";
            const isActive = task.status === "in-progress";
            const isOverdue = task.status === "overdue";
            const color = statusDot(task.status);
            return (
              <div
                key={task.id}
                onClick={() => openTaskModal(task)}
                className="flex items-center border-b border-white/4 hover:bg-white/2 transition-colors min-h-[52px] cursor-pointer"
              >
                <div className="w-44 shrink-0 px-4 py-3 min-w-0">
                  <div className="text-[12px] text-slate-300 font-medium truncate">{task.title}</div>
                  <div
                    className="text-[10px] text-slate-700 mt-0.5"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {rangeLabel}
                  </div>
                </div>
                <div className="flex-1 relative h-full flex items-center px-1 py-2">
                  <div className="w-full relative h-9">
                    <div
                      className={`absolute h-full rounded-lg flex items-center px-2.5 overflow-hidden transition-all ${isActive ? "ring-1 ring-amber-400/40" : isOverdue ? "ring-1 ring-red-400/40" : ""}`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 2)}%`,
                        background: `${color}22`,
                        borderLeft: `2px solid ${color}${isDone ? "90" : "cc"}`,
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
                          style={{ color, fontFamily: "DM Sans, sans-serif" }}
                        >
                          {task.category?.name ?? task.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {taskModal && (
        <TaskModal
          task={taskModal}
          onClose={closeTaskModal}
          onMarkDone={markDone}
          onStatusChange={setStatus}
          onEdit={openEditForm}
          onDelete={deleteTask}
          onUploadAttachment={uploadAttachment}
          onRemoveAttachment={removeAttachment}
          canManage={isAdmin}
        />
      )}

      {isAdmin && taskForm && (
        <TaskFormModal
          mode={taskForm.mode}
          task={taskForm.task}
          users={users}
          onClose={closeTaskForm}
          onSubmit={submitTaskForm}
        />
      )}
    </div>
  );
}

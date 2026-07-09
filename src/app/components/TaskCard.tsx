import { Clock, Trash2 } from "lucide-react";
import type { Task } from "@/lib/api";
import { fmtDate } from "../lib/format";

export function TaskCard({
  task,
  onClick,
  onDelete,
  canDelete,
}: {
  task: Task;
  onClick: () => void;
  onDelete: (id: number) => void;
  canDelete: boolean;
}) {
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
        {canDelete && (
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 p-0.5 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete task "${task.title}"?`)) onDelete(task.id);
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
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
        {task.assignee && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/6 text-slate-400 border border-white/10 truncate max-w-[160px]">
            {task.assignee.name} {task.assignee.surname}
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

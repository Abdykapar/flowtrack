import { Filter, Plus, SlidersHorizontal } from "lucide-react";
import type { DocumentStatus, Task } from "@/lib/api";
import { statusDot } from "../lib/format";
import { TaskCard } from "./TaskCard";

export function KanbanBoard({
  tasks,
  onTaskClick,
  onDelete,
  onAddClick,
  canManage,
}: {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  onDelete: (id: number) => void;
  onAddClick: () => void;
  canManage: boolean;
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
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onDelete={onDelete}
                    canDelete={canManage}
                  />
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

      {canManage && (
        <button
          onClick={onAddClick}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl text-white text-[13px] font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] transition-all"
          style={{ fontFamily: "Onest, sans-serif" }}
        >
          <Plus size={14} />
          New Task
        </button>
      )}
    </div>
  );
}

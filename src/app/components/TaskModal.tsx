import {
  Activity,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { DocumentStatus, Task } from "@/lib/api";
import { fmtDate, statusBadge, statusLabel } from "../lib/format";

export function TaskModal({
  task,
  onClose,
  onMarkDone,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onMarkDone: (id: number) => void;
  onStatusChange: (id: number, status: DocumentStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
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
                {task.assignee && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-slate-400 border border-white/10">
                    {task.assignee.name} {task.assignee.surname}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="text-slate-600 hover:text-slate-300 transition-colors p-1 hover:bg-white/6 rounded-lg"
                title="Edit task"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete task "${task.title}"?`)) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="text-slate-600 hover:text-red-400 transition-colors p-1 hover:bg-white/6 rounded-lg"
                title="Delete task"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={onClose}
                className="text-slate-600 hover:text-slate-300 transition-colors p-1 hover:bg-white/6 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>
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
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mb-1">
                <Paperclip size={10} />
                <span>{task.attachments.length} attachment{task.attachments.length !== 1 ? "s" : ""}</span>
              </div>
              {task.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/4 border border-white/6 hover:border-white/12 transition-all text-[12px] text-slate-300"
                >
                  <Paperclip size={12} className="text-slate-500 shrink-0" />
                  <span className="truncate">{att}</span>
                </a>
              ))}
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

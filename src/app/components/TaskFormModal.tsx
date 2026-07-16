import { useState } from "react";
import { X } from "lucide-react";
import type { DocumentStatus, Task, User } from "@/lib/api";

type TaskFormData = Omit<Task, "id" | "category" | "assignee" | "attachments">;

interface TaskFormModalProps {
  mode: "create" | "edit";
  task?: Task;
  users: User[];
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void> | void;
}

const STATUS_OPTIONS: DocumentStatus[] = ["pending", "in-progress", "completed", "overdue"];

const inputClass =
  "w-full bg-[#1E2330] border border-white/8 rounded-lg px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

export function TaskFormModal({ mode, task, users, onClose, onSubmit }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [status, setStatus] = useState<DocumentStatus>(task?.status ?? "pending");
  const [assigneeId, setAssigneeId] = useState<string>(task?.assignee?.id != null ? String(task.assignee.id) : "");
  const [startDate, setStartDate] = useState(task?.startDate?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(task?.endDate?.slice(0, 10) ?? "");
  const [deadlineDays, setDeadlineDays] = useState(String(task?.deadlineDays ?? 14));
  const [completionPercent, setCompletionPercent] = useState(String(task?.completionPercent ?? 0));
  const [executorGO, setExecutorGO] = useState(task?.executorGO ?? "");
  const [executorNurzaman, setExecutorNurzaman] = useState(task?.executorNurzaman ?? "");
  const [comment, setComment] = useState(task?.comment ?? "");
  const [isParallel, setIsParallel] = useState(task?.isParallel ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        status,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        deadlineDays: Number(deadlineDays) || 0,
        completionPercent: Math.min(100, Math.max(0, Number(completionPercent) || 0)),
        executorGO: executorGO.trim() || null,
        executorNurzaman: executorNurzaman.trim() || null,
        comment: comment.trim() || null,
        isParallel,
        parallelGroupId: task?.parallelGroupId ?? null,
        orderIndex: task?.orderIndex ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#171A21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/6 flex items-center justify-between">
          <h2 style={{ fontFamily: "Onest, sans-serif" }} className="text-[16px] font-semibold text-white">
            {mode === "create" ? "New Task" : "Edit Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-300 transition-colors p-1 hover:bg-white/6 rounded-lg"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className={labelClass} htmlFor="task-title">Title</label>
            <input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className={inputClass}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="task-assignee">Assignee</label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} {u.surname}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} htmlFor="task-start">Start Date</label>
              <input
                id="task-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="task-end">End Date</label>
              <input
                id="task-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="task-deadline">Deadline (days)</label>
              <input
                id="task-deadline"
                type="number"
                min={0}
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="task-executor-go">Executor GO</label>
              <input
                id="task-executor-go"
                value={executorGO}
                onChange={(e) => setExecutorGO(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="task-executor-n">Executor Nurzaman</label>
              <input
                id="task-executor-n"
                value={executorNurzaman}
                onChange={(e) => setExecutorNurzaman(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="task-completion">Completion %</label>
            <input
              id="task-completion"
              type="number"
              min={0}
              max={100}
              value={completionPercent}
              onChange={(e) => setCompletionPercent(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="task-comment">Comment</label>
            <textarea
              id="task-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional notes"
              rows={3}
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-[12px] text-slate-400">
            <input
              type="checkbox"
              checked={isParallel}
              onChange={(e) => setIsParallel(e.target.checked)}
              className="w-4 h-4 rounded border-white/15 bg-white/5 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            />
            Runs in parallel
          </label>

          {error && (
            <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[12px] font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-60"
            >
              {saving ? "Saving…" : mode === "create" ? "Create Task" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

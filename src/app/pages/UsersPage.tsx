import { useState } from "react";
import { Clock, Pencil, Plus, Shield, Trash2, User as UserIcon } from "lucide-react";
import type { User } from "@/lib/api";
import { useAppData } from "../context/AppDataContext";
import { UserFormModal } from "../components/UserFormModal";
import { fmtDate, statusBadge, statusLabel } from "../lib/format";

export default function UsersPage() {
  const { users, roles, tasks, isAdmin, createUser, updateUser, deleteUser } = useAppData();
  const [selectedId, setSelectedId] = useState<number | null>(users[0]?.id ?? null);
  const [form, setForm] = useState<{ mode: "create" | "edit"; user?: User } | null>(null);

  const selectedUser = users.find((u) => u.id === selectedId) ?? null;
  const userTasks = selectedUser ? tasks.filter((t) => t.assigneeId === selectedUser.id) : [];

  const handleDelete = (u: User) => {
    if (!window.confirm(`Delete user "${u.name} ${u.surname}"?`)) return;
    deleteUser(u.id);
    if (selectedId === u.id) setSelectedId(null);
  };

  const handleSubmit = async (data: Parameters<typeof createUser>[0]) => {
    if (form?.mode === "edit" && form.user) {
      await updateUser(form.user.id, data);
    } else {
      await createUser(data);
    }
    setForm(null);
  };

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-[300px] shrink-0 border-r border-white/5 overflow-y-auto p-4 space-y-2">
        {isAdmin && (
          <button
            onClick={() => setForm({ mode: "create" })}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[12px] font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all mb-1"
          >
            <Plus size={13} />
            New User
          </button>
        )}

        {users.length === 0 && (
          <div className="text-[12px] text-slate-600 text-center py-8">No users yet</div>
        )}
        {users.map((u) => {
          const count = tasks.filter((t) => t.assigneeId === u.id).length;
          const active = u.id === selectedId;
          return (
            <div
              key={u.id}
              onClick={() => setSelectedId(u.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer group ${
                active
                  ? "bg-indigo-500/12 border-indigo-500/30"
                  : "bg-[#171A21] border-white/6 hover:border-white/12"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-slate-200 font-medium truncate">{u.name} {u.surname}</div>
                <div className="text-[11px] text-slate-600 truncate">{u.login}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    u.role?.name === "admin"
                      ? "bg-violet-500/15 text-violet-400"
                      : "bg-white/8 text-slate-400"
                  }`}
                >
                  <Shield size={9} />
                  {u.role?.name ?? "no role"}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">{count} tasks</span>
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setForm({ mode: "edit", user: u }); }}
                    className="text-slate-500 hover:text-slate-200 p-1 hover:bg-white/8 rounded-md transition-all"
                    title="Edit user"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(u); }}
                    className="text-slate-500 hover:text-red-400 p-1 hover:bg-white/8 rounded-md transition-all"
                    title="Delete user"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!selectedUser ? (
          <div className="h-full flex items-center justify-center text-[13px] text-slate-600">
            Select a user to see their tasks
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[13px] font-bold text-white">
                {selectedUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2
                  style={{ fontFamily: "Onest, sans-serif" }}
                  className="text-[16px] font-semibold text-white flex items-center gap-2"
                >
                  {selectedUser.name} {selectedUser.surname}
                  <span
                    className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      selectedUser.role?.name === "admin"
                        ? "bg-violet-500/15 text-violet-400"
                        : "bg-white/8 text-slate-400"
                    }`}
                  >
                    <Shield size={9} />
                    {selectedUser.role?.name ?? "no role"}
                  </span>
                </h2>
                <p className="text-[12px] text-slate-600">{selectedUser.login}</p>
              </div>
            </div>

            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-3">
              Assigned Tasks ({userTasks.length})
            </h3>
            {userTasks.length === 0 ? (
              <div className="text-[12px] text-slate-600 py-6 text-center border border-dashed border-white/8 rounded-xl">
                <UserIcon size={16} className="mx-auto mb-2 text-slate-700" />
                No tasks assigned to this user
              </div>
            ) : (
              <div className="space-y-2">
                {userTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#171A21] border border-white/6"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-200 font-medium truncate">{task.title}</p>
                      {task.category && (
                        <p className="text-[11px] text-slate-600 mt-0.5 truncate">{task.category.name}</p>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${statusBadge(task.status)}`}>
                      {statusLabel(task.status)}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600 shrink-0" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      <Clock size={9} />
                      {fmtDate(task.endDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isAdmin && form && (
        <UserFormModal
          mode={form.mode}
          user={form.user}
          roles={roles}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

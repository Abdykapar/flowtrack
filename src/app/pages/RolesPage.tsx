import { useState } from "react";
import { Check, Pencil, Plus, Shield, Trash2, X } from "lucide-react";
import type { Role } from "@/lib/api";
import { useAppData } from "../context/AppDataContext";

const inputClass =
  "w-full bg-[#1E2330] border border-white/8 rounded-lg px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all";

export default function RolesPage() {
  const { roles, users, isAdmin, createRole, updateRole, deleteRole } = useAppData();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    setCreating(true);
    try {
      await createRole(newName.trim());
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (role: Role) => {
    setEditingId(role.id);
    setEditingName(role.name);
  };

  const saveEdit = async (id: number) => {
    if (!editingName.trim()) return;
    await updateRole(id, editingName.trim());
    setEditingId(null);
  };

  const handleDelete = (role: Role) => {
    const count = users.filter((u) => u.role?.id === role.id).length;
    const warning = count > 0 ? ` ${count} user(s) currently have this role.` : "";
    if (!window.confirm(`Delete role "${role.name}"?${warning}`)) return;
    deleteRole(role.id);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h2 style={{ fontFamily: "Onest, sans-serif" }} className="text-[16px] font-semibold text-white mb-1">
            Roles
          </h2>
          <p className="text-[12px] text-slate-600">Manage the roles users can be assigned.</p>
        </div>

        {isAdmin && (
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New role name"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[12px] font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-60 shrink-0"
            >
              <Plus size={13} />
              Add
            </button>
          </form>
        )}
        {error && (
          <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-2">
          {roles.length === 0 && (
            <div className="text-[12px] text-slate-600 text-center py-8">No roles yet</div>
          )}
          {roles.map((role) => {
            const count = users.filter((u) => u.role?.id === role.id).length;
            const isEditing = editingId === role.id;
            return (
              <div
                key={role.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#171A21] border border-white/6"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                  <Shield size={13} />
                </div>
                {isEditing ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className={`${inputClass} flex-1`}
                    autoFocus
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-slate-200 font-medium truncate">{role.name}</div>
                    <div className="text-[10px] text-slate-600 font-mono">{count} user{count !== 1 ? "s" : ""}</div>
                  </div>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(role.id)}
                          className="text-emerald-500 hover:text-emerald-400 p-1.5 hover:bg-white/8 rounded-md transition-all"
                          title="Save"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-white/8 rounded-md transition-all"
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(role)}
                          className="text-slate-500 hover:text-slate-200 p-1.5 hover:bg-white/8 rounded-md transition-all"
                          title="Rename role"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-white/8 rounded-md transition-all"
                          title="Delete role"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

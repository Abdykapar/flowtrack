import { useState } from "react";
import { X } from "lucide-react";
import type { CreateUserInput, Role, User } from "@/lib/api";

interface UserFormModalProps {
  mode: "create" | "edit";
  user?: User;
  roles: Role[];
  onClose: () => void;
  onSubmit: (data: CreateUserInput) => Promise<void>;
}

const inputClass =
  "w-full bg-[#1E2330] border border-white/8 rounded-lg px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

export function UserFormModal({ mode, user, roles, onClose, onSubmit }: UserFormModalProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [surname, setSurname] = useState(user?.surname ?? "");
  const [login, setLogin] = useState(user?.login ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string>(user?.role?.id != null ? String(user.role.id) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !surname.trim() || !login.trim()) {
      setError("Name, surname, and login are required");
      return;
    }
    if (mode === "create" && !password.trim()) {
      setError("Password is required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        surname: surname.trim(),
        login: login.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
        roleId: roleId ? Number(roleId) : null,
      } as CreateUserInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
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
        className="w-full max-w-md bg-[#171A21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/6 flex items-center justify-between">
          <h2 style={{ fontFamily: "Onest, sans-serif" }} className="text-[16px] font-semibold text-white">
            {mode === "create" ? "New User" : "Edit User"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-300 transition-colors p-1 hover:bg-white/6 rounded-lg"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="user-name">Name</label>
              <input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="user-surname">Surname</label>
              <input
                id="user-surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Last name"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="user-login">Login</label>
            <input
              id="user-login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="username"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="user-password">
              Password {mode === "edit" && <span className="normal-case font-normal">(leave blank to keep current)</span>}
            </label>
            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "edit" ? "••••••••" : "New password"}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="user-role">Role</label>
            <select
              id="user-role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className={inputClass}
            >
              <option value="">No role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

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
              {saving ? "Saving…" : mode === "create" ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

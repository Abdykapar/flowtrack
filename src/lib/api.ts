export type DocumentStatus = "pending" | "in-progress" | "completed" | "overdue";

export interface TaskCategory {
  id: number;
  name: string;
  orderIndex: number;
}

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  surname: string;
  login: string;
  role: Role | null;
}

export interface Task {
  id: number;
  title: string;
  deadlineDays: number;
  startDate: string | null;
  endDate: string | null;
  completionPercent: number;
  status: DocumentStatus;
  executorGO: string | null;
  executorNurzaman: string | null;
  comment: string | null;
  isParallel: boolean;
  parallelGroupId: number | null;
  attachments: string[];
  orderIndex: number;
  category: TaskCategory | null;
  assigneeId: number | null;
  assignee: User | null;
}

export interface FocusSession {
  id: number;
  taskId: number | null;
  startTime: string;
  endTime: string | null;
  paused: boolean;
  durationMin: number | null;
}

export interface ActivityItem { day: string; completed: number; created: number; }
export interface PlannedVsActualItem { week: string; plannedDays: number; avgCompletion: number; }
export interface FocusScoreItem { day: string; score: number; }
export interface HeatmapItem { date: string; count: number; }
export interface CategoryItem { name: string; value: number; }

export interface CreateUserInput {
  name: string;
  surname: string;
  login: string;
  password: string;
  roleId?: number | null;
}

const BASE = "/api";

function getToken() {
  return localStorage.getItem("ft_token");
}

export function setToken(token: string) {
  localStorage.setItem("ft_token", token);
}

export function clearToken() {
  localStorage.removeItem("ft_token");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function requestUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (login: string, password: string) =>
      request<{ access_token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ login, password })
      }),
    logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
    me: () => request<User>("/auth/me")
  },
  tasks: {
    list: (status?: DocumentStatus, assigneeId?: number) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (assigneeId != null) params.set("assigneeId", String(assigneeId));
      const qs = params.toString() ? `?${params.toString()}` : "";
      return request<Task[]>(`/tasks${qs}`);
    },
    create: (data: Omit<Task, "id" | "category" | "assignee" | "attachments">) =>
      request<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    update: (id: number, data: Partial<Omit<Task, "id" | "category" | "assignee" | "attachments">>) =>
      request<Task>(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    remove: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
    setStatus: (id: number, status: DocumentStatus) =>
      request<Task>(`/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      }),
    setCompletion: (id: number, completionPercent: number) =>
      request<Task>(`/tasks/${id}/completion`, {
        method: "PATCH",
        body: JSON.stringify({ completionPercent })
      }),
    search: (q: string) => request<Task[]>(`/tasks/search?q=${encodeURIComponent(q)}`),
    uploadAttachment: (id: number, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return requestUpload<Task>(`/tasks/${id}/attachments`, formData);
    },
    removeAttachment: (id: number, filename: string) =>
      request<void>(`/tasks/${id}/attachments/${encodeURIComponent(filename)}`, { method: "DELETE" }),
    attachmentDownloadUrl: (id: number, filename: string) =>
      `${BASE}/tasks/${id}/attachments/${encodeURIComponent(filename)}`
  },
  users: {
    list: () => request<User[]>("/users"),
    get: (id: number) => request<User>(`/users/${id}`),
    create: (data: CreateUserInput) =>
      request<User>("/users", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    update: (id: number, data: Partial<CreateUserInput>) =>
      request<User>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    remove: (id: number) => request<void>(`/users/${id}`, { method: "DELETE" })
  },
  roles: {
    list: () => request<Role[]>("/roles"),
    create: (name: string) =>
      request<Role>("/roles", {
        method: "POST",
        body: JSON.stringify({ name })
      }),
    update: (id: number, name: string) =>
      request<Role>(`/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name })
      }),
    remove: (id: number) => request<void>(`/roles/${id}`, { method: "DELETE" })
  },
  focusSessions: {
    list: () => request<FocusSession[]>("/focus-sessions"),
    create: (taskId?: number) =>
      request<FocusSession>("/focus-sessions", {
        method: "POST",
        body: JSON.stringify({ taskId })
      }),
    update: (id: number, data: { endTime?: string; paused?: boolean; durationMin?: number }) =>
      request<FocusSession>(`/focus-sessions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      })
  },
  analytics: {
    activity: () => request<ActivityItem[]>("/analytics/activity"),
    plannedVsActual: () => request<PlannedVsActualItem[]>("/analytics/planned-vs-actual"),
    focusScore: () => request<FocusScoreItem[]>("/analytics/focus-score"),
    heatmap: () => request<HeatmapItem[]>("/analytics/heatmap"),
    categories: () => request<CategoryItem[]>("/analytics/categories")
  }
};

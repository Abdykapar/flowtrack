export type Priority = "high" | "medium" | "low";
export type TaskStatus = "planned" | "in-progress" | "review" | "completed";

export interface Task {
  id: number;
  title: string;
  priority: Priority;
  status: TaskStatus;
  estimatedMin: number;
  actualMin?: number;
  tags: string[];
  deadline: string;
  timerRunning: boolean;
  progress: number;
  assignedDate: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  streak: number;
  planType: string;
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

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      request<{ message: string }>("/auth/logout", { method: "POST" }),
    me: () => request<User>("/auth/me"),
  },
  tasks: {
    list: (params?: { status?: TaskStatus; priority?: Priority }) => {
      const qs = params
        ? new URLSearchParams(
            Object.fromEntries(
              Object.entries(params).filter(([, v]) => v != null) as [string, string][]
            )
          ).toString()
        : "";
      return request<Task[]>(`/tasks${qs ? `?${qs}` : ""}`);
    },
    create: (data: Omit<Task, "id" | "timerRunning" | "progress">) =>
      request<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Omit<Task, "id">>) =>
      request<Task>(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<void>(`/tasks/${id}`, { method: "DELETE" }),
    setStatus: (id: number, status: TaskStatus) =>
      request<Task>(`/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    setProgress: (id: number, progress: number) =>
      request<Task>(`/tasks/${id}/progress`, {
        method: "PATCH",
        body: JSON.stringify({ progress }),
      }),
    toggleTimer: (id: number, timerRunning: boolean) =>
      request<Task>(`/tasks/${id}/timer`, {
        method: "PATCH",
        body: JSON.stringify({ timerRunning }),
      }),
    search: (q: string) =>
      request<Task[]>(`/tasks/search?q=${encodeURIComponent(q)}`),
  },
};

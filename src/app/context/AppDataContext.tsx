import { createContext, useContext, useEffect, useState } from "react";
import {
  api,
  clearToken,
  type ActivityItem,
  type CategoryItem,
  type CreateUserInput,
  type DocumentStatus,
  type FocusScoreItem,
  type HeatmapItem,
  type PlannedVsActualItem,
  type Role,
  type Task,
  type User,
} from "@/lib/api";

type Analytics = {
  activity: ActivityItem[];
  plannedVsActual: PlannedVsActualItem[];
  focusScore: FocusScoreItem[];
  heatmap: HeatmapItem[];
  categories: CategoryItem[];
};

const EMPTY_ANALYTICS: Analytics = {
  activity: [],
  plannedVsActual: [],
  focusScore: [],
  heatmap: [],
  categories: [],
};

type TaskFormState = { mode: "create" | "edit"; task?: Task };

interface AppDataValue {
  booting: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  tasks: Task[];
  users: User[];
  roles: Role[];
  analytics: Analytics;
  taskModal: Task | null;
  taskForm: TaskFormState | null;
  login: (user: User) => void;
  logout: () => void;
  openTaskModal: (task: Task) => void;
  closeTaskModal: () => void;
  openCreateForm: () => void;
  openEditForm: (task: Task) => void;
  closeTaskForm: () => void;
  markDone: (id: number) => void;
  setStatus: (id: number, status: DocumentStatus) => void;
  deleteTask: (id: number) => void;
  submitTaskForm: (data: Omit<Task, "id" | "category" | "assignee" | "attachments">) => Promise<void>;
  uploadAttachment: (id: number, file: File) => Promise<void>;
  removeAttachment: (id: number, filename: string) => Promise<void>;
  createUser: (data: CreateUserInput) => Promise<void>;
  updateUser: (id: number, data: Partial<CreateUserInput>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  createRole: (name: string) => Promise<void>;
  updateRole: (id: number, name: string) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>(EMPTY_ANALYTICS);
  const [taskModal, setTaskModal] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState | null>(null);
  const isAdmin = currentUser?.role?.name === "admin";

  async function loadAnalytics() {
    const [activity, plannedVsActual, focusScore, heatmap, categories] = await Promise.all([
      api.analytics.activity(),
      api.analytics.plannedVsActual(),
      api.analytics.focusScore(),
      api.analytics.heatmap(),
      api.analytics.categories(),
    ]);
    setAnalytics({ activity, plannedVsActual, focusScore, heatmap, categories });
  }

  useEffect(() => {
    const token = localStorage.getItem("ft_token");
    if (!token) { setBooting(false); return; }
    api.auth.me()
      .then((user) => {
        setCurrentUser(user);
        const tasksPromise =
          user.role?.name === "admin" ? api.tasks.list() : api.tasks.list(undefined, user.id);
        return Promise.all([tasksPromise, api.users.list(), api.roles.list(), loadAnalytics()]);
      })
      .then(([loadedTasks, loadedUsers, loadedRoles]) => {
        setTasks(loadedTasks as Task[]);
        setUsers(loadedUsers as User[]);
        setRoles(loadedRoles as Role[]);
      })
      .catch(() => clearToken())
      .finally(() => setBooting(false));
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    const tasksPromise = user.role?.name === "admin" ? api.tasks.list() : api.tasks.list(undefined, user.id);
    tasksPromise.then(setTasks);
    api.users.list().then(setUsers).catch(() => {});
    api.roles.list().then(setRoles).catch(() => {});
    loadAnalytics().catch(() => {});
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    clearToken();
    setCurrentUser(null);
    setTasks([]);
    setUsers([]);
    setRoles([]);
    setAnalytics(EMPTY_ANALYTICS);
  };

  const markDone = (id: number) => {
    if (!isAdmin) return;
    api.tasks.setStatus(id, "completed").then((updated) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setTaskModal(null);
    });
  };

  const setStatus = (id: number, status: DocumentStatus) => {
    if (!isAdmin) return;
    api.tasks.setStatus(id, status).then((updated) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    );
  };

  const deleteTask = (id: number) => {
    if (!isAdmin) return;
    api.tasks.remove(id).then(() =>
      setTasks((prev) => prev.filter((t) => t.id !== id))
    );
  };

  const submitTaskForm = async (data: Omit<Task, "id" | "category" | "assignee" | "attachments">) => {
    if (!isAdmin) return;
    if (taskForm?.mode === "edit" && taskForm.task) {
      const updated = await api.tasks.update(taskForm.task.id, data);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setTaskModal((prev) => (prev && prev.id === updated.id ? updated : prev));
    } else {
      const created = await api.tasks.create(data);
      setTasks((prev) => [...prev, created]);
    }
    setTaskForm(null);
  };

  const uploadAttachment = async (id: number, file: File) => {
    if (!isAdmin) return;
    const updated = await api.tasks.uploadAttachment(id, file);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setTaskModal((prev) => (prev && prev.id === id ? updated : prev));
  };

  const removeAttachment = async (id: number, filename: string) => {
    if (!isAdmin) return;
    await api.tasks.removeAttachment(id, filename);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, attachments: t.attachments.filter((a) => a !== filename) } : t))
    );
    setTaskModal((prev) =>
      prev && prev.id === id ? { ...prev, attachments: prev.attachments.filter((a) => a !== filename) } : prev
    );
  };

  const createUser = async (data: CreateUserInput) => {
    if (!isAdmin) return;
    const created = await api.users.create(data);
    setUsers((prev) => [...prev, created]);
  };

  const updateUser = async (id: number, data: Partial<CreateUserInput>) => {
    if (!isAdmin) return;
    const updated = await api.users.update(id, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const deleteUser = async (id: number) => {
    if (!isAdmin) return;
    await api.users.remove(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const createRole = async (name: string) => {
    if (!isAdmin) return;
    const created = await api.roles.create(name);
    setRoles((prev) => [...prev, created]);
  };

  const updateRole = async (id: number, name: string) => {
    if (!isAdmin) return;
    const updated = await api.roles.update(id, name);
    setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const deleteRole = async (id: number) => {
    if (!isAdmin) return;
    await api.roles.remove(id);
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const visibleTasks = isAdmin ? tasks : tasks.filter((t) => t.assigneeId === currentUser?.id);

  const value: AppDataValue = {
    booting,
    currentUser,
    isAdmin,
    tasks: visibleTasks,
    users,
    roles,
    analytics,
    taskModal,
    taskForm,
    login,
    logout,
    openTaskModal: setTaskModal,
    closeTaskModal: () => setTaskModal(null),
    openCreateForm: () => setTaskForm({ mode: "create" }),
    openEditForm: (task) => { setTaskModal(null); setTaskForm({ mode: "edit", task }); },
    closeTaskForm: () => setTaskForm(null),
    markDone,
    setStatus,
    deleteTask,
    submitTaskForm,
    uploadAttachment,
    removeAttachment,
    createUser,
    updateUser,
    deleteUser,
    createRole,
    updateRole,
    deleteRole,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

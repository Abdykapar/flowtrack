import { useAppData } from "../context/AppDataContext";
import { KanbanBoard } from "../components/KanbanBoard";
import { TaskModal } from "../components/TaskModal";
import { TaskFormModal } from "../components/TaskFormModal";

export default function TasksPage() {
  const {
    tasks,
    users,
    taskModal,
    taskForm,
    openTaskModal,
    closeTaskModal,
    openCreateForm,
    openEditForm,
    closeTaskForm,
    markDone,
    setStatus,
    deleteTask,
    submitTaskForm,
  } = useAppData();

  return (
    <>
      <KanbanBoard
        tasks={tasks}
        onTaskClick={openTaskModal}
        onDelete={deleteTask}
        onAddClick={openCreateForm}
      />

      {taskModal && (
        <TaskModal
          task={taskModal}
          onClose={closeTaskModal}
          onMarkDone={markDone}
          onStatusChange={setStatus}
          onEdit={openEditForm}
          onDelete={deleteTask}
        />
      )}

      {taskForm && (
        <TaskFormModal
          mode={taskForm.mode}
          task={taskForm.task}
          users={users}
          onClose={closeTaskForm}
          onSubmit={submitTaskForm}
        />
      )}
    </>
  );
}

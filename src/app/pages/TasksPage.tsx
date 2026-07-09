import { useAppData } from "../context/AppDataContext";
import { KanbanBoard } from "../components/KanbanBoard";
import { TaskModal } from "../components/TaskModal";
import { TaskFormModal } from "../components/TaskFormModal";

export default function TasksPage() {
  const {
    tasks,
    users,
    isAdmin,
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
    uploadAttachment,
    removeAttachment,
  } = useAppData();

  return (
    <>
      <KanbanBoard
        tasks={tasks}
        onTaskClick={openTaskModal}
        onDelete={deleteTask}
        onAddClick={openCreateForm}
        canManage={isAdmin}
      />

      {taskModal && (
        <TaskModal
          task={taskModal}
          onClose={closeTaskModal}
          onMarkDone={markDone}
          onStatusChange={setStatus}
          onEdit={openEditForm}
          onDelete={deleteTask}
          onUploadAttachment={uploadAttachment}
          onRemoveAttachment={removeAttachment}
          canManage={isAdmin}
        />
      )}

      {isAdmin && taskForm && (
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

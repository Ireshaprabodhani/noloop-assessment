"use client";

import { AlertCircle, ClipboardList, Plus, RotateCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { tasksApi } from "@/lib/api";
import type { SortOrder, Task, TaskInput, TaskStatus } from "@/lib/types";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskTable } from "./task-table";
import { TaskToolbar } from "./task-toolbar";

// Clicking "Due date" cycles: unsorted (newest first) -> asc -> desc -> unsorted.
const NEXT_SORT: Record<SortOrder | "none", SortOrder | undefined> = {
  none: "asc",
  asc: "desc",
  desc: undefined,
};

export function TaskManager() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus>();
  const [dueDateOrder, setDueDateOrder] = useState<SortOrder>();
  const { tasks, loading, error, reload } = useTasks({
    status: statusFilter,
    dueDateOrder,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  // Errors propagate to the dialog, which shows them and stays open.
  async function saveTask(input: TaskInput) {
    if (editingTask) {
      await tasksApi.update(editingTask.id, input);
      toast.success("Task updated");
    } else {
      await tasksApi.create(input);
      toast.success("Task created");
    }
    setFormOpen(false);
    reload();
  }

  async function deleteTask(task: Task) {
    try {
      await tasksApi.remove(task.id);
    } catch (err) {
      toast.error("Could not delete task", {
        description: err instanceof Error ? err.message : undefined,
      });
      throw err;
    }
    toast.success("Task deleted");
    setDeletingTask(null);
    reload();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Keep track of what needs doing.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          New task
        </Button>
      </header>

      <TaskToolbar
        status={statusFilter}
        onStatusChange={setStatusFilter}
        count={loading || error ? null : tasks.length}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn&apos;t load tasks</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={reload}
            >
              <RotateCw />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <TaskTable
          tasks={tasks}
          loading={loading}
          dueDateOrder={dueDateOrder}
          onToggleDueDateSort={() =>
            setDueDateOrder(NEXT_SORT[dueDateOrder ?? "none"])
          }
          onEdit={openEdit}
          onDelete={setDeletingTask}
          emptyState={
            statusFilter ? (
              <EmptyState
                title="No matching tasks"
                description="No tasks have this status."
                action={
                  <Button
                    variant="outline"
                    onClick={() => setStatusFilter(undefined)}
                  >
                    Clear filter
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No tasks yet"
                description="Create your first task to get started."
                action={
                  <Button onClick={openCreate}>
                    <Plus />
                    Create your first task
                  </Button>
                }
              />
            )
          }
        />
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSubmit={saveTask}
      />
      <DeleteTaskDialog
        task={deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        onConfirm={deleteTask}
      />
    </main>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <ClipboardList className="text-muted-foreground size-10" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}

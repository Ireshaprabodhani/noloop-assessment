"use client";

import {
  AlertCircle,
  CheckSquare,
  ClipboardList,
  Plus,
  RotateCw,
  SearchX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { tasksApi } from "@/lib/api";
import {
  STATUS_LABELS,
  type SortOrder,
  type Task,
  type TaskInput,
  type TaskStatus,
} from "@/lib/types";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskSummary } from "./task-summary";
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
  const { tasks, counts, loading, error, reload } = useTasks({
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
      toast.success("Task updated", { description: input.title });
    } else {
      await tasksApi.create(input);
      toast.success("Task created", { description: input.title });
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
    toast.success("Task deleted", { description: task.title });
    setDeletingTask(null);
    reload();
  }

  return (
    <div className="min-h-screen">
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
              <CheckSquare className="size-5" aria-hidden />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Task Manager
            </span>
          </div>
          <Button onClick={openCreate}>
            <Plus />
            <span className="hidden sm:inline">New task</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Your tasks
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Plan your work, track progress and never miss a due date.
          </p>
        </div>

        {!error && (
          <TaskSummary
            counts={counts}
            status={statusFilter}
            onStatusChange={setStatusFilter}
          />
        )}

        <section className="bg-card rounded-xl border shadow-xs">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                {statusFilter ? STATUS_LABELS[statusFilter] : "All tasks"}
              </h2>
              <p className="text-muted-foreground text-xs">
                Tip: click the “Due date” column to sort.
              </p>
            </div>
            <TaskToolbar
              status={statusFilter}
              onStatusChange={setStatusFilter}
              counts={counts}
            />
          </div>

          {error ? (
            <div className="p-4">
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
            </div>
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
                    icon={<SearchX className="size-6" aria-hidden />}
                    title="No matching tasks"
                    description={`You have no tasks marked “${STATUS_LABELS[statusFilter]}”.`}
                    action={
                      <Button
                        variant="outline"
                        onClick={() => setStatusFilter(undefined)}
                      >
                        Show all tasks
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon={<ClipboardList className="size-6" aria-hidden />}
                    title="No tasks yet"
                    description="Create your first task to start tracking your work."
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
        </section>
      </main>

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
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}

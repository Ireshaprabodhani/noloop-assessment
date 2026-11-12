export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  /** ISO date string (YYYY-MM-DD or full ISO), or null. */
  dueDate: string | null;
  createdAt: string;
}

/** Body for POST /tasks and PATCH /tasks/:id. `null` clears a field. */
export interface TaskInput {
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
}

export type SortOrder = "asc" | "desc";

export interface TaskQuery {
  status?: TaskStatus;
  /** When set, sort by due date in this direction; otherwise newest first. */
  dueDateOrder?: SortOrder;
}

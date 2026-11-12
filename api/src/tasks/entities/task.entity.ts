export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  /** ISO 8601 date string, or null when the task has no due date. */
  dueDate: string | null;
  /** ISO 8601 timestamp set by the server on creation. */
  createdAt: string;
}

"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  daysUntil,
  formatCreatedAt,
  formatDueDate,
  relativeDueLabel,
} from "@/lib/format";
import type { SortOrder, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TaskStatusBadge } from "./task-status-badge";

const COLUMN_COUNT = 5;
const SKELETON_ROWS = 4;

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  dueDateOrder: SortOrder | undefined;
  onToggleDueDateSort: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  /** Shown in place of rows when there are no tasks to display. */
  emptyState: ReactNode;
}

export function TaskTable({
  tasks,
  loading,
  dueDateOrder,
  onToggleDueDateSort,
  onEdit,
  onDelete,
  emptyState,
}: TaskTableProps) {
  const SortIcon =
    dueDateOrder === "asc"
      ? ArrowUp
      : dueDateOrder === "desc"
        ? ArrowDown
        : ArrowUpDown;

  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-full pl-4 text-xs uppercase tracking-wide text-muted-foreground">
            Task
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
            Status
          </TableHead>
          <TableHead
            aria-sort={
              dueDateOrder === "asc"
                ? "ascending"
                : dueDateOrder === "desc"
                  ? "descending"
                  : "none"
            }
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground -ml-3 text-xs uppercase tracking-wide"
              onClick={onToggleDueDateSort}
            >
              Due date
              <SortIcon className={cn(!dueDateOrder && "opacity-50")} />
            </Button>
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
            Created
          </TableHead>
          <TableHead className="pr-4 text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: SKELETON_ROWS }, (_, i) => (
            <TableRow key={i}>
              {Array.from({ length: COLUMN_COUNT }, (_, j) => (
                <TableCell key={j} className="py-3 first:pl-4 last:pr-4">
                  <Skeleton className="h-5 w-full min-w-16" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : tasks.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={COLUMN_COUNT} className="py-16">
              {emptyState}
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}

function TaskRow({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const days = task.dueDate ? daysUntil(task.dueDate) : null;
  const pending = task.status !== "DONE";
  const overdue = pending && days !== null && days < 0;
  const dueSoon = pending && days !== null && days >= 0 && days <= 2;

  return (
    <TableRow>
      <TableCell className="max-w-0 py-4 pl-4">
        <p
          className={cn(
            "truncate font-medium",
            task.status === "DONE" && "text-muted-foreground line-through",
          )}
          title={task.title}
        >
          {task.title}
        </p>
        {task.description && (
          <p
            className="text-muted-foreground truncate text-xs"
            title={task.description}
          >
            {task.description}
          </p>
        )}
      </TableCell>
      <TableCell>
        <TaskStatusBadge status={task.status} />
      </TableCell>
      <TableCell>
        {task.dueDate ? (
          <div className="flex items-start gap-2">
            <CalendarDays
              className={cn(
                "text-muted-foreground mt-0.5 size-4",
                overdue && "text-destructive",
                dueSoon && "text-amber-600",
              )}
              aria-hidden
            />
            <div className="leading-tight">
              <p>{formatDueDate(task.dueDate)}</p>
              {pending && (
                <p
                  className={cn(
                    "text-muted-foreground text-xs",
                    overdue && "text-destructive font-medium",
                    dueSoon && "font-medium text-amber-600",
                  )}
                >
                  {relativeDueLabel(task.dueDate)}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No due date</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatCreatedAt(task.createdAt)}
      </TableCell>
      <TableCell className="pr-4 text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(task)}
            aria-label={`Delete "${task.title}"`}
          >
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

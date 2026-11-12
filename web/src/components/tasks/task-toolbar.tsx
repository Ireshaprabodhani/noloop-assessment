"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "@/lib/types";

// Radix Select doesn't allow an empty string as an item value.
const ALL = "ALL";

interface TaskToolbarProps {
  status: TaskStatus | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
  /** Number of tasks currently shown, or null while loading. */
  count: number | null;
}

export function TaskToolbar({ status, onStatusChange, count }: TaskToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm" id="status-filter">
          Status
        </span>
        <Select
          value={status ?? ALL}
          onValueChange={(value) =>
            onStatusChange(value === ALL ? undefined : (value as TaskStatus))
          }
        >
          <SelectTrigger className="w-40" aria-labelledby="status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {TASK_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {count !== null && (
        <p className="text-muted-foreground text-sm">
          {count} {count === 1 ? "task" : "tasks"}
        </p>
      )}
    </div>
  );
}

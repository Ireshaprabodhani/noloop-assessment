"use client";

import type { TaskCounts } from "@/hooks/use-tasks";
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { value: TaskStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  ...TASK_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })),
];

interface TaskToolbarProps {
  status: TaskStatus | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
  counts: TaskCounts | null;
}

/** Segmented status filter with a count per status. */
export function TaskToolbar({
  status,
  onStatusChange,
  counts,
}: TaskToolbarProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter tasks by status"
      className="bg-muted inline-flex w-full gap-1 overflow-x-auto rounded-lg p-1 sm:w-auto"
    >
      {FILTERS.map(({ value, label }) => {
        const active = status === value;
        const count = counts?.[value ?? "ALL"];
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onStatusChange(value)}
            className={cn(
              "focus-visible:ring-ring/50 inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] sm:flex-none",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-background",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

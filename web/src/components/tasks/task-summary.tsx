"use client";

import {
  CheckCircle2,
  Circle,
  ListTodo,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaskCounts } from "@/hooks/use-tasks";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const CARDS: {
  key: TaskStatus | "ALL";
  label: string;
  icon: LucideIcon;
  iconClass: string;
}[] = [
  {
    key: "ALL",
    label: "Total",
    icon: ListTodo,
    iconClass: "bg-indigo-100 text-indigo-600",
  },
  {
    key: "TODO",
    label: "To do",
    icon: Circle,
    iconClass: "bg-slate-100 text-slate-600",
  },
  {
    key: "IN_PROGRESS",
    label: "In progress",
    icon: Timer,
    iconClass: "bg-amber-100 text-amber-600",
  },
  {
    key: "DONE",
    label: "Done",
    icon: CheckCircle2,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
];

interface TaskSummaryProps {
  counts: TaskCounts | null;
  status: TaskStatus | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
}

/** Overview cards with a count per status; clicking one filters the list. */
export function TaskSummary({
  counts,
  status,
  onStatusChange,
}: TaskSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, iconClass }) => {
        const value = key === "ALL" ? undefined : key;
        const active = status === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onStatusChange(value)}
            aria-pressed={active}
            className={cn(
              "bg-card focus-visible:ring-ring/50 flex items-center gap-3 rounded-xl border p-4 text-left shadow-xs transition-all outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px]",
              active && "border-primary/40 ring-primary/10 ring-2",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                iconClass,
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="text-muted-foreground block text-xs font-medium">
                {label}
              </span>
              {counts ? (
                <span className="block text-2xl font-semibold tabular-nums">
                  {counts[key]}
                </span>
              ) : (
                <Skeleton className="mt-1 h-7 w-8" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

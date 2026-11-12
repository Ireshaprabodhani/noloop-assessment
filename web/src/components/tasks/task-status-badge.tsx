import { CheckCircle2, Circle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, type TaskStatus } from "@/lib/types";

const STATUS_STYLES: Record<TaskStatus, { className: string; icon: typeof Circle }> = {
  TODO: {
    className: "border-slate-200 bg-slate-100 text-slate-700",
    icon: Circle,
  },
  IN_PROGRESS: {
    className: "border-amber-200 bg-amber-100 text-amber-800",
    icon: Timer,
  },
  DONE: {
    className: "border-emerald-200 bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
  },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { className, icon: Icon } = STATUS_STYLES[status];
  return (
    <Badge variant="outline" className={cn(className)}>
      <Icon aria-hidden />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

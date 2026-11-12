/**
 * Parses a due date as a calendar day in local time. "2026-12-31" would
 * otherwise be read as UTC midnight and could show as the 30th.
 */
export function parseDueDate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Value for an <input type="date">, e.g. "2026-12-31". */
export function toDateInputValue(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDueDate(value: string): string {
  return dateFormatter.format(parseDueDate(value));
}

export function formatCreatedAt(value: string): string {
  return dateFormatter.format(new Date(value));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from today to the due date (negative when overdue). */
export function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (parseDueDate(dueDate).getTime() - today.getTime()) / DAY_MS,
  );
}

/** Short human label such as "Today", "In 3 days" or "2 days overdue". */
export function relativeDueLabel(dueDate: string): string {
  const days = daysUntil(dueDate);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1) return `In ${days} days`;
  return `${-days} days overdue`;
}

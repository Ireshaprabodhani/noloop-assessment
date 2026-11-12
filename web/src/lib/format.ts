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

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDueDate(dueDate) < today;
}

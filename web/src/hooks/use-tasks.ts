"use client";

import { useCallback, useEffect, useState } from "react";
import { tasksApi } from "@/lib/api";
import type { Task, TaskQuery, TaskStatus } from "@/lib/types";

export type TaskCounts = Record<TaskStatus | "ALL", number>;

interface UseTasksResult {
  tasks: Task[];
  /** Totals across all tasks, regardless of the status filter. */
  counts: TaskCounts | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function countByStatus(tasks: Task[]): TaskCounts {
  const counts: TaskCounts = {
    ALL: tasks.length,
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };
  for (const task of tasks) counts[task.status] += 1;
  return counts;
}

/** Loads tasks for the given filter/sort and refetches whenever it changes. */
export function useTasks({ status, dueDateOrder }: TaskQuery): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState<TaskCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Ignore responses from requests that were superseded by a newer one.
    let cancelled = false;
    setLoading(true);
    setError(null);

    // The filtered list comes from the API. When a filter is active, the
    // unfiltered list is fetched alongside it for the summary counts.
    Promise.all([
      tasksApi.list({ status, dueDateOrder }),
      status ? tasksApi.list() : null,
    ])
      .then(([filtered, all]) => {
        if (cancelled) return;
        setTasks(filtered);
        setCounts(countByStatus(all ?? filtered));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, dueDateOrder, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { tasks, counts, loading, error, reload };
}

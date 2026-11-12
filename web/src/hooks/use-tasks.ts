"use client";

import { useCallback, useEffect, useState } from "react";
import { tasksApi } from "@/lib/api";
import type { Task, TaskQuery } from "@/lib/types";

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Loads tasks for the given filter/sort and refetches whenever it changes. */
export function useTasks({ status, dueDateOrder }: TaskQuery): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Ignore responses from requests that were superseded by a newer one.
    let cancelled = false;
    setLoading(true);
    setError(null);

    tasksApi
      .list({ status, dueDateOrder })
      .then((data) => {
        if (!cancelled) setTasks(data);
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

  return { tasks, loading, error, reload };
}

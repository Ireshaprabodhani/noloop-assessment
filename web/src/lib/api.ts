import type { Task, TaskInput, TaskQuery } from "./types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

/** Error thrown for any non-2xx response, carrying the server's message. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Individual validation messages from a 400 response. */
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      `Could not reach the API at ${API_URL}. Is the backend running?`,
      0,
    );
  }

  if (!res.ok) {
    throw await toApiError(res);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

// Nest error bodies look like { statusCode, message: string | string[], error }.
async function toApiError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const details = Array.isArray(body?.message) ? body.message : [];
  const message =
    details.join(", ") ||
    (typeof body?.message === "string" ? body.message : "") ||
    `Request failed with status ${res.status}`;
  return new ApiError(message, res.status, details);
}

export const tasksApi = {
  list(query: TaskQuery = {}): Promise<Task[]> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.dueDateOrder) {
      params.set("sort", "dueDate");
      params.set("order", query.dueDateOrder);
    }
    const qs = params.toString();
    return request<Task[]>(`/tasks${qs ? `?${qs}` : ""}`);
  },

  create(input: TaskInput): Promise<Task> {
    return request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: Partial<TaskInput>): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, { method: "DELETE" });
  },
};

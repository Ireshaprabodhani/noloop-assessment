# Task Manager

A small task manager with a **NestJS** REST API (`/api`) and a **Next.js + shadcn/ui** frontend (`/web`).

- Create, view, edit and delete tasks (title, description, status, due date)
- Status shown as a colour-coded badge; overdue dates highlighted
- Filter by status and sort by due date (both handled by the API)
- Input validation with DTOs + `class-validator` (400 on bad input, 404 for unknown tasks)
- Loading skeletons, error state with retry, confirmation before delete, toast on success
- Docker Compose setup to run both apps with one command

## Prerequisites

| Tool    | Version                                |
| ------- | -------------------------------------- |
| Node.js | **20.x or 22.x** (tested on 22.20)     |
| npm     | **10.x** (comes with Node 20/22)       |
| Docker  | Optional, only for the Docker option   |

No database is needed: tasks are stored **in memory**, so they reset when the API restarts.

Ports used: **3001** (API) and **3000** (web). Make sure they are free.

## Run locally

Use two terminals, one for each app. Start from the repository root.

### 1. Backend (API) on http://localhost:3001

```bash
cd api
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
npm run start:dev
```

Wait for `API listening on http://localhost:3001`.

### 2. Frontend (web) on http://localhost:3000

```bash
cd web
npm install
cp .env.example .env.local  # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open **http://localhost:3000**.

> The `.env` files are optional: the defaults below are used if they are missing.

### Production build (optional)

```bash
cd api && npm run build && npm run start:prod
cd web && npm run build && npm start
```

## Run with Docker (optional)

From the repository root:

```bash
docker compose up --build
```

Then open **http://localhost:3000**. Stop with `Ctrl+C`, then run `docker compose down`.

## Environment variables

| App   | Variable              | Default                 | Description                                                        |
| ----- | --------------------- | ----------------------- | ------------------------------------------------------------------ |
| `api` | `PORT`                | `3001`                  | Port the API listens on                                            |
| `api` | `CORS_ORIGIN`         | `http://localhost:3000` | Comma-separated list of origins allowed to call the API            |
| `web` | `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Base URL of the API, as seen from the browser (inlined at build time) |

## Tests

```bash
cd api
npm test            # unit tests (TasksService)
npm run test:e2e    # HTTP tests for every endpoint, incl. 400/404 cases
```

## API

Base URL: `http://localhost:3001`

| Method   | Path         | Description                    | Success | Errors   |
| -------- | ------------ | ------------------------------ | ------- | -------- |
| `GET`    | `/tasks`     | List tasks                     | 200     | 400      |
| `GET`    | `/tasks/:id` | Get one task                   | 200     | 400, 404 |
| `POST`   | `/tasks`     | Create a task                  | 201     | 400      |
| `PATCH`  | `/tasks/:id` | Update some fields of a task   | 200     | 400, 404 |
| `DELETE` | `/tasks/:id` | Delete a task                  | 204     | 400, 404 |

**Task**

```json
{
  "id": "6f1c2a9e-4b7d-4c1a-9a51-3f0c7e2d8b10",
  "title": "Write README",
  "description": "Setup steps and API docs",
  "status": "IN_PROGRESS",
  "dueDate": "2026-12-31",
  "createdAt": "2026-11-12T10:15:00.000Z"
}
```

**Validation rules**

- `title`: required string, 1–200 characters (trimmed)
- `description`: optional string, up to 2000 characters, `null` clears it
- `status`: `TODO` | `IN_PROGRESS` | `DONE` (defaults to `TODO`)
- `dueDate`: optional ISO 8601 date (e.g. `2026-12-31`), `null` clears it
- Unknown fields are rejected. `:id` must be a UUID.

**Query parameters for `GET /tasks`**

- `status=TODO|IN_PROGRESS|DONE`: filter by status
- `sort=dueDate|createdAt` and `order=asc|desc`: sort (default: newest first). With `sort=dueDate`, tasks without a due date are always listed last.

**Examples**

```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write README","status":"IN_PROGRESS","dueDate":"2026-12-31"}'

curl "http://localhost:3001/tasks?status=IN_PROGRESS&sort=dueDate&order=asc"

curl -X PATCH http://localhost:3001/tasks/<id> \
  -H "Content-Type: application/json" -d '{"status":"DONE"}'

curl -X DELETE http://localhost:3001/tasks/<id>
```

Error responses use NestJS's standard shape:

```json
{ "statusCode": 400, "message": ["title must not be empty"], "error": "Bad Request" }
```

## Project structure

```
api/                      NestJS REST API
  src/main.ts             bootstrap: CORS, port
  src/app.setup.ts        global ValidationPipe (shared with e2e tests)
  src/tasks/
    dto/                  CreateTaskDto, UpdateTaskDto, QueryTasksDto
    entities/             Task type + TaskStatus enum
    tasks.controller.ts   HTTP routes
    tasks.service.ts      business logic, 404s, filter/sort
    tasks.repository.ts   in-memory storage (Map)
  test/                   e2e tests (supertest)

web/                      Next.js (App Router) + shadcn/ui
  src/app/                layout (toaster) and page
  src/components/ui/      shadcn/ui components
  src/components/tasks/   task table, form dialog, delete dialog, toolbar
  src/hooks/use-tasks.ts  loads tasks for the current filter/sort
  src/lib/api.ts          typed fetch client with error handling
```

**Design notes**

- Storage sits behind a small `TasksRepository`, so it could be swapped for SQLite/Prisma without changing the service or controller.
- Filtering and sorting run in the API; the UI only sends query parameters.
- The form validates with zod using the same rules as the API for quick feedback, but the API is the source of truth: any API error is shown inside the dialog, which stays open.

## How I used AI

- **Tools:** Claude Code (Anthropic's Claude, in VS Code) as a pair programmer.
- **What it did:** proposed the plan and project structure, then generated most of the code (API, DTOs, tests, React components, Docker setup) and a first draft of this README, committing in small steps.
- **What I changed or reviewed:**
  - Chose the scope and trade-offs myself (in-memory storage, all three bonus features).
  - Reviewed the validation edge cases and asked for them to be covered: PATCH can clear `description`/`dueDate` with `null` but not `title`, unknown fields are rejected, and a malformed id returns 400 while a missing one returns 404.
  - Checked the UI behaviour: the dialogs stay open and show the error if a request fails, due dates are parsed as local dates (avoiding an off-by-one day in some time zones), and tasks without a due date are listed last.
  - _TODO (author): add anything else you changed by hand._

# TeamFlow

TeamFlow is a web-based project management application for university students working in teams.
It combines a simplified Trello-style Kanban board with Jira-style task metadata (status, priority,
due date, assignee) and adds the things a student team actually needs: projects, membership,
comments and a personal dashboard.

## Features

- User registration and login with JWT authentication
- Current user endpoint and a protected-route mechanism on the frontend
- Project creation, listing, details, update and deletion
- Project membership with `OWNER` / `MEMBER` roles (creator becomes the owner automatically)
- Adding members by email and removing them (owner only)
- Full task CRUD with title, description, status, priority, due date and assignee
- Kanban board with drag-and-drop status changes (`@dnd-kit`) and optimistic updates
- Task details modal with quick status change, assignment, edit and delete
- Task comments with author, timestamp and permission-aware deletion
- Automatically calculated project progress (completed tasks / total tasks)
- Dashboard with project count, assigned tasks, completed tasks, upcoming deadlines and overdue highlighting
- Server-side validation, centralised error handling and project-level authorization
- Loading, empty and error states across every data-driven page; responsive desktop/tablet/mobile layout

## Tech stack

| Layer     | Technologies                                                                       |
| --------- | ---------------------------------------------------------------------------------- |
| Frontend  | React, TypeScript, Vite, React Router, TanStack Query, Axios, React Hook Form, Zod, Tailwind CSS v4, @dnd-kit, Lucide |
| Backend   | Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, JWT, bcrypt, Zod, dotenv, CORS |
| Tooling   | npm workspaces, ESLint, Prettier, Vitest, Supertest                                  |

## Architecture

```text
React (TanStack Query + Axios)
        ↓  REST / JSON
Express routes
        ↓
Controllers  (thin: parse request, send response)
        ↓
Services     (business rules, authorization, progress calculation)
        ↓
Prisma ORM
        ↓
PostgreSQL
```

Validation happens in middleware (Zod schemas) before any business logic runs, and every error is
converted into a consistent `{ "error": { "message": "..." } }` response by a single error handler.

### Repository layout

```text
teamflow/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── api/             # Axios client and typed endpoint wrappers
│       ├── components/ui/   # Button, Field, Card, Badge, Avatar, Modal, States, …
│       ├── features/        # auth, projects, tasks, comments (queries + feature components)
│       ├── hooks/           # useAuth, useProjectContext
│       ├── layouts/         # AppLayout (shell), AuthLayout
│       ├── pages/           # Login, Register, Dashboard, Projects, Board, Members, …
│       ├── routes/          # Route table and protected-route guards
│       ├── types/           # Shared domain types
│       └── utils/           # cn(), date/format helpers
├── server/                  # Express + Prisma backend
│   ├── prisma/              # schema.prisma, migrations, seed.ts
│   ├── src/
│   │   ├── config/          # env + Prisma client
│   │   ├── controllers/     # HTTP layer
│   │   ├── middleware/      # authenticate, validateBody, errorHandler
│   │   ├── routes/          # REST routing
│   │   ├── schemas/         # Zod request schemas
│   │   ├── services/        # Business logic and authorization
│   │   ├── types/           # Domain enums, Express request augmentation
│   │   └── utils/           # errors, jwt, asyncHandler
│   └── tests/               # Supertest integration tests
└── package.json             # npm workspaces + root scripts
```

## Getting started

### Prerequisites

- Node.js 20+ and npm 10+
- A PostgreSQL 14+ database

### 1. Install dependencies

```bash
npm install
```

This installs both workspaces (`client` and `server`) from the repository root.

### 2. Environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`:

```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/teamflow?schema=public"
JWT_SECRET="replace-this-with-a-long-random-string"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

`client/.env`:

```env
VITE_API_URL="http://localhost:5001/api"
```

The API defaults to port **5001** because macOS reserves port 5000 for the AirPlay receiver.
Change `PORT` and `VITE_API_URL` together if you prefer a different port. Real `.env` files are
git-ignored — only the `.env.example` files are committed.

If you do not have PostgreSQL installed locally, the quickest option is Docker:

```bash
docker run -d --name teamflow-db -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=teamflow \
  postgres:16-alpine
```

### 3. Database setup

```bash
npm run db:migrate -w server   # creates the schema (prisma migrate dev)
npm run db:seed -w server      # loads demo users, projects, tasks and comments
```

### 4. Run the application

```bash
npm run dev
```

This starts the API on <http://localhost:5001/api> and the frontend on <http://localhost:5173>.
You can also run them separately with `npm run dev -w server` and `npm run dev -w client`.

### Other useful scripts

```bash
npm run build     # typecheck + build both workspaces
npm run test      # backend integration tests (Vitest + Supertest)
npm run lint      # ESLint for both workspaces
```

## Demo credentials

The seed script creates four demo users that all share the same documented demo password.

```text
Email:    alex@example.com      (owner of "University Library" and "Smart Campus")
Email:    maria@example.com     (owner of "E-commerce Platform")
Email:    john@example.com
Email:    david@example.com

Password: Password123!
```

These are throwaway demo accounts for local development only.

## API overview

All endpoints are prefixed with `/api`. Authenticated endpoints expect an
`Authorization: Bearer <token>` header. Errors use the shape
`{ "error": { "message": string, "details"?: [{ field, message }] } }`.

| Method | URL | Auth | Request body | Response |
| ------ | --- | ---- | ------------ | -------- |
| GET | `/health` | no | – | `200 { status: "ok" }` |
| POST | `/auth/register` | no | `{ name, email, password }` | `201 { user, token }` |
| POST | `/auth/login` | no | `{ email, password }` | `200 { user, token }` |
| GET | `/auth/me` | yes | – | `200 { id, name, email, avatar }` |
| GET | `/projects` | yes | – | `200 Project[]` with `progress`, `totalTasks`, `memberCount` |
| POST | `/projects` | yes | `{ name, description?, deadline? }` | `201 Project` (creator becomes `OWNER`) |
| GET | `/projects/:id` | member | – | `200 Project` with `members`, `currentUserRole` |
| PUT | `/projects/:id` | owner | `{ name?, description?, deadline? }` | `200 Project` |
| DELETE | `/projects/:id` | owner | – | `204` |
| GET | `/projects/:id/members` | member | – | `200 ProjectMember[]` |
| POST | `/projects/:id/members` | owner | `{ email }` | `201 ProjectMember` |
| DELETE | `/projects/:id/members/:userId` | owner | – | `204` |
| GET | `/projects/:id/tasks` | member | – | `200 Task[]` |
| POST | `/projects/:id/tasks` | member | `{ title, description?, status?, priority?, dueDate?, assigneeId? }` | `201 Task` |
| GET | `/tasks/:id` | member | – | `200 Task` |
| PUT | `/tasks/:id` | member | any task field | `200 Task` |
| DELETE | `/tasks/:id` | owner or assignee | – | `204` |
| GET | `/tasks/:id/comments` | member | – | `200 Comment[]` |
| POST | `/tasks/:id/comments` | member | `{ text }` | `201 Comment` |
| DELETE | `/comments/:id` | author or project owner | – | `204` |
| GET | `/dashboard` | yes | – | `200 { projectCount, assignedTaskCount, completedTaskCount, upcomingTasks }` |

Status codes used: `200`, `201`, `204`, `400` (validation / malformed JSON), `401` (missing or
invalid token), `403` (not a member, or member attempting an owner-only action), `404`, `409`
(duplicate email or membership), `500`.

## Data model

```text
User 1─┬─* ProjectMember *─┬─1 Project
       │                    │
       ├─* Task (assignee) *┘
       │
       └─* Comment *─1 Task
```

Enums: `ProjectRole` (`OWNER`, `MEMBER`), `TaskStatus` (`TODO`, `IN_PROGRESS`, `DONE`),
`TaskPriority` (`LOW`, `MEDIUM`, `HIGH`).

Deleting a project cascades to its memberships, tasks and their comments; deleting a task cascades
to its comments; deleting a user nulls out the `assigneeId` of their tasks.

Project progress is never stored — it is derived from task data as
`round(completedTasks / totalTasks * 100)`, and is `0` when a project has no tasks.

## Backend rules enforced server-side

1. A user can only read projects they are a member of.
2. Owner-only actions: update/delete project, add/remove members.
3. A task always belongs to an existing project the requester is a member of.
4. An assignee must be a member of the same project.
5. A comment must belong to an existing task in a project the requester is a member of.
6. Comments can only be deleted by their author or the project owner.
7. Email addresses are unique (`409` on conflict).
8. Project membership is unique (`@@unique([projectId, userId])`).
9. Task status and priority must be valid enum values.
10. Passwords are bcrypt-hashed and password hashes are never returned by the API.

## Deployment (Netlify + Render)

Netlify serves static sites, so it hosts the `client` build only. The Express API and PostgreSQL
database run on a separate host — the committed `render.yaml` blueprint sets both up on Render, but
Railway or Fly.io work the same way.

The two deployments reference each other, so each variable holds the *other* side's URL:

| Where | Variable | Value | Notes |
| ----- | -------- | ----- | ----- |
| Netlify | `VITE_API_URL` | `https://teamflow-api.onrender.com/api` | The API host, **not** the Netlify URL. Keep the `/api` suffix. |
| Render | `CLIENT_URL` | `https://your-site.netlify.app` | Origin only — no path, no trailing slash. |

### Frontend on Netlify

`netlify.toml` already contains the required configuration:

- build command `npm run build -w client` run from the repository root, so npm workspaces resolve
- publish directory `client/dist`
- a `/* → /index.html` rewrite with status 200, without which refreshing `/dashboard` or
  `/projects/:id/board` returns Netlify's 404 page instead of the app

The only manual step is adding `VITE_API_URL` (for example `https://teamflow-api.onrender.com/api`)
in **Site settings → Environment variables**. Vite inlines `VITE_*` values at build time, so it must
be set before the build runs, and anything in a `VITE_` variable ends up publicly readable in the
bundle — never put `JWT_SECRET` or `DATABASE_URL` there. The API must be reachable over HTTPS, since
browsers block plain-HTTP requests from an HTTPS page.

### Backend on Render

Point Render at the repository and it will pick up `render.yaml`, which provisions a free PostgreSQL
instance, injects `DATABASE_URL`, generates a `JWT_SECRET`, builds with
`npm run build -w server` (Prisma client generation plus TypeScript) and starts with
`npm run start -w server` (which runs `prisma migrate deploy` before booting the server).

The install step uses `npm install --include=dev` on purpose. `NODE_ENV=production` makes npm skip
devDependencies, which would leave the build without `typescript` and `@types/node` and fail with
`error TS2688: Cannot find type definition file for 'node'`. For the same reason `prisma` is a
runtime dependency rather than a dev dependency: the start command needs its CLI to apply
migrations.

Set `CLIENT_URL` to your Netlify origin, for example `https://teamflow.netlify.app`. It accepts a
comma-separated list, so you can add deploy-preview origins alongside the production one. Render
provides `PORT` automatically.

To load the demo data on the deployed database, run the seed once against its connection string:

```bash
DATABASE_URL="<render-connection-string>" npm run db:seed -w server
```

Note that Render's free web services sleep when idle, so the first request after a pause takes a few
seconds — worth knowing before a live presentation.

## Testing

```bash
npm run test
```

The Vitest + Supertest suite covers registration, validation failures, login, the protected
`/auth/me` route, project creation and ownership, unauthorized project access, task creation,
invalid assignees, invalid task data and duplicate membership. The integration suites require a
reachable PostgreSQL instance; if the database is unreachable they are skipped rather than failing.
Running the tests truncates the database, so re-run `npm run db:seed -w server` afterwards to get
the demo data back.

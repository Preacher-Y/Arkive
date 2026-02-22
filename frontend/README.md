# FluxBoard (React + TypeScript Kanban)

Trello-like kanban app (Boards → Columns → Tasks) built with a different UI style and local-only persistence.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## Demo Credentials

- `user1@example.com` / `Password123!`
- `user2@example.com` / `Password123!`

Notes:
- Auth is hardcoded/local-only (no backend).
- Seed data is created automatically on first run if localStorage is empty.

## Feature Checklist

- [x] Vite + React + TypeScript
- [x] React Router pages: `/login`, `/signup`, `/boards`, `/boards/:boardId`
- [x] Hardcoded auth + localStorage persistence
- [x] Seeded users, boards, columns, and tasks on first run
- [x] Boards home grid with member count + avatar initials
- [x] Create board modal (default columns: To-do / Doing / Done)
- [x] Board header with members + settings dropdown
- [x] Horizontal kanban columns
- [x] Column CRUD: add, inline rename, delete (deletes tasks with confirmation)
- [x] Task CRUD: create, view/edit in side panel, delete confirmation
- [x] Task fields: title, description, color, done state, assignees
- [x] Drag & drop tasks within a column and across columns (`@dnd-kit`)
- [x] Member toggle UI (“Friends on this board”)
- [x] Per-user board background picker (slide-in panel, 6 options incl. gradients)
- [x] Assign to me button
- [x] Done/Not done checkboxes on card + details panel
- [x] Invalid board route handling (Not Found + back link)
- [x] Typed state (no `any`)

## Data Model + Persistence (Brief)

App data is stored in one localStorage key as a typed `AppState` object:

- `users`: `Record<string, User>`
- `boards`: `Record<string, Board>`
- `columns`: `Record<string, Column>`
- `tasks`: `Record<string, Task>`
- `auth`: `{ currentUserId: string | null }`

A custom `useReducer` + Context store manages updates. Every state change is persisted to localStorage via `useEffect`, so refreshes retain boards, columns, tasks, auth, and per-user board background preferences.


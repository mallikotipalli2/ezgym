# Task Planner — Technical Documentation

> **Version:** 1.0.0  
> **Repository:** https://github.com/mallikotipalli2/Task-Planner  
> **Last Updated:** 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack Summary](#2-tech-stack-summary)
3. [Architecture Overview](#3-architecture-overview)
4. [Frontend](#4-frontend)
5. [Backend (API)](#5-backend-api)
6. [Database](#6-database)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Data Storage Strategy](#8-data-storage-strategy)
9. [API Reference](#9-api-reference)
10. [Deployment](#10-deployment)
11. [Environment Variables](#11-environment-variables)
12. [Project Structure](#12-project-structure)

---

## 1. Project Overview

**Task Planner** is a full-stack daily task management web application. Users can create, complete, reorder, archive, and track tasks on a per-day basis. The app supports two modes:

- **Guest Mode** — data stored locally in the browser (IndexedDB) with no account required.
- **Authenticated Mode** — data synced to a cloud PostgreSQL database (Supabase) with user accounts.

Key features:
- Daily task CRUD with drag-and-drop reordering
- Task completion tracking with timestamps
- Task archiving (completed tasks can be archived for history)
- Productivity chart (weekly stats via Chart.js)
- Light/Dark theme toggle
- Password management (change password)
- Auto-sync every 5 seconds + on tab focus (authenticated users)

---

## 2. Tech Stack Summary

| Layer            | Technology                          | Purpose                              |
|------------------|-------------------------------------|--------------------------------------|
| **Language**     | TypeScript                          | Type-safe code across frontend & API |
| **Frontend**     | React 18                            | UI component library                 |
| **Build Tool**   | Vite 6                              | Dev server & production bundler      |
| **State Mgmt**   | Zustand 4                           | Lightweight global state management  |
| **Drag & Drop**  | @dnd-kit (core + sortable)          | Task reordering via drag-and-drop    |
| **Charts**       | Chart.js + react-chartjs-2          | Weekly productivity chart            |
| **Local DB**     | Dexie.js (IndexedDB wrapper)        | Offline/guest data persistence       |
| **Cloud DB**     | Supabase (PostgreSQL)               | Cloud data storage for auth users    |
| **Auth**         | Custom JWT + bcryptjs               | User registration, login, sessions   |
| **Backend**      | Vercel Serverless Functions          | API routes (Node.js runtime)         |
| **Hosting**      | Vercel                              | Frontend + API deployment            |
| **CSS**          | Vanilla CSS with CSS Variables       | Theming (light/dark)                 |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  React   │  │ Zustand   │  │ Dexie.js │  │ localStorage  │   │
│  │   UI     │──│  Store    │──│ IndexedDB│  │ (theme/token) │   │
│  └──────────┘  └────┬─────┘  └──────────┘  └───────────────┘   │
│                     │                                           │
│           ┌─────────┴─────────┐                                 │
│           │   Storage Router  │                                 │
│           │  (isAuthenticated)│                                 │
│           └──┬────────────┬───┘                                 │
│      Guest   │            │  Authenticated                      │
│   (IndexedDB)│            │  (REST API)                         │
└──────────────┘            └─────────────────────────────────────┘
                                      │
                                      ▼
                     ┌────────────────────────────────┐
                     │  Vercel Serverless Functions    │
                     │  (api/ directory)               │
                     │                                 │
                     │  /api/auth/register  (POST)     │
                     │  /api/auth/login     (POST)     │
                     │  /api/auth/me        (GET)      │
                     │  /api/auth/change-password (POST)│
                     │  /api/tasks          (GET/PUT)  │
                     │  /api/archive        (GET/POST/ │
                     │                       DELETE)   │
                     │  /api/stats          (GET)      │
                     │  /api/health         (GET)      │
                     └───────────────┬────────────────┘
                                     │
                                     ▼
                     ┌────────────────────────────────┐
                     │  Supabase (PostgreSQL)          │
                     │                                 │
                     │  Tables:                        │
                     │    • users                      │
                     │    • tasks                      │
                     │    • archived_tasks             │
                     └────────────────────────────────┘
```

---

## 4. Frontend

### 4.1 Framework & Tooling

- **React 18** with functional components and hooks
- **TypeScript** with strict mode (`strict: true` in `tsconfig.json`)
- **Vite 6** for development (HMR on port 3000) and production builds
- **Target:** ES2020, JSX transform: `react-jsx`

### 4.2 State Management — Zustand

Two Zustand stores manage application state:

| Store          | File               | Responsibility                                                |
|----------------|--------------------|---------------------------------------------------------------|
| `useTaskStore` | `src/store.ts`     | Tasks, theme, date navigation, archive, weekly stats, sync    |
| `useAuthStore` | `src/authStore.ts` | Authentication mode, user object, login/register/logout flows |

**Storage Router Pattern:** The task store uses a unified storage layer (`src/store.ts`) that checks `isAuthenticated()` (presence of JWT token in `localStorage`) and routes every data operation to either local (IndexedDB via Dexie) or cloud (REST API) storage.

### 4.3 UI Components

All components are in `src/components/`:

| Component            | Purpose                                               |
|----------------------|-------------------------------------------------------|
| `Header`             | App title, date navigation, theme toggle, user menu   |
| `TaskInput`          | Text input for adding new tasks                       |
| `TaskList`           | Renders the task list with drag-and-drop container     |
| `TaskItem`           | Single task row (checkbox, text, delete button)        |
| `SortableTaskItem`   | Wraps `TaskItem` with @dnd-kit sortable behavior       |
| `ProgressBar`        | Visual progress bar for daily task completion          |
| `ProductivityChart`  | Weekly bar chart using Chart.js                        |
| `ArchiveView`        | Displays archived completed tasks                     |
| `AuthPage`           | Full-page login/register screen (pre-auth)            |
| `AuthModal`          | Modal overlay for login/register (in-app)             |
| `ProfileModal`       | User profile modal with change password               |
| `ThemeToggle`        | Light/dark theme switch                               |
| `EmptyState`         | Shown when no tasks exist for the selected day        |

### 4.4 Drag and Drop

Task reordering uses **@dnd-kit** (v6/v8):
- `@dnd-kit/core` — DnD context and collision detection
- `@dnd-kit/sortable` — sortable list abstraction
- `@dnd-kit/utilities` — CSS transform utilities

Tasks have an `order` field (integer) that determines sort position. Reordering updates the `order` field on all affected tasks and persists them.

### 4.5 Charts

**Chart.js** with **react-chartjs-2** renders a 7-day productivity bar chart showing total vs. completed tasks per day. Data is sourced from:
- **Guest:** IndexedDB queries across active + archived tasks
- **Authenticated:** `/api/stats?start=...&end=...` endpoint

### 4.6 Theming

- Theme preference (`light` | `dark`) is stored in `localStorage`
- Applied via `data-theme` attribute on `<html>` element
- CSS variables in `src/index.css` define all theme colors

---

## 5. Backend (API)

### 5.1 Runtime

All API routes are **Vercel Serverless Functions** (Node.js runtime via `@vercel/node`). Each file in the `api/` directory becomes an HTTP endpoint automatically.

### 5.2 Route Structure

```
api/
├── auth/
│   ├── register.ts        POST   /api/auth/register
│   ├── login.ts           POST   /api/auth/login
│   ├── me.ts              GET    /api/auth/me
│   └── change-password.ts POST   /api/auth/change-password
├── tasks.ts               GET|PUT   /api/tasks
├── archive.ts             GET|POST|DELETE  /api/archive
├── stats.ts               GET    /api/stats
└── health.ts              GET    /api/health
```

### 5.3 CORS

Every API handler sets CORS headers manually:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```
All handlers respond to `OPTIONS` preflight requests with `204 No Content`.

### 5.4 Database Client

Each API route creates its own Supabase client using the **service role key** (bypasses RLS):
```typescript
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
```

---

## 6. Database

### 6.1 Provider

**Supabase** — a hosted PostgreSQL service. The project uses Supabase purely as a PostgreSQL database with the REST API (via `@supabase/supabase-js`). Supabase's built-in auth is **not** used; the app implements its own JWT-based authentication.

### 6.2 Schema

The database has **3 tables** defined in `supabase-setup.sql`:

#### `users`
| Column          | Type           | Constraints                      |
|-----------------|----------------|----------------------------------|
| `id`            | `UUID`         | PRIMARY KEY, auto-generated      |
| `username`      | `VARCHAR(20)`  | UNIQUE, NOT NULL                 |
| `password_hash` | `TEXT`         | NOT NULL (bcrypt hash)           |
| `created_at`    | `TIMESTAMPTZ`  | DEFAULT NOW()                    |

#### `tasks`
| Column          | Type           | Constraints                              |
|-----------------|----------------|------------------------------------------|
| `id`            | `TEXT`         | PRIMARY KEY                              |
| `user_id`       | `UUID`         | NOT NULL, FK → users(id) ON DELETE CASCADE |
| `date`          | `VARCHAR(10)`  | NOT NULL (YYYY-MM-DD format)             |
| `text`          | `VARCHAR(200)` | NOT NULL                                 |
| `completed`     | `BOOLEAN`      | DEFAULT FALSE                            |
| `created_at`    | `TIMESTAMPTZ`  | DEFAULT NOW()                            |
| `completed_at`  | `TIMESTAMPTZ`  | Nullable                                 |
| `sort_order`    | `INTEGER`      | DEFAULT 0                                |

**Index:** `idx_tasks_user_date` on `(user_id, date)`

#### `archived_tasks`
| Column          | Type           | Constraints                              |
|-----------------|----------------|------------------------------------------|
| `id`            | `TEXT`         | PRIMARY KEY                              |
| `user_id`       | `UUID`         | NOT NULL, FK → users(id) ON DELETE CASCADE |
| `date`          | `VARCHAR(10)`  | NOT NULL (YYYY-MM-DD format)             |
| `text`          | `VARCHAR(200)` | NOT NULL                                 |
| `created_at`    | `TIMESTAMPTZ`  | NOT NULL                                 |
| `completed_at`  | `TIMESTAMPTZ`  | NOT NULL                                 |
| `archived_at`   | `TIMESTAMPTZ`  | DEFAULT NOW()                            |

**Index:** `idx_archived_user_date` on `(user_id, date)`

### 6.3 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│    users     │       │      tasks       │       │   archived_tasks     │
├──────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (PK, UUID)│◄──┐   │ id (PK, TEXT)    │       │ id (PK, TEXT)        │
│ username     │   ├───│ user_id (FK)     │       │ user_id (FK)         │──┐
│ password_hash│   │   │ date             │       │ date                 │  │
│ created_at   │   │   │ text             │       │ text                 │  │
└──────────────┘   │   │ completed        │       │ created_at           │  │
                   │   │ created_at       │       │ completed_at         │  │
                   │   │ completed_at     │       │ archived_at          │  │
                   │   │ sort_order       │       └──────────────────────┘  │
                   │   └──────────────────┘                                │
                   └───────────────────────────────────────────────────────┘
                              1 user : many tasks
                              1 user : many archived_tasks
```

### 6.4 Security Model

- **Row Level Security (RLS):** Disabled on all tables.
- **Access Control:** Handled at the application layer — every API route extracts `userId` from the JWT and filters queries by `user_id`.
- **Cascade Deletes:** Deleting a user automatically deletes all their tasks and archived tasks (`ON DELETE CASCADE`).

### 6.5 Local Database (Guest Mode)

Guest mode uses **Dexie.js** (IndexedDB wrapper) with 2 object stores:

| Store            | Key   | Indexes           |
|------------------|-------|--------------------|
| `tasks`          | `id`  | `date`, `order`    |
| `archivedTasks`  | `id`  | `date`, `archivedAt`|

Schema versioning is handled via Dexie's `version()` API (currently at version 2).

A one-time **migration** (`src/storage.ts → migrateFromLocalStorage()`) converts any legacy `localStorage` task data to IndexedDB on first load.

---

## 7. Authentication & Authorization

### 7.1 Overview

The app uses a **custom JWT-based auth system** (not Supabase Auth). This gives full control over user management.

### 7.2 Registration Flow

```
Client                          Server (/api/auth/register)           Supabase (PostgreSQL)
  │                                    │                                     │
  │  POST { username, password }       │                                     │
  │───────────────────────────────────►│                                     │
  │                                    │  Validate:                          │
  │                                    │   - username: 3-20 chars            │
  │                                    │   - password: 4-64 chars            │
  │                                    │                                     │
  │                                    │  Check if username exists           │
  │                                    │────────────────────────────────────►│
  │                                    │◄────────────────────────────────────│
  │                                    │                                     │
  │                                    │  bcrypt.hash(password, 10)          │
  │                                    │                                     │
  │                                    │  INSERT INTO users                  │
  │                                    │────────────────────────────────────►│
  │                                    │◄────────────────────────────────────│
  │                                    │                                     │
  │                                    │  jwt.sign({ userId, username },     │
  │                                    │            JWT_SECRET,              │
  │                                    │            { expiresIn: '30d' })    │
  │                                    │                                     │
  │  { token, user: { id, username } } │                                     │
  │◄───────────────────────────────────│                                     │
  │                                    │                                     │
  │  Store token in localStorage       │                                     │
  │  (taskplanner:token)               │                                     │
```

### 7.3 Login Flow

```
Client                          Server (/api/auth/login)              Supabase (PostgreSQL)
  │                                    │                                     │
  │  POST { username, password }       │                                     │
  │───────────────────────────────────►│                                     │
  │                                    │  SELECT user WHERE username = ?     │
  │                                    │────────────────────────────────────►│
  │                                    │◄────────────────────────────────────│
  │                                    │                                     │
  │                                    │  bcrypt.compare(password,           │
  │                                    │                 user.password_hash) │
  │                                    │                                     │
  │                                    │  jwt.sign({ userId, username },     │
  │                                    │            JWT_SECRET,              │
  │                                    │            { expiresIn: '30d' })    │
  │                                    │                                     │
  │  { token, user: { id, username } } │                                     │
  │◄───────────────────────────────────│                                     │
  │                                    │                                     │
  │  Store token + user in localStorage│                                     │
```

### 7.4 Session Verification

On every app load, the client calls `GET /api/auth/me` with the stored JWT:
- **Valid token** → user session is restored, app enters authenticated mode.
- **Invalid/expired token** → token is cleared from `localStorage`, app falls back to guest mode.

### 7.5 JWT Token Details

| Property     | Value                               |
|--------------|-------------------------------------|
| Algorithm    | HS256 (default jsonwebtoken)        |
| Payload      | `{ userId: UUID, username: string }` |
| Expiration   | 30 days                             |
| Secret       | `JWT_SECRET` env variable           |
| Transport    | `Authorization: Bearer <token>` header |
| Storage      | `localStorage` key `taskplanner:token` |

### 7.6 Password Handling

- Passwords hashed with **bcryptjs** (10 salt rounds)
- Change password flow: verify current password → bcrypt hash new password → update in DB
- Validation constraints:
  - Username: 3–20 characters, stored lowercase
  - Password: 4–64 characters

### 7.7 Auth Modes in the Client

| Mode            | Trigger                  | Data Storage | Behavior                          |
|-----------------|--------------------------|--------------|-----------------------------------|
| `guest`         | User clicks "Guest Mode" | IndexedDB    | Offline-only, no sync             |
| `authenticated` | User logs in / registers | Supabase     | Cloud sync every 5s + on tab focus|

---

## 8. Data Storage Strategy

### 8.1 Dual-Storage Architecture

The app uses a **storage router** pattern in `src/store.ts`:

```
isAuthenticated() → true  → cloudStorage.ts → REST API → Supabase PostgreSQL
isAuthenticated() → false → storage.ts      → Dexie.js → IndexedDB (browser)
```

Every data operation (load, save, archive, stats) is routed through this check transparently — UI components are unaware of which storage backend is active.

### 8.2 Sync Mechanism (Authenticated Mode)

- **Polling:** Every 5 seconds, the task store calls `sync()` to re-fetch data from the server.
- **Visibility:** On tab re-focus (`visibilitychange` event), an immediate sync is triggered.
- **Write-through:** Every mutation (add, toggle, delete, reorder) immediately PUTs the full task list for that date to the server.

### 8.3 Data Lifecycle

```
 [New Task] ──► tasks table (active)
                    │
                    ▼
 [Complete Task] ── tasks table (completed = true, completed_at = timestamp)
                    │
                    ▼
 [Archive] ──────► archived_tasks table (tasks removed from active, inserted into archive)
                    │
                    ▼
 [Delete Archive] ─ archived_tasks row deleted
```

---

## 9. API Reference

### 9.1 Auth Endpoints

#### `POST /api/auth/register`
Create a new user account.

| Field      | Type   | Rules              |
|------------|--------|--------------------|
| `username` | string | 3–20 chars         |
| `password` | string | 4–64 chars         |

**Response (201):**
```json
{ "token": "jwt...", "user": { "id": "uuid", "username": "john" } }
```

**Errors:** `400` (validation), `409` (username taken), `500` (server error)

---

#### `POST /api/auth/login`
Authenticate an existing user.

| Field      | Type   |
|------------|--------|
| `username` | string |
| `password` | string |

**Response (200):**
```json
{ "token": "jwt...", "user": { "id": "uuid", "username": "john" } }
```

**Errors:** `400` (missing fields), `401` (invalid credentials)

---

#### `GET /api/auth/me`
Verify current session. Requires `Authorization: Bearer <token>`.

**Response (200):**
```json
{ "user": { "userId": "uuid", "username": "john" } }
```

**Errors:** `401` (not authenticated)

---

#### `POST /api/auth/change-password`
Change current user's password. Requires `Authorization: Bearer <token>`.

| Field             | Type   | Rules        |
|-------------------|--------|--------------|
| `currentPassword` | string | Required     |
| `newPassword`     | string | 4–64 chars   |

**Response (200):** `{ "ok": true }`

**Errors:** `400` (validation), `401` (wrong current password), `404` (user not found)

---

### 9.2 Task Endpoints

All require `Authorization: Bearer <token>`.

#### `GET /api/tasks?date=YYYY-MM-DD`
Load tasks for a specific date.

**Response (200):**
```json
{
  "tasks": [
    { "id": "abc", "text": "Buy milk", "completed": false, "createdAt": "...", "order": 0 }
  ]
}
```

---

#### `PUT /api/tasks`
Save (full replace) all tasks for a date.

**Body:**
```json
{
  "date": "2025-01-15",
  "tasks": [
    { "id": "abc", "text": "Buy milk", "completed": true, "createdAt": "...", "completedAt": "...", "order": 0 }
  ]
}
```

**Response (200):** `{ "ok": true }`

---

### 9.3 Archive Endpoints

All require `Authorization: Bearer <token>`.

#### `GET /api/archive`
Load all archived tasks for the user (ordered by `archived_at` descending).

**Response (200):**
```json
{
  "archivedTasks": [
    { "id": "abc", "date": "2025-01-14", "text": "Buy milk", "createdAt": "...", "completedAt": "...", "archivedAt": "..." }
  ]
}
```

---

#### `POST /api/archive`
Archive completed tasks (moves from `tasks` → `archived_tasks`).

**Body:**
```json
{
  "date": "2025-01-15",
  "tasks": [
    { "id": "abc", "text": "Buy milk", "createdAt": "...", "completedAt": "..." }
  ]
}
```

---

#### `DELETE /api/archive?id=<taskId>`
Delete a single archived task.

#### `DELETE /api/archive?all=true`
Delete all archived tasks for the user.

---

### 9.4 Stats Endpoint

#### `GET /api/stats?start=YYYY-MM-DD&end=YYYY-MM-DD`
Get task completion records in a date range (for charts).

**Response (200):**
```json
{
  "records": [
    { "date": "2025-01-15", "completed": true },
    { "date": "2025-01-15", "completed": false }
  ]
}
```

---

### 9.5 Health Endpoint

#### `GET /api/health`
Check API health and environment variable presence.

**Response (200):**
```json
{
  "status": "ok",
  "checks": {
    "SUPABASE_URL": true,
    "SUPABASE_SERVICE_KEY": true,
    "JWT_SECRET": true
  }
}
```

---

## 10. Deployment

### 10.1 Platform

The application is deployed on **Vercel**:
- **Frontend:** Vite build output (`dist/`) served as static files
- **Backend:** Files in `api/` directory auto-deployed as serverless functions
- **Branch:** `master` (auto-deploys on push)

### 10.2 Vercel Configuration (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- API routes are passed through to serverless functions
- All other routes serve `index.html` (SPA client-side routing)

### 10.3 Build Process

```bash
npm run build
# Executes: tsc -b && vite build
```

1. TypeScript compiler (`tsc -b`) type-checks the source
2. Vite bundles the React app into `dist/`

### 10.4 Database Setup

1. Create a free project on [Supabase](https://supabase.com)
2. Navigate to **SQL Editor** in the Supabase dashboard
3. Run the contents of `supabase-setup.sql` to create all tables, indexes, and grants
4. Go to **Settings → API** to obtain `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

---

## 11. Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable               | Required | Description                                      |
|------------------------|----------|--------------------------------------------------|
| `SUPABASE_URL`         | Yes      | Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Yes      | Supabase service role key (full access, bypasses RLS)   |
| `JWT_SECRET`           | Yes      | Secret string for signing/verifying JWT tokens          |

**Local development:** Create a `.env` file at the project root (see `.env.example`).

---

## 12. Project Structure

```
Task-Planner/
│
├── api/                          # Vercel Serverless Functions (backend)
│   ├── auth/
│   │   ├── register.ts           # POST /api/auth/register
│   │   ├── login.ts              # POST /api/auth/login
│   │   ├── me.ts                 # GET  /api/auth/me
│   │   └── change-password.ts    # POST /api/auth/change-password
│   ├── tasks.ts                  # GET|PUT /api/tasks
│   ├── archive.ts                # GET|POST|DELETE /api/archive
│   ├── stats.ts                  # GET /api/stats
│   └── health.ts                 # GET /api/health
│
├── src/                          # Frontend source (React + TypeScript)
│   ├── components/
│   │   ├── index.ts              # Barrel export for all components
│   │   ├── Header.tsx
│   │   ├── TaskInput.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── SortableTaskItem.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ProductivityChart.tsx
│   │   ├── ArchiveView.tsx
│   │   ├── AuthPage.tsx
│   │   ├── AuthModal.tsx
│   │   ├── ProfileModal.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── EmptyState.tsx
│   ├── App.tsx                   # Root component, auth init, sync loop
│   ├── main.tsx                  # React DOM entry point
│   ├── store.ts                  # Zustand task store (dual-storage router)
│   ├── authStore.ts              # Zustand auth store
│   ├── cloudStorage.ts           # Cloud API client (fetch wrappers)
│   ├── storage.ts                # Local storage (IndexedDB via Dexie)
│   ├── db.ts                     # Dexie database schema definition
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── utils.ts                  # Date formatting utilities
│   ├── index.css                 # Global styles + theme CSS variables
│   └── vite-env.d.ts             # Vite type declarations
│
├── index.html                    # HTML template (Vite entry)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── vercel.json                   # Vercel routing rules
├── supabase-setup.sql            # Database schema (run in Supabase SQL Editor)
├── .env.example                  # Environment variable template
├── start-planner.bat             # Local dev startup script (Windows)
├── DEPLOYMENT.md                 # Deployment instructions
└── TECH_STACK_DOCUMENT.md        # This document
```

---

*End of Technical Documentation*

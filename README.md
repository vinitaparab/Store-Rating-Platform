# Store Rating Platform

A full-stack web application where users rate stores (1–5). It has **one login for all users**, and each role gets its own dashboard and permissions.

Built for the **FullStack Intern Coding Challenge**.

| Layer    | Technology                                                  |
| -------- | ----------------------------------------------------------- |
| Frontend | React 18, React Router 7, Vite                              |
| Backend  | Node.js, Express.js                                         |
| Database | PostgreSQL (`pg` driver, parameterised SQL)                 |
| Auth     | JWT (Bearer token) + bcrypt password hashing                |

---

## Contents

1. [Quick start](#1-quick-start)
2. [Demo accounts](#2-demo-accounts)
3. [How to validate each profile](#3-how-to-validate-each-profile)
4. [Requirement coverage](#4-requirement-coverage)
5. [Design decisions and highlights](#5-design-decisions-and-highlights)
6. [Database schema](#6-database-schema)
7. [API reference](#7-api-reference)
8. [Project structure](#8-project-structure)

---

## 1. Quick start

### Prerequisites

- Node.js 18 or later
- PostgreSQL running locally

### Step 1: Create the database

```bash
psql -U postgres -c "CREATE DATABASE store_rating;"
```

### Step 2: Start the backend (port 5000)

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

`server/.env` values:

| Key              | Example                                                   |
| ---------------- | --------------------------------------------------------- |
| `PORT`           | `5000`                                                    |
| `DATABASE_URL`   | `postgresql://postgres:postgres@localhost:5432/store_rating` |
| `JWT_SECRET`     | any long random string                                    |
| `ADMIN_EMAIL`    | `admin@storerating.com`                                   |
| `ADMIN_PASSWORD` | `Admin@123`                                               |

On first start, the server **creates all tables automatically** and **seeds the default System Administrator** from the values above.

### Step 3: Start the frontend (port 5173)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` calls to `http://localhost:5000`.

---

## 2. Demo accounts

| Role                 | Email                    | Password     | Notes                                         |
| -------------------- | ------------------------ | ------------ | --------------------------------------------- |
| System Administrator | `admin@storerating.com`  | `Admin@123`  | Auto-seeded on first server start             |
| Normal User          | `vinitapp1912@gmail.com` | `Admin@123`  | Registered through the Sign Up page           |
| Store Owner          | `owner2@test.com`        | `Owner2@123` | Owner of **Naman Creation Store**             |

> **On a fresh database, only the admin account exists.** The Normal User and Store Owner accounts above come from the developer's local database. To reproduce them on your machine, follow [3.0 Recreate the demo data](#30-recreate-the-demo-data). It takes about 2 minutes and also exercises the admin and signup flows.

---

## 3. How to validate each profile

### 3.0 Recreate the demo data (fresh database only)

1. **Sign up a Normal User.** Go to http://localhost:5173/auth/signup and enter:
   - Name: `Vinita Prabhakar Parab` (at least 20 characters)
   - Email: `vinitapp1912@gmail.com`
   - Address: `Mumbai`
   - Password: `Admin@123`
2. **Log in as the admin** (`admin@storerating.com` / `Admin@123`).
3. **Create the Store Owner.** Open the **Users** tab, click **+ Add User**, and enter:
   - Name: `Naman Creation Store`
   - Email: `owner2@test.com`
   - Address: `Pune`
   - Password: `Owner2@123`
   - Role: **Store Owner**
4. **Create the store.** Open the **Stores** tab, click **+ Add Store**, and enter:
   - Name: `Naman Creation Store`
   - Email: `store2@test.com`
   - Address: `Pune`
   - Store Owner: `owner2@test.com`
5. **Add a rating.** Log in as the Normal User and rate *Naman Creation Store*. The store owner now has data to see.

### 3.1 Login / signup page (all users)

| Check                                        | Expected result                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| Open `/auth/login` and `/auth/signup`        | The same component renders both forms, switched by the `:mode` URL parameter.   |
| Open `/auth/anything-else`                   | Redirects to `/auth/login`.                                                     |
| Click the eye icon in a password field       | The password toggles between hidden and visible.                                |
| Sign up with a short name, e.g. `Test`       | Error: *Name must be 20-60 characters.*                                         |
| Sign up with password `password1`            | Error: needs 8–16 characters, 1 uppercase letter and 1 special character.       |
| Sign up with an email that already exists    | Error: *Email is already in use.*                                               |
| Log in with a wrong password                 | Error: *Invalid email or password.*                                             |

### 3.2 System Administrator: `admin@storerating.com` / `Admin@123`

| Check                                                    | Expected result                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Log in                                                   | Lands on `/dashboard`, which shows the Admin Dashboard.                      |
| Stat cards                                               | Total Users, Total Stores and Total Ratings.                                 |
| **Users** tab                                            | Table with Name, Email, Address and Role, plus a **View** button per user.   |
| Type in the Name / Email / Address filters, choose a Role | The list filters as you type.                                               |
| Click a column header                                    | Sorts ascending (▲); click again to sort descending (▼).                     |
| Click **View** on a Store Owner                          | Details include the owner's store and its **Rating**.                        |
| Click **+ Add User** (inside the Users tab)              | Opens a form to create a Normal User, Admin or Store Owner; totals refresh.  |
| **Stores** tab                                           | Table with Name, Email, Address and Rating, plus filters and sorting.        |
| Click **+ Add Store** (inside the Stores tab)            | Opens a form to create a store and optionally assign an owner.               |

### 3.3 Normal User: `vinitapp1912@gmail.com` / `Admin@123`

| Check                                         | Expected result                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| Log in                                        | Lands on `/dashboard`, which shows the **Registered Stores** list.               |
| Columns                                       | Store Name, Address, Overall Rating, Your Rating, and a Rate control.            |
| Search by name or address                     | The list filters as you type.                                                    |
| Choose 1–5 and click **Submit**               | The rating is saved and Overall Rating updates.                                  |
| Choose a new value and click **Modify**       | The existing rating is updated. Each user can rate a store only once.            |

### 3.4 Store Owner: `owner2@test.com` / `Owner2@123`

| Check                  | Expected result                                                                  |
| ---------------------- | -------------------------------------------------------------------------------- |
| Log in                 | Lands on `/dashboard`, which shows the store name, address and average rating.   |
| Raters table           | Lists every user who rated the store, with their rating and date (sortable).     |
| No store assigned      | A friendly message asks the owner to contact the administrator.                  |

### 3.5 Features shared by all roles

| Check                                                  | Expected result                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Circular avatar at the top right                       | Shows the user's first and last initials, e.g. **VP** for Vinita Prabhakar Parab. |
| Click the avatar                                       | Opens a menu with **Change Password** and **Logout**.                            |
| Click the title or logo at the top left                | Goes to the home page (the user's dashboard).                                   |
| **Change Password**                                    | Needs the current password; the new one must pass the password rules.          |
| Leave the app idle for **5 minutes**                   | Logged out automatically and sent to login with an inactivity message.          |
| Keep using the app past 5 minutes                      | Stays logged in, because every activity resets the 5-minute idle timer.        |
| As a Normal User, open `/admin` or `/owner` directly   | Redirected to `/dashboard`. The dashboard depends on the role, not the URL.     |
| Call an admin API with a Normal User's token           | `403 Forbidden`. Role checks are enforced on the server as well.               |

> **Tip for testing the idle timeout faster:** temporarily set `SESSION_MS` in `client/src/session.js` to `30 * 1000` (30 seconds).

---

## 4. Requirement coverage

| Requirement (from the challenge PDF)                                       | Status |
| -------------------------------------------------------------------------- | :----: |
| Single login for all roles, with role-based features                       | ✅ |
| Normal users can sign up (Name, Email, Address, Password)                  | ✅ |
| Admin: add stores, normal users and admin users                            | ✅ |
| Admin dashboard: total users, stores and ratings                           | ✅ |
| Admin: store list with Name, Email, Address and Rating                     | ✅ |
| Admin: user list with Name, Email, Address and Role                        | ✅ |
| Admin: filter listings by Name, Email, Address and Role                    | ✅ |
| Admin: user details, including Rating for Store Owners                     | ✅ |
| User: view and search stores (by Name and Address)                         | ✅ |
| User: see overall rating and own rating; submit and modify a rating (1–5)  | ✅ |
| Owner: list of users who rated their store, plus average rating            | ✅ |
| All roles: update password and log out                                     | ✅ |
| Validation: Name 20–60, Address ≤ 400, Password 8–16 with 1 uppercase and 1 special character, valid Email | ✅ Enforced on **both** client and server |
| Sorting (ascending/descending) on all tables                               | ✅ |

---

## 5. Design decisions and highlights

**Security**

- Passwords are hashed with **bcrypt**; plain text is never stored or returned.
- Every route is protected on the server with `authenticate` and `authorize(role)` middleware. The UI hiding a feature is not the only safeguard.
- All SQL is **parameterised**, which prevents SQL injection. Sort columns come from a **whitelist map**, so user input never reaches `ORDER BY` directly.
- Server-side validation repeats the client-side rules, so the API is safe to call directly.
- Any `401` from the API clears the session and redirects to login.

**Session handling (sliding 5-minute idle timeout)**

- The client tracks user activity (mouse, keyboard, scroll, touch) and logs the user out after 5 minutes without activity.
- While the user is active, the client calls `POST /api/auth/refresh` (at most once a minute) to get a fresh JWT. The token lives 6 minutes: the 5-minute idle limit plus a 1-minute buffer that covers the refresh gap.
- The idle deadline is kept in `localStorage`, so activity in one browser tab keeps every open tab logged in.

**Frontend architecture**

- **Role-based dashboard:** a single `/dashboard` route renders the Admin, User or Owner view from the logged-in user's role, so the URL can't be used to reach another role's screen.
- **One `AuthPage` component** handles both login and signup through the `/auth/:mode` route parameter.
- **Reusable components:** a generic `DataTable` (columns config, sorting and custom cell renderers), `PasswordInput` (show/hide toggle) and `ProtectedRoute`.
- Authentication state lives in a React Context (`AuthContext`), and a small `api()` wrapper centralises headers, JSON parsing and error handling.
- Filtering and sorting happen **on the server**, so the approach still works as the data grows.
- Stale responses are ignored when filters change quickly (an `active` flag in `useEffect`).

**Database**

- The schema is normalised into three tables: `users`, `stores` and `ratings`. Foreign keys use `ON DELETE CASCADE` or `SET NULL` as appropriate.
- `UNIQUE (user_id, store_id)` on `ratings` guarantees one rating per user per store. Submitting and modifying a rating is a single **upsert**.
- `CHECK` constraints enforce `rating BETWEEN 1 AND 5` and valid role values at the database level.
- `stores.owner_id` is `UNIQUE`, so each owner has at most one store.
- Indexes on `ratings.store_id` and `users.role` speed up averages and role filters.
- Averages are computed live with SQL `AVG()`, so they are never stale.

---

## 6. Database schema

```
users                         stores                         ratings
─────────────────────         ─────────────────────          ─────────────────────────
id            PK              id          PK                 id          PK
name          VARCHAR(60)     name        VARCHAR(60)        user_id     FK → users.id   (CASCADE)
email         UNIQUE          email       UNIQUE             store_id    FK → stores.id  (CASCADE)
password_hash                 address     VARCHAR(400)       rating      SMALLINT CHECK 1..5
address       VARCHAR(400)    owner_id    FK → users.id      created_at / updated_at
role          ADMIN|USER|OWNER            UNIQUE, SET NULL   UNIQUE (user_id, store_id)
created_at                    created_at
```

The full DDL is in [`server/src/schema.sql`](server/src/schema.sql).

---

## 7. API reference

All routes are prefixed with `/api`. Protected routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint               | Role          | Description                                              |
| ------ | ---------------------- | ------------- | -------------------------------------------------------- |
| POST   | `/auth/signup`         | Public        | Register a Normal User                                   |
| POST   | `/auth/login`          | Public        | Log in; returns a JWT and user profile                   |
| POST   | `/auth/refresh`        | Any logged-in | Renew the JWT (sliding session)                          |
| PUT    | `/auth/password`       | Any logged-in | Change password (requires the current password)          |
| GET    | `/admin/stats`         | ADMIN         | Total users, stores and ratings                          |
| GET    | `/admin/users`         | ADMIN         | List users; filters `name, email, address, role`; `sortBy`, `order` |
| GET    | `/admin/users/:id`     | ADMIN         | User details (includes the store rating for owners)      |
| POST   | `/admin/users`         | ADMIN         | Create a user with any role                              |
| GET    | `/admin/stores`        | ADMIN         | List stores with average rating; filters and sorting     |
| POST   | `/admin/stores`        | ADMIN         | Create a store, optionally assigning an owner            |
| GET    | `/stores`              | USER          | List stores with overall rating and the user's own rating |
| PUT    | `/stores/:id/rating`   | USER          | Submit or modify a rating (upsert)                       |
| GET    | `/owner/dashboard`     | OWNER         | The owner's store, average rating and list of raters     |

---

## 8. Project structure

```
store-rating-app/
├── client/                     React + Vite frontend
│   └── src/
│       ├── api.js              fetch wrapper (auth header, errors, 401 handling)
│       ├── session.js          idle-timeout helpers
│       ├── AuthContext.jsx     auth state, login/logout, inactivity logout
│       ├── App.jsx             routes
│       ├── components/         Navbar (avatar menu), DataTable, PasswordInput, ProtectedRoute
│       ├── pages/              AuthPage, Dashboard, AdminDashboard, UserStores,
│       │                       OwnerDashboard, ChangePassword
│       └── utils/validation.js client-side form rules
└── server/                     Express backend
    └── src/
        ├── server.js           app setup and error handler
        ├── initDb.js           creates the schema and seeds the admin
        ├── schema.sql          table definitions
        ├── middleware/auth.js  authenticate and authorize(role)
        ├── routes/             auth, admin, stores, owner
        └── utils/              validators, query helpers, asyncHandler
```

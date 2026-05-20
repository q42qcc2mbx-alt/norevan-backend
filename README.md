# Norevan — Full Stack

Premium streetwear shop. Backend (Express + SQLite + JWT) and frontend
(Next.js 16 + React 19 + Tailwind) live side-by-side in this folder.

```
Online-Shop/
├── server.js               # Express entry
├── config/  controllers/   # backend logic
├── middleware/  routes/
├── services/  data/
├── scripts/seed.js         # seed admin + 10 products
└── frontend/               # Next.js shop (the website)
    ├── app/  components/  lib/
    ├── public/
    └── next.config.ts
```

## Setup (first time)

### 1. Backend

```bash
cd "/Users/gassanabdalhamidbusiness/Desktop/Online-Shop"
cp .env.example .env        # then edit — set JWT_SECRET to a long random string
npm install
npm run seed                # creates admin user + 10 products in data/app.db
npm run dev                 # → http://localhost:4000
```

Default admin (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_USERNAME`
in `.env` before running `npm run seed`):

```
email:    admin@norevan.shop
password: NorevanAdmin1!
```

### 2. Frontend

In a **separate terminal**:

```bash
cd "/Users/gassanabdalhamidbusiness/Desktop/Online-Shop/frontend"
cp .env.example .env.local  # then edit — JWT_SECRET must match the backend
npm install
npm run dev                 # → http://localhost:3000
```

## Daily dev

```bash
# terminal 1 — backend (port 4000)
cd Online-Shop && npm run dev

# terminal 2 — frontend (port 3000)
cd Online-Shop/frontend && npm run dev
```

Visit:
- Shop: http://localhost:3000
- Admin: http://localhost:3000/admin → login with the seeded admin

## Architecture

```
Browser ──► Next.js (3000) ──► Express API (4000) ──► SQLite (data/app.db)
                │                       │
                ├─ /api/admin/login     ├─ /api/v1/auth/login
                ├─ /api/checkout        ├─ /api/v1/checkout
                └─ server components    ├─ /api/v1/products
                   call backend         ├─ /api/v1/orders/:id
                                        └─ /api/v1/admin/*  (JWT + is_admin)
```

- **Auth**: backend issues JWT on login; frontend stores it in an HTTP-only
  `norevan_token` cookie and forwards it to the backend on protected calls.
- **Admin**: a user with `is_admin = 1` in the SQLite `users` table.
- **Guest checkout** is allowed; if a Bearer token is present at
  `/api/v1/checkout`, the order is linked to that user.

## API quick reference

| Method | Path                          | Auth        | Purpose                    |
|--------|-------------------------------|-------------|----------------------------|
| POST   | /api/v1/auth/register         | —           | Create user account        |
| POST   | /api/v1/auth/login            | —           | Returns JWT                |
| GET    | /api/v1/dashboard             | user        | Current user info          |
| GET    | /api/v1/products              | —           | List products              |
| GET    | /api/v1/products/:slug        | —           | One product                |
| POST   | /api/v1/products              | admin       | Create                     |
| PUT    | /api/v1/products/:slug        | admin       | Upsert                     |
| DELETE | /api/v1/products/:slug        | admin       | Delete                     |
| POST   | /api/v1/checkout              | optional    | Create order               |
| GET    | /api/v1/orders/:id            | —           | Public order detail        |
| GET    | /api/v1/orders/me             | user        | Own orders                 |
| GET    | /api/v1/admin/orders          | admin       | All orders                 |
| PATCH  | /api/v1/admin/orders/:id      | admin       | Update status              |

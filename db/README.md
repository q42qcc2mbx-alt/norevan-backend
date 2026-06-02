# Database migrations

Plain SQL migrations for the Norevan Postgres/Supabase database. They are
**not auto-applied** — review each file, then run it against the database.

## Apply a migration

```bash
# via psql + the same DATABASE_URL the backend uses
psql "$DATABASE_URL" -f db/migrations/001_roles_and_analytics.sql
```

Or paste the file contents into the **Supabase SQL editor** and run it.

All migrations are written to be **idempotent** (`IF NOT EXISTS` / drop-and-recreate
constraints), so re-running them is safe.

## Migrations

| File | What it does | Status |
|------|--------------|--------|
| `001_roles_and_analytics.sql` | `users.role` (owner/admin/staff/viewer), `page_views` analytics table, `admin_audit` log | ⏳ not applied yet |

> After applying 001, promote the real owner by editing and running the
> commented `UPDATE users SET role = 'owner' …` line inside the file.

-- ============================================================================
-- Migration 007 — Task management
-- ----------------------------------------------------------------------------
-- Back-office tasks assigned to team members (users). Backend-managed (RLS on,
-- no public policies).
--   psql "$DATABASE_URL" -f db/migrations/007_tasks.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       text        NOT NULL,
  description text,
  assignee_id integer     REFERENCES users(id) ON DELETE SET NULL,
  created_by  integer     REFERENCES users(id) ON DELETE SET NULL,
  priority    text        NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status      text        NOT NULL DEFAULT 'todo'   CHECK (status IN ('todo','in_progress','done','cancelled')),
  due_date    date,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON tasks (assignee_id, status);
CREATE INDEX IF NOT EXISTS tasks_status_idx   ON tasks (status, created_at DESC);

CREATE TABLE IF NOT EXISTS task_comments (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id    bigint      NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id  integer     REFERENCES users(id) ON DELETE SET NULL,
  body       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS task_comments_task_idx ON task_comments (task_id, created_at);

ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

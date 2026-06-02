import pool from '../config/database.js';

const PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);
const STATUSES = new Set(['todo', 'in_progress', 'done', 'cancelled']);
const isAdmin = (req) => req.user?.role === 'admin' || req.user?.role === 'owner';

function rowToTask(r) {
  return {
    id: Number(r.id),
    title: r.title,
    description: r.description ?? '',
    assigneeId: r.assignee_id,
    assigneeName: r.assignee_name ?? null,
    createdBy: r.created_by,
    priority: r.priority,
    status: r.status,
    dueDate: r.due_date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function audit(actorId, action, target, meta) {
  try {
    await pool.query(
      'INSERT INTO admin_audit (actor_id, action, target, meta) VALUES ($1,$2,$3,$4)',
      [actorId ?? null, action, target ?? null, meta ? JSON.stringify(meta) : null],
    );
  } catch (e) {
    console.warn('[audit] failed:', e.message);
  }
}

/** GET /api/v1/tasks — admins see all (with filters), staff see their own. */
export const listTasks = async (req, res, next) => {
  try {
    const params = [];
    const where = [];
    if (!isAdmin(req)) {
      params.push(req.user.userId);
      where.push(`t.assignee_id = $${params.length}`);
    } else {
      if (req.query.status && STATUSES.has(String(req.query.status))) {
        params.push(req.query.status);
        where.push(`t.status = $${params.length}`);
      }
      if (req.query.assignee) {
        params.push(parseInt(req.query.assignee, 10));
        where.push(`t.assignee_id = $${params.length}`);
      }
      if (req.query.q) {
        params.push(`%${String(req.query.q).toLowerCase()}%`);
        where.push(`(lower(t.title) LIKE $${params.length} OR lower(t.description) LIKE $${params.length})`);
      }
    }
    const sql = `
      SELECT t.*, u.username AS assignee_name
      FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY
        CASE t.status WHEN 'todo' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'done' THEN 2 ELSE 3 END,
        CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        t.due_date NULLS LAST, t.created_at DESC
      LIMIT 500`;
    const { rows } = await pool.query(sql, params);
    res.json({ status: 'success', data: rows.map(rowToTask) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/tasks/assignees — team members for assignment (admin). */
export const listAssignees = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, role FROM users
       WHERE role IN ('owner','admin','staff','viewer') ORDER BY username`,
    );
    res.json({ status: 'success', data: rows });
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/tasks/:id — task + comments (admin or assignee). */
export const getTask = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ status: 'error', message: 'Invalid id' });
    const { rows } = await pool.query(
      `SELECT t.*, u.username AS assignee_name FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id WHERE t.id = $1`,
      [id],
    );
    const task = rows[0];
    if (!task) return res.status(404).json({ status: 'error', message: 'Task not found' });
    if (!isAdmin(req) && task.assignee_id !== req.user.userId) {
      return res.status(403).json({ status: 'error', message: 'Kein Zugriff' });
    }
    const { rows: comments } = await pool.query(
      `SELECT c.id, c.body, c.created_at, u.username AS author_name
       FROM task_comments c LEFT JOIN users u ON u.id = c.author_id
       WHERE c.task_id = $1 ORDER BY c.created_at`,
      [id],
    );
    res.json({
      status: 'success',
      data: {
        ...rowToTask(task),
        comments: comments.map((c) => ({
          id: Number(c.id),
          body: c.body,
          authorName: c.author_name ?? 'System',
          createdAt: c.created_at,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/v1/tasks — create (admin). */
export const createTask = async (req, res, next) => {
  try {
    const title = String(req.body?.title ?? '').trim();
    if (!title) return res.status(400).json({ status: 'error', message: 'Titel erforderlich' });
    const description = String(req.body?.description ?? '').trim() || null;
    const assigneeId = req.body?.assigneeId ? parseInt(req.body.assigneeId, 10) : null;
    const priority = PRIORITIES.has(req.body?.priority) ? req.body.priority : 'medium';
    const dueDate = req.body?.dueDate ? String(req.body.dueDate) : null;

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, assignee_id, created_by, priority, due_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [title, description, assigneeId, req.user.userId, priority, dueDate],
    );
    await audit(req.user.userId, 'task.create', String(rows[0].id), { title, assigneeId });
    res.status(201).json({ status: 'success', data: { id: Number(rows[0].id) } });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/v1/tasks/:id — admins edit anything; assignee may change status. */
export const updateTask = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ status: 'error', message: 'Invalid id' });
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = rows[0];
    if (!task) return res.status(404).json({ status: 'error', message: 'Task not found' });

    const admin = isAdmin(req);
    if (!admin && task.assignee_id !== req.user.userId) {
      return res.status(403).json({ status: 'error', message: 'Kein Zugriff' });
    }

    const sets = [];
    const params = [];
    const set = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`); };

    if (req.body.status !== undefined) {
      if (!STATUSES.has(req.body.status)) return res.status(400).json({ status: 'error', message: 'Status ungültig' });
      set('status', req.body.status);
    }
    if (admin) {
      if (req.body.title !== undefined) set('title', String(req.body.title).trim());
      if (req.body.description !== undefined) set('description', String(req.body.description).trim() || null);
      if (req.body.assigneeId !== undefined) set('assignee_id', req.body.assigneeId ? parseInt(req.body.assigneeId, 10) : null);
      if (req.body.priority !== undefined) {
        if (!PRIORITIES.has(req.body.priority)) return res.status(400).json({ status: 'error', message: 'Priorität ungültig' });
        set('priority', req.body.priority);
      }
      if (req.body.dueDate !== undefined) set('due_date', req.body.dueDate || null);
    }
    if (sets.length === 0) return res.status(400).json({ status: 'error', message: 'Keine Änderungen' });

    params.push(id);
    await pool.query(`UPDATE tasks SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`, params);
    res.json({ status: 'success', data: { id } });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/v1/tasks/:id — admin. */
export const deleteTask = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ status: 'error', message: 'Invalid id' });
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'Task not found' });
    await audit(req.user.userId, 'task.delete', String(id), null);
    res.json({ status: 'success', data: { id } });
  } catch (err) {
    next(err);
  }
};

/** POST /api/v1/tasks/:id/comments — admin or assignee. */
export const addTaskComment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = String(req.body?.body ?? '').trim().slice(0, 2000);
    if (!Number.isInteger(id) || !body) return res.status(400).json({ status: 'error', message: 'Kommentar erforderlich' });
    const { rows } = await pool.query('SELECT assignee_id FROM tasks WHERE id = $1', [id]);
    const task = rows[0];
    if (!task) return res.status(404).json({ status: 'error', message: 'Task not found' });
    if (!isAdmin(req) && task.assignee_id !== req.user.userId) {
      return res.status(403).json({ status: 'error', message: 'Kein Zugriff' });
    }
    await pool.query(
      'INSERT INTO task_comments (task_id, author_id, body) VALUES ($1,$2,$3)',
      [id, req.user.userId, body],
    );
    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

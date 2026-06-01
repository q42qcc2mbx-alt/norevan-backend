// Verifies Supabase Auth access tokens without needing the JWT secret: it asks
// Supabase's own /auth/v1/user endpoint to validate the token. Uses only the
// public project URL + anon key, so no new secret is introduced.

const SUPABASE_URL = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';

async function verifySupabaseToken(token) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !token) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const user = await res.json();
    if (!user?.id) return null;
    return { id: user.id, email: user.email ?? null };
  } catch {
    return null;
  }
}

function bearer(req) {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
}

/** Attaches req.supabaseUser when a valid token is present; never fails the request. */
export const optionalSupabaseAuth = async (req, _res, next) => {
  const token = bearer(req);
  if (token) {
    const user = await verifySupabaseToken(token);
    if (user) req.supabaseUser = user;
  }
  next();
};

/** Requires a valid Supabase session; 401 otherwise. */
export const requireSupabaseAuth = async (req, res, next) => {
  const token = bearer(req);
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }
  const user = await verifySupabaseToken(token);
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired session' });
  }
  req.supabaseUser = user;
  next();
};

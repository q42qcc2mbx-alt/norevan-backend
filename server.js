import 'dotenv/config';
import express from 'express';
import pool from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import reviewsRoutes from './routes/reviewsRoutes.js';
import discountRoutes from './routes/discountRoutes.js';
import { handleStripeWebhook } from './controllers/paymentController.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

// Behind Render's proxy — trust it so req.ip reflects the real client for
// rate limiting.
app.set('trust proxy', 1);

// ─── CORS (minimal, no extra dependency) ──────────────────────────────────
// Allowed origins come from CORS_ORIGINS (comma-separated). For dev we default
// to the Next.js shop on http://localhost:3000.
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Norevan-Locale',
    );
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Stripe webhook — needs the raw body for signature verification, so it must
// be registered BEFORE the JSON body parser below.
app.post('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Health check — no auth required
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1',          userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1',          orderRoutes);
app.use('/api/v1',          analyticsRoutes);
app.use('/api/v1',          teamRoutes);
app.use('/api/v1',          accountRoutes);
app.use('/api/v1',          reviewsRoutes);
app.use('/api/v1',          discountRoutes);

// 404 — must come after all routes
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Cannot ${req.method} ${req.path}` });
});

// Global error handler — must be last middleware
app.use(errorHandler);

// Ensure the column that links orders to a Supabase account exists. Idempotent,
// runs through the working transaction pooler on each boot/deploy.
async function ensureSchema() {
  try {
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS supabase_user_id TEXT');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_orders_supabase_user ON orders(supabase_user_id)');
    // Fulfilment details (migration 007) — kept here so prod stays in sync even
    // before the SQL file is applied by hand. Idempotent.
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT');
    // Abandoned-checkout reminder marker (migration 010).
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ');
    // Per-size stock (migration 009).
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_by_size JSONB');
    console.log('[db] schema ensured (orders fulfilment + reminder + products.stock_by_size)');
  } catch (e) {
    console.error('[db] ensureSchema failed (will retry next boot):', e.message);
  }
}

await ensureSchema();

app.listen(PORT, () => {
  console.log(`[${process.env.NODE_ENV ?? 'development'}] Server running on http://localhost:${PORT}`);
});

import { setDefaultResultOrder } from 'dns';
// Force IPv4 — Render Frankfurt resolves Supabase hostnames to IPv6 which is unreachable
setDefaultResultOrder('ipv4first');

import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

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

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Health check — no auth required
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1',          userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1',          orderRoutes);

// 404 — must come after all routes
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Cannot ${req.method} ${req.path}` });
});

// Global error handler — must be last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[${process.env.NODE_ENV ?? 'development'}] Server running on http://localhost:${PORT}`);
});

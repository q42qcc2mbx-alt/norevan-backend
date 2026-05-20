# Norevan — Deployment (Supabase + Vercel)

## 1. Supabase setup

1. Create project at https://supabase.com → New project.
2. **SQL Editor → New query** → paste `supabase/migrations/0001_init.sql` → Run.
   Creates `products`, `orders`, `order_items` tables, RLS policies, and the
   `product-images` storage bucket.
3. **Storage → product-images** → confirm bucket exists and is public.
4. **Authentication → Providers → Email**: enable. (Magic link or password — we
   use password.) Disable "Confirm email" while testing if you don't want to
   confirm via email each signup.
5. **Authentication → Users → Add user**: create your admin account with the
   email you'll put in `ADMIN_EMAILS`.

### Connection strings

Project Settings → Database → Connection string:

- **Pooled (Vercel runtime)** — port `6543`, mode "Transaction". Use in
  `DATABASE_URL` for the deployed app. Set `DATABASE_POOLED=1`.
- **Direct (migrations, seeds)** — port `5432`. Use this locally for
  `npm run db:seed` once.

## 2. Local .env.local

Copy `.env.example` → `.env.local` and fill in values from Supabase.

```bash
cp .env.example .env.local
# edit .env.local
```

## 3. Seed initial products

```bash
# Use the DIRECT connection URL in DATABASE_URL for this step.
npm run db:seed
```

Verify via Supabase → Table Editor → `products` (10 rows).

## 4. Local dev

```bash
npm run dev
# http://localhost:3000
```

Admin: http://localhost:3000/admin → login with the email you added in
Supabase Auth + the `ADMIN_EMAILS` env.

## 5. Vercel deploy

1. Push the repo to GitHub.
2. Vercel → New Project → import the repo.
3. **Environment Variables** — add every entry from `.env.example` (use the
   POOLED `DATABASE_URL`, `DATABASE_POOLED=1`).
4. Deploy.

## 6. Post-deploy

- Add the Vercel domain to Supabase **Auth → URL Configuration → Site URL**
  and **Redirect URLs**.
- Add the Supabase storage hostname to `next.config.ts` `images.remotePatterns`
  if you want Next.js Image optimization for storage URLs (currently the admin
  uploads return absolute public URLs which work as `unoptimized` images).

## Notes

- `proxy.ts` refreshes Supabase session cookies on every request.
- Admin auth: anyone in `ADMIN_EMAILS` who logs in via Supabase Auth.
- Customer orders attach `user_id` when a Supabase-Auth user is logged in;
  guest checkout still works (userId = null).

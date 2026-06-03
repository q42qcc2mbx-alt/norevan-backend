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
| `001_roles_and_analytics.sql` | `users.role` (owner/admin/staff/viewer), `page_views` analytics table, `admin_audit` log | ✅ applied to project `akzuhdogmzefszoredcj` |
| `002_role_customer_default.sql` | adds `customer` role, makes it the default (public `/register` must not grant back-office), reclassifies legacy staff | ✅ applied to project `akzuhdogmzefszoredcj` |
| `003_profile_address.sql` | adds shipping-address columns to `profiles` (first/last name, address, city, zip, country) | ✅ applied to project `akzuhdogmzefszoredcj` |
| `004_reviews.sql` | product `reviews` table (backend-managed, RLS on with no public policies) | ✅ applied to project `akzuhdogmzefszoredcj` |
| `005_discount_codes.sql` | `discount_codes` table + order discount fields; `subtotal_cents` becomes the NET charged amount | ✅ applied to project `akzuhdogmzefszoredcj` |
| `006_stock_notifications.sql` | back-in-stock email signups for sold-out products (notified once) | ✅ applied to project `akzuhdogmzefszoredcj` |
| `007_order_fulfillment.sql` | order fulfilment: shipping carrier + tracking number + internal note | ✅ applied to project `akzuhdogmzefszoredcj` |
| `008_newsletter.sql` | `newsletter_subscribers` table (service-role upsert, RLS on with no public policies) | ✅ applied to project `akzuhdogmzefszoredcj` |
| `009_stock_by_size.sql` | optional per-size inventory `products.stock_by_size` (JSON size→units), kept in sync with aggregate `stock` | ✅ applied to project `akzuhdogmzefszoredcj` |
| `010_abandoned_cart.sql` | `orders.reminder_sent_at` — marks an unpaid checkout so the reminder email is sent at most once | ✅ applied to project `akzuhdogmzefszoredcj` |
| `011_invoices_welcome.sql` | `orders.invoice_number` + `invoice_seq` sequence (§14 UStG); `profiles.welcomed_at` for the one-time welcome email | ✅ applied to project `akzuhdogmzefszoredcj` |
| `012_stripe_customer.sql` | `profiles.stripe_customer_id` — links a shopper to their Stripe customer for saved cards (no card data stored) | ✅ applied to project `akzuhdogmzefszoredcj` |

> After applying 001, promote the real owner by editing and running the
> commented `UPDATE users SET role = 'owner' …` line inside the file.

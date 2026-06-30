# FlipMate V5

Static web app for reselling margin calculation, stock tracking and sales database.

## V5 structure

- `index.html`: public landing page with video, intro and free trial entry.
- `app.html`: authenticated app page with calculator, database, dashboard and account settings.
- `app.js`: shared frontend logic.
- `styles.css`: responsive styling.
- `supabase-config.js`: public Supabase URL and publishable/anon key.
- `sql/supabase_schema.sql`: full schema for new projects.
- `sql/v5_migration_profiles_and_modes.sql`: migration for projects already using V4.
- `sql/admin_queries.sql`: admin queries for Supabase SQL Editor.

## Key changes in V5

1. Landing and app are separated.
2. Trial result is shown only after free registration/login.
3. Top bar in app shows username instead of “Accedi”.
4. Account settings include username, email-change request, reset password and payment placeholder.
5. Operational mode can be selected at signup and changed later:
   - Solo Vinted
   - Solo eBay
   - Vinted + eBay
6. Database supports stock/sales statuses.
7. CSV export is hardened against formula injection.
8. No local fallback for database in production flow.

## Deployment

1. Upload files to GitHub repository root.
2. Enable GitHub Pages from `main` / `/root`.
3. In Supabase, run SQL:
   - New project: `sql/supabase_schema.sql`
   - Existing V4 project: `sql/v5_migration_profiles_and_modes.sql`
4. Configure `supabase-config.js`:

```js
window.FLIPMATE_SUPABASE_URL = 'https://your-project.supabase.co';
window.FLIPMATE_SUPABASE_ANON_KEY = 'your-publishable-or-anon-key';
```

Never put the Supabase `service_role` or secret key in frontend code.

## Supabase settings

- Auth provider: Email enabled.
- Site URL: your GitHub Pages URL.
- Redirect URLs: your GitHub Pages URL and `app.html` path.
- RLS enabled on `products` and `profiles`.

## Test checklist

1. Open landing page.
2. Fill the free trial.
3. Click “Vedi risultato gratis”.
4. Register in app page.
5. Verify result appears after login.
6. Save product.
7. Verify row in Supabase `products`.
8. Register second user.
9. Verify each user sees only their rows.
10. Export CSV and verify only current user's rows are exported.

## Premium

Premium is not active yet. Payment button is intentionally disabled. For production, integrate Stripe or another payment provider and validate plan server-side / database-side. Do not rely only on frontend code for premium access.

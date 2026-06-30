# Security notes

## Current model

- Hosting: GitHub Pages static files.
- Auth: Supabase Auth.
- Database: Supabase Postgres.
- Access control: Row Level Security on `products` and `profiles`.
- Frontend key: Supabase publishable/anon key only.

## Do not do

- Do not put `service_role` or secret keys in GitHub.
- Do not disable RLS on user tables.
- Do not store passwords in app tables or localStorage.
- Do not implement paid premium only through frontend checks.

## V5 hardening

- Trial result requires login.
- App page is separated from public landing page.
- CSV export escapes formula prefixes: `=`, `+`, `-`, `@`.
- User profile is separated from product data.
- Payment methods are placeholder only; no card data is collected.

## Recommended production additions

- Email confirmation enabled.
- Strong password rules.
- Leaked password protection if available on the selected Supabase plan.
- Formal privacy policy with controller/contact details.
- Cookie banner if adding analytics or advertising cookies.
- Stripe Customer Portal for payments instead of storing payment data.

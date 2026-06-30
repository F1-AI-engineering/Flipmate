-- FlipMate Supabase sandbox schema
-- Run in Supabase SQL Editor.
-- Security model: authenticated users can read/write only their own rows through Row Level Security.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product_name text not null,
  category text,
  source_platform text default 'Vinted',
  purchase_price numeric(12,2) default 0,
  purchase_shipping numeric(12,2) default 0,
  buyer_shipping numeric(12,2) default 0,
  real_shipping numeric(12,2) default 0,
  packaging_cost numeric(12,2) default 0,
  sold_avg_price numeric(12,2) default 0,
  all_in_cost numeric(12,2) default 0,
  fair_value numeric(12,2) default 0,
  listing_price numeric(12,2) default 0,
  min_offer numeric(12,2) default 0,
  break_even numeric(12,2) default 0,
  max_buy_price numeric(12,2) default 0,
  profit numeric(12,2) default 0,
  roi numeric(12,2) default 0,
  decision text,
  status text default 'watchlist',
  sale_price numeric(12,2),
  sale_date date,
  notes text
);

alter table public.products enable row level security;

-- Drop policies before recreate for repeatable setup.
drop policy if exists "products_select_own" on public.products;
drop policy if exists "products_insert_own" on public.products;
drop policy if exists "products_update_own" on public.products;
drop policy if exists "products_delete_own" on public.products;

create policy "products_select_own"
  on public.products for select
  to authenticated
  using (auth.uid() = user_id);

create policy "products_insert_own"
  on public.products for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "products_update_own"
  on public.products for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "products_delete_own"
  on public.products for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create index if not exists products_user_created_idx on public.products(user_id, created_at desc);

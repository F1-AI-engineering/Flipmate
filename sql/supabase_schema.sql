-- FlipMate V5 full schema for a new Supabase project.
-- If you already ran V4 schema, run v5_migration_profiles_and_modes.sql instead.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product_name text not null,
  category text,
  source_platform text default 'vinted_ebay',
  analysis_mode text default 'vinted_ebay' check (analysis_mode in ('vinted','ebay','vinted_ebay')),
  purchase_platform text,
  sale_platform text,
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

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  purpose text not null default 'vinted_ebay' check (purpose in ('vinted','ebay','vinted_ebay')),
  plan text not null default 'free' check (plan in ('free','premium','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "products_select_own" on public.products;
drop policy if exists "products_insert_own" on public.products;
drop policy if exists "products_update_own" on public.products;
drop policy if exists "products_delete_own" on public.products;

create policy "products_select_own" on public.products for select to authenticated using ((select auth.uid()) = user_id);
create policy "products_insert_own" on public.products for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "products_update_own" on public.products for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "products_delete_own" on public.products for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update on table public.profiles to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create index if not exists products_user_created_idx on public.products(user_id, created_at desc);
create index if not exists products_user_status_idx on public.products(user_id, status);
create index if not exists products_user_mode_idx on public.products(user_id, analysis_mode);
create index if not exists profiles_purpose_idx on public.profiles(purpose);

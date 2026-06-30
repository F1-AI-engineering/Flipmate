-- FlipMate V5 migration
-- Run this AFTER the original products table already exists.
-- Adds user profiles, app purpose/mode, and improves grants/RLS.

create extension if not exists pgcrypto;

-- 1) Profiles table: one row per authenticated user
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  purpose text not null default 'vinted_ebay' check (purpose in ('vinted','ebay','vinted_ebay')),
  plan text not null default 'free' check (plan in ('free','premium','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 2) Backward-compatible product columns
alter table public.products add column if not exists analysis_mode text default 'vinted_ebay' check (analysis_mode in ('vinted','ebay','vinted_ebay'));
alter table public.products add column if not exists purchase_platform text;
alter table public.products add column if not exists sale_platform text;

-- Keep existing RLS but make sure policies are optimized
alter table public.products enable row level security;

drop policy if exists "products_select_own" on public.products;
drop policy if exists "products_insert_own" on public.products;
drop policy if exists "products_update_own" on public.products;
drop policy if exists "products_delete_own" on public.products;

create policy "products_select_own"
  on public.products for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "products_insert_own"
  on public.products for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "products_update_own"
  on public.products for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "products_delete_own"
  on public.products for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 3) Grants: needed because new tables are not automatically exposed
-- RLS still protects rows, GRANT only allows authenticated users to use the table.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update on table public.profiles to authenticated;

-- 4) Updated_at trigger for profiles and products
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
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 5) Indexes
create index if not exists products_user_created_idx on public.products(user_id, created_at desc);
create index if not exists products_user_status_idx on public.products(user_id, status);
create index if not exists products_user_mode_idx on public.products(user_id, analysis_mode);
create index if not exists profiles_purpose_idx on public.profiles(purpose);

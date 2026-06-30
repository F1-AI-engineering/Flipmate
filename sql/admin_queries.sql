-- FlipMate admin queries
-- Run from Supabase SQL Editor as project admin.

-- Users by purpose/profile
select
  p.purpose,
  p.plan,
  count(*) as users
from public.profiles p
group by p.purpose, p.plan
order by users desc;

-- Latest registered profiles
select
  p.created_at,
  p.username,
  p.purpose,
  p.plan,
  u.email
from public.profiles p
left join auth.users u on u.id = p.user_id
order by p.created_at desc
limit 50;

-- Products by mode and status
select
  coalesce(analysis_mode, source_platform, 'unknown') as mode,
  status,
  count(*) as products,
  round(sum(coalesce(profit,0))::numeric, 2) as estimated_profit
from public.products
group by coalesce(analysis_mode, source_platform, 'unknown'), status
order by products desc;

-- Top users by saved products
select
  u.email,
  p.username,
  p.purpose,
  count(pr.id) as products,
  round(sum(coalesce(pr.profit,0))::numeric, 2) as estimated_profit,
  round(avg(nullif(pr.roi,0))::numeric, 2) as avg_roi
from auth.users u
left join public.profiles p on p.user_id = u.id
left join public.products pr on pr.user_id = u.id
group by u.email, p.username, p.purpose
order by products desc, estimated_profit desc
limit 50;

-- Latest saved products
select
  pr.created_at,
  u.email,
  pr.product_name,
  pr.category,
  pr.analysis_mode,
  pr.status,
  pr.all_in_cost,
  pr.listing_price,
  pr.profit,
  pr.roi,
  pr.decision
from public.products pr
left join auth.users u on u.id = pr.user_id
order by pr.created_at desc
limit 100;

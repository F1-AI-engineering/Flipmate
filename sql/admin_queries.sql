-- FlipMate admin queries
-- Run only inside Supabase SQL Editor as project owner.

-- 1) Count registered auth users
select count(*) as registered_users
from auth.users;

-- 2) Count saved products
select count(*) as saved_products
from public.products;

-- 3) Product count by user
select
  u.email,
  count(p.id) as products,
  sum(p.profit) as estimated_profit,
  avg(p.roi) as avg_roi,
  max(p.created_at) as last_save
from auth.users u
left join public.products p on p.user_id = u.id
group by u.email
order by last_save desc nulls last;

-- 4) Latest saved products
select
  p.created_at,
  u.email,
  p.product_name,
  p.category,
  p.all_in_cost,
  p.listing_price,
  p.profit,
  p.roi,
  p.decision
from public.products p
join auth.users u on u.id = p.user_id
order by p.created_at desc
limit 100;

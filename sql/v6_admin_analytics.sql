-- FlipMate V6 — query admin opzionali per Supabase SQL Editor
-- Non sono richieste per far funzionare l'app.

-- Utenti e numero prodotti salvati
select
  p.user_id,
  pr.username,
  pr.purpose,
  count(p.id) as products_count,
  sum(coalesce(p.profit,0)) as total_profit,
  avg(coalesce(p.roi,0)) as avg_roi
from public.products p
left join public.profiles pr on pr.user_id = p.user_id
group by p.user_id, pr.username, pr.purpose
order by products_count desc;

-- Margine per categoria
select
  category,
  count(*) as products_count,
  sum(coalesce(profit,0)) as total_profit,
  avg(coalesce(roi,0)) as avg_roi
from public.products
group by category
order by total_profit desc;

-- Stato stock globale
select
  status,
  count(*) as products_count,
  sum(coalesce(listing_price, sold_avg_price, sale_price, 0)) as gross_value,
  sum(coalesce(profit,0)) as estimated_profit
from public.products
group by status
order by products_count desc;

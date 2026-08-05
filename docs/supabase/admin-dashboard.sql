-- Ringkasan dashboard dihitung di PostgreSQL agar tetap akurat dan cepat saat
-- produk/pesanan sudah melampaui batas baris default PostgREST.
create or replace function public.get_admin_dashboard_summary(
  low_stock_threshold integer default 3
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with product_totals as (
    select
      count(*)::integer as total_products,
      coalesce(sum(stock), 0)::bigint as total_stock,
      coalesce(sum(stock::bigint * price::bigint), 0)::bigint as inventory_value,
      count(*) filter (
        where stock <= greatest(low_stock_threshold, 0)
      )::integer as low_stock_count
    from public.products
  ),
  low_stock_rows as (
    select stock, name, jsonb_build_object(
      'id', id,
      'name', name,
      'sku', sku,
      'stock', stock
    ) as item
    from public.products
    where stock <= greatest(low_stock_threshold, 0)
    order by stock asc, name asc
    limit 5
  ),
  completed_sales as (
    select
      coalesce(o.product_id::text, 'deleted:' || lower(o.product_name)) as sale_key,
      coalesce(max(p.name), max(o.product_name)) as product_name,
      sum(o.quantity)::bigint as units_sold
    from public.orders o
    left join public.products p on p.id = o.product_id
    where o.status = 'completed'
    group by coalesce(o.product_id::text, 'deleted:' || lower(o.product_name))
  ),
  best_seller_rows as (
    select units_sold, product_name, jsonb_build_object(
      'key', sale_key,
      'name', product_name,
      'units_sold', units_sold
    ) as item
    from completed_sales
    order by units_sold desc, product_name asc
    limit 5
  )
  select jsonb_build_object(
    'total_products', totals.total_products,
    'total_stock', totals.total_stock,
    'inventory_value', totals.inventory_value,
    'low_stock_count', totals.low_stock_count,
    'low_stock_products', coalesce(
      (select jsonb_agg(item order by stock asc, name asc) from low_stock_rows),
      '[]'::jsonb
    ),
    'best_sellers', coalesce(
      (select jsonb_agg(item order by units_sold desc, product_name asc) from best_seller_rows),
      '[]'::jsonb
    )
  )
  from product_totals totals;
$$;

revoke all on function public.get_admin_dashboard_summary(integer) from public;
revoke all on function public.get_admin_dashboard_summary(integer) from anon;
grant execute on function public.get_admin_dashboard_summary(integer) to authenticated;

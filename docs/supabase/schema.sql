-- Skema lengkap PickleStock.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon;
revoke insert, update, delete on table public.admin_users from authenticated;
grant select on table public.admin_users to authenticated;

drop policy if exists "Admins can read own membership" on public.admin_users;
create policy "Admins can read own membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Skema tabel produk PickleStock.
-- status TIDAK disimpan — diturunkan di aplikasi dari stock (stock > 0 = ready).
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  sku         text not null,
  name        text not null,
  brand       text not null,
  material    text not null,
  price       integer not null,
  stock       integer not null default 0,
  description text not null default '',
  images      jsonb not null default '[]'::jsonb,
  specs       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table products enable row level security;

-- Baca publik: anon boleh SELECT. Tulis tak diberi policy → ditolak untuk anon.
-- Sub-proyek #3 memakai sesi admin terautentikasi untuk menulis.
drop policy if exists "Public read access" on products;
create policy "Public read access"
  on products for select
  using (true);

-- Hak tulis hanya untuk akun admin yang sudah masuk lewat Supabase Auth.
-- PickleStock tidak menyediakan self-signup; seluruh akun Auth dibuat manual.
grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;
revoke insert, update, delete on table public.products from anon;

create unique index if not exists products_sku_unique
  on public.products (sku);

drop policy if exists "Authenticated admins can insert products" on products;
drop policy if exists "Admins can insert products" on products;
create policy "Admins can insert products"
  on products for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Authenticated admins can update products" on products;
drop policy if exists "Admins can update products" on products;
create policy "Admins can update products"
  on products for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Authenticated admins can delete products" on products;
drop policy if exists "Admins can delete products" on products;
create policy "Admins can delete products"
  on products for delete to authenticated
  using ((select private.is_admin()));

-- Bucket publik: katalog dapat memuat gambar tanpa sesi, tetapi hanya admin
-- terautentikasi yang boleh mengunggah, mengganti, atau menghapus objek.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated admins can view product images" on storage.objects;

drop policy if exists "Authenticated admins can upload product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select private.is_admin()));

drop policy if exists "Authenticated admins can update product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()))
  with check (bucket_id = 'product-images' and (select private.is_admin()));

drop policy if exists "Authenticated admins can delete product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));

-- Pengaturan situs: katalog dapat membaca nomor WhatsApp, admin terautentikasi
-- dapat membuat atau memperbarui satu-satunya key yang didukung aplikasi.
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

insert into public.site_settings (key, value)
values ('whatsapp_number', '+6281234567890')
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

grant select on table public.site_settings to anon, authenticated;
grant insert, update on table public.site_settings to authenticated;
revoke insert, update, delete on table public.site_settings from anon;
revoke delete on table public.site_settings from authenticated;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Authenticated admins can insert WhatsApp setting" on public.site_settings;
drop policy if exists "Admins can insert WhatsApp setting" on public.site_settings;
create policy "Admins can insert WhatsApp setting"
  on public.site_settings for insert to authenticated
  with check (key = 'whatsapp_number' and (select private.is_admin()));

drop policy if exists "Authenticated admins can update WhatsApp setting" on public.site_settings;
drop policy if exists "Admins can update WhatsApp setting" on public.site_settings;
create policy "Admins can update WhatsApp setting"
  on public.site_settings for update to authenticated
  using (key = 'whatsapp_number' and (select private.is_admin()))
  with check (key = 'whatsapp_number' and (select private.is_admin()));

create index if not exists site_settings_updated_by_idx
  on public.site_settings (updated_by);

-- Pesanan dicatat admin setelah pelanggan berkomunikasi melalui WhatsApp.
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text unique not null,
  customer_name  text not null,
  customer_phone text not null,
  product_id     uuid references public.products (id) on delete set null,
  product_name   text not null,
  quantity       integer not null check (quantity > 0 and quantity <= 100000),
  unit_price     integer not null check (unit_price >= 0),
  total_amount   bigint generated always as (quantity::bigint * unit_price::bigint) stored,
  status         text not null default 'new' check (
    status in ('new', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled')
  ),
  notes          text not null default '',
  order_date     date not null default current_date,
  created_by     uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);
create index if not exists orders_product_id_idx on public.orders (product_id);
create index if not exists orders_created_by_idx on public.orders (created_by);

alter table public.orders enable row level security;
revoke all on table public.orders from anon;
grant select, insert, update, delete on table public.orders to authenticated;

drop policy if exists "Admins can read orders" on public.orders;
drop policy if exists "Admins can insert orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can read orders" on public.orders for select to authenticated
  using ((select private.is_admin()));
create policy "Admins can insert orders" on public.orders for insert to authenticated
  with check ((select private.is_admin()));
create policy "Admins can update orders" on public.orders for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete orders" on public.orders for delete to authenticated
  using ((select private.is_admin()));

-- Ringkasan inventaris dan penjualan untuk dashboard admin. Agregasi dilakukan
-- di database agar tidak dibatasi paginasi PostgREST.
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

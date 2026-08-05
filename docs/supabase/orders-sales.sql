-- Manajemen pesanan yang dicatat admin setelah percakapan WhatsApp.
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
create index if not exists site_settings_updated_by_idx
  on public.site_settings (updated_by);

alter table public.orders enable row level security;
revoke all on table public.orders from anon;
grant select, insert, update, delete on table public.orders to authenticated;

drop policy if exists "Admins can read orders" on public.orders;
drop policy if exists "Admins can insert orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

create policy "Admins can read orders"
  on public.orders for select to authenticated
  using ((select public.is_admin()));
create policy "Admins can insert orders"
  on public.orders for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins can update orders"
  on public.orders for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Admins can delete orders"
  on public.orders for delete to authenticated
  using ((select public.is_admin()));

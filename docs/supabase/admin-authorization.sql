-- Migration otorisasi admin PickleStock.
-- Jalankan satu kali setelah schema/crud-storage/whatsapp-settings.

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

-- Pertahankan akses akun Auth yang sudah ada saat migration dijalankan.
-- Akun Auth yang dibuat setelah migration tidak otomatis menjadi admin.
insert into public.admin_users (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Authenticated admins can insert products" on public.products;
drop policy if exists "Authenticated admins can update products" on public.products;
drop policy if exists "Authenticated admins can delete products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins can update products"
  on public.products for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Authenticated admins can upload product images" on storage.objects;
drop policy if exists "Authenticated admins can update product images" on storage.objects;
drop policy if exists "Authenticated admins can delete product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins can update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Authenticated admins can insert WhatsApp setting" on public.site_settings;
drop policy if exists "Authenticated admins can update WhatsApp setting" on public.site_settings;
drop policy if exists "Admins can insert WhatsApp setting" on public.site_settings;
drop policy if exists "Admins can update WhatsApp setting" on public.site_settings;

create policy "Admins can insert WhatsApp setting"
  on public.site_settings for insert to authenticated
  with check (key = 'whatsapp_number' and (select public.is_admin()));
create policy "Admins can update WhatsApp setting"
  on public.site_settings for update to authenticated
  using (key = 'whatsapp_number' and (select public.is_admin()))
  with check (key = 'whatsapp_number' and (select public.is_admin()));

-- Untuk menambah admin setelah migration, ambil UUID dari Authentication > Users:
-- insert into public.admin_users (user_id) values ('UUID_USER');

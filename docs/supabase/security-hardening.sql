-- Menyelesaikan warning Security Advisor tanpa mengubah akses aplikasi.
-- Jalankan setelah admin-authorization.sql dan orders-sales.sql pada database lama.
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
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can insert products" on public.products for insert to authenticated
  with check ((select private.is_admin()));
create policy "Admins can update products" on public.products for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete products" on public.products for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists "Authenticated admins can view product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()))
  with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));

drop policy if exists "Admins can insert WhatsApp setting" on public.site_settings;
drop policy if exists "Admins can update WhatsApp setting" on public.site_settings;
create policy "Admins can insert WhatsApp setting" on public.site_settings for insert to authenticated
  with check (key = 'whatsapp_number' and (select private.is_admin()));
create policy "Admins can update WhatsApp setting" on public.site_settings for update to authenticated
  using (key = 'whatsapp_number' and (select private.is_admin()))
  with check (key = 'whatsapp_number' and (select private.is_admin()));

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

drop function if exists public.is_admin();

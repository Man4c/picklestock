-- Jalankan sekali di Supabase SQL Editor sebelum memakai CRUD produk.
-- Setelah file ini dan whatsapp-settings.sql, jalankan admin-authorization.sql
-- untuk membatasi mutation ke anggota public.admin_users.

grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;
revoke insert, update, delete on table public.products from anon;

create unique index if not exists products_sku_unique
  on public.products (sku);

drop policy if exists "Authenticated admins can insert products" on products;
create policy "Authenticated admins can insert products"
  on products for insert to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update products" on products;
create policy "Authenticated admins can update products"
  on products for update to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can delete products" on products;
create policy "Authenticated admins can delete products"
  on products for delete to authenticated
  using (true);

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
create policy "Authenticated admins can view product images"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated admins can upload product images" on storage.objects;
create policy "Authenticated admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Authenticated admins can update product images" on storage.objects;
create policy "Authenticated admins can update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "Authenticated admins can delete product images" on storage.objects;
create policy "Authenticated admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images');

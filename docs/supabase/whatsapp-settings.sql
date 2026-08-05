-- Pengaturan publik yang dapat dibaca katalog dan hanya ditulis admin.
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
create policy "Authenticated admins can insert WhatsApp setting"
  on public.site_settings for insert to authenticated
  with check (key = 'whatsapp_number');

drop policy if exists "Authenticated admins can update WhatsApp setting" on public.site_settings;
create policy "Authenticated admins can update WhatsApp setting"
  on public.site_settings for update to authenticated
  using (key = 'whatsapp_number')
  with check (key = 'whatsapp_number');

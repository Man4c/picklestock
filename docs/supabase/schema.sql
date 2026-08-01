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

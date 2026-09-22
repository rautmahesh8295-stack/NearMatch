-- NearMatch production schema. Run this once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  area text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  brand text not null,
  name text not null,
  category text not null,
  image text,
  online_price integer not null check (online_price > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  price integer not null check (price > 0),
  stock text not null default 'In stock' check (stock in ('In stock','Only 2 left','Out of stock')),
  updated_at timestamptz not null default now(),
  unique(store_id, product_id)
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  pin text unique not null,
  store_id uuid references public.stores(id) not null,
  product_id uuid references public.products(id) not null,
  locked_price integer not null,
  status text not null default 'Active' check (status in ('Active','Redeemed','Expired')),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.listings enable row level security;
alter table public.claims enable row level security;

create policy "Public can read products" on public.products for select using (true);
create policy "Public can read active listings" on public.listings for select using (true);
create policy "Owners manage their stores" on public.stores for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owners manage their listings" on public.listings for all using (exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())) with check (exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid()));
create policy "Customers create claims" on public.claims for insert with check (true);
create policy "Customers read their claims by pin" on public.claims for select using (true);
create policy "Store owners redeem claims" on public.claims for update using (exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid()));

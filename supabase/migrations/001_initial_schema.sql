-- Extensions
create extension if not exists "uuid-ossp";

-- Catégories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Produits
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  price int not null,           -- en FCFA, entier
  compare_price int,            -- prix barré promo
  category_id uuid references categories(id),
  images text[] default '{}',  -- tableau d'URLs Supabase Storage
  sizes text[] default '{}',   -- ex: ['XS','S','M','L','XL']
  stock int default 0,
  is_active boolean default true,
  is_new boolean default false,
  created_at timestamptz default now()
);

-- Commandes
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  items jsonb not null,          -- snapshot panier
  total int not null,            -- en FCFA
  payment_method text not null,  -- 'mobile_money' | 'whatsapp'
  payment_status text default 'pending',  -- 'pending'|'paid'|'failed'
  fedapay_transaction_id text,
  status text default 'nouvelle',  -- 'nouvelle'|'confirmée'|'livrée'|'annulée'
  created_at timestamptz default now()
);

-- RLS Policies
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- Lecture publique catalogue
create policy "Public read categories" on categories for select using (true);
create policy "Public read active products" on products
  for select using (is_active = true);

-- Admin full access (à sécuriser avec auth Supabase)
create policy "Admin all categories" on categories
  for all using (auth.role() = 'authenticated');
create policy "Admin all products" on products
  for all using (auth.role() = 'authenticated');
create policy "Admin all orders" on orders
  for all using (auth.role() = 'authenticated');

-- Insertion commandes publique (checkout sans compte)
create policy "Public insert orders" on orders for insert with check (true);

-- Storage bucket produits
insert into storage.buckets (id, name, public) values ('products', 'products', true);

-- =====================
-- DONNÉES DE TEST (seed)
-- =====================

-- Catégories
insert into categories (name, slug, sort_order) values
  ('Vêtements', 'vetements', 1),
  ('Bijoux & Montres', 'bijoux-montres', 2),
  ('Beauté', 'beaute', 3),
  ('Chaussures', 'chaussures', 4);

-- Produits de test
insert into products (name, slug, description, price, compare_price, sizes, stock, is_new, category_id)
select
  'Robe Bazin "Awa"',
  'robe-bazin-awa',
  'Robe en bazin riche, coupe ajustée, motifs traditionnels ivoiriens.',
  45000, 60000,
  ARRAY['XS','S','M','L','XL'], 12, true,
  id from categories where slug = 'vetements';

insert into products (name, slug, description, price, sizes, stock, is_new, category_id)
select
  'Boucles d''Oreilles Noé',
  'boucles-oreilles-noe',
  'Boucles d''oreilles dorées, inspirées de l''artisanat africain.',
  25000, ARRAY['Unique'], 8, false,
  id from categories where slug = 'bijoux-montres';

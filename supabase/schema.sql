-- WP Ornaments schema. Run in Supabase SQL editor, then run seed.sql.
-- Make yourself admin afterwards:  update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text, phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz default now()
);

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from profiles where id = auth.uid() and role = 'admin') $$;

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as
$$ begin insert into profiles(id, name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))); return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create table if not exists rates (
  purity text primary key check (purity in ('22K','18K','925')),
  per_gram numeric not null,
  updated_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text default '',
  metal text not null check (metal in ('gold','silver')),
  purity text not null references rates(purity),
  category text not null,
  weight_g numeric not null check (weight_g > 0),
  making_pct numeric not null default 12,
  images text[] not null default '{}',
  model_type text not null default 'ring',
  gem text,
  glb_url text,
  stock int not null default 1,
  featured boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  items jsonb not null,
  address jsonb not null,
  total numeric not null,
  status text not null default 'pending',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz default now()
);

create table if not exists custom_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  metal text not null,
  category text not null,
  config jsonb not null default '{}',
  refs text[] not null default '{}',
  budget numeric,
  notes text,
  phone text,
  status text not null default 'submitted',
  quote numeric,
  admin_note text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table rates enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table custom_requests enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "update own profile" on profiles for update using (id = auth.uid()) with check (role = (select role from profiles where id = auth.uid()));
create policy "public rates" on rates for select using (true);
create policy "admin rates" on rates for all using (is_admin()) with check (is_admin());
create policy "public products" on products for select using (true);
create policy "admin products" on products for all using (is_admin()) with check (is_admin());
-- orders are inserted/marked paid only by the server (service role); customers read their own
create policy "read own orders" on orders for select using (user_id = auth.uid() or is_admin());
create policy "admin orders" on orders for update using (is_admin());
create policy "read own custom" on custom_requests for select using (user_id = auth.uid() or is_admin());
create policy "create own custom" on custom_requests for insert with check (user_id = auth.uid() and status = 'submitted' and quote is null);
create policy "admin custom" on custom_requests for update using (is_admin());

-- storage
insert into storage.buckets (id, name, public) values ('products','products', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('custom-refs','custom-refs', false) on conflict do nothing;
create policy "public product files" on storage.objects for select using (bucket_id = 'products');
create policy "admin product files" on storage.objects for all using (bucket_id = 'products' and is_admin()) with check (bucket_id = 'products' and is_admin());
create policy "upload own refs" on storage.objects for insert with check (bucket_id = 'custom-refs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read refs" on storage.objects for select using (bucket_id = 'custom-refs' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));

-- customers may only accept/decline a quote, nothing else on the row
create or replace function respond_quote(req_id uuid, accept boolean) returns void language sql security definer set search_path = public as
$$ update custom_requests set status = case when accept then 'accepted' else 'declined' end
   where id = req_id and user_id = auth.uid() and status = 'quoted' $$;

-- store settings (admin toggles online payments; off = booking/enquiry mode)
create table if not exists settings (key text primary key, value jsonb not null);
alter table settings enable row level security;
create policy "public settings" on settings for select using (true);
create policy "admin settings" on settings for all using (is_admin()) with check (is_admin());
insert into settings values ('payments_enabled', 'false') on conflict do nothing;

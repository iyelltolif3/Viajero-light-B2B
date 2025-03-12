-- Create content_sections table
create table if not exists public.content_sections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  title text not null,
  subtitle text,
  badge_text text,
  button_text text,
  active boolean default true not null,
  type text not null
);

-- Create discount_items table
create table if not exists public.discount_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  section_id uuid references public.content_sections(id) on delete cascade not null,
  title text not null,
  description text not null,
  discount text not null,
  expiry_date text not null,
  image_url text not null,
  active boolean default true not null,
  "order" integer not null
);

-- Create RLS policies
alter table public.content_sections enable row level security;
alter table public.discount_items enable row level security;

-- Allow read access to all authenticated users
create policy "Allow read access to all authenticated users"
  on public.content_sections
  for select
  to authenticated
  using (true);

create policy "Allow read access to all authenticated users"
  on public.discount_items
  for select
  to authenticated
  using (true);

-- Allow write access only to admin users
create policy "Allow write access to admin users"
  on public.content_sections
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Allow write access to admin users"
  on public.discount_items
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Insert initial discount section
insert into public.content_sections (
  name,
  title,
  subtitle,
  badge_text,
  button_text,
  type
) values (
  'discount_section',
  'Descuentos exclusivos',
  'Aprovecha nuestras promociones especiales y ahorre en su próxima aventura.',
  'Ofertas por tiempo limitado',
  'Ver todas las ofertas',
  'discount'
);

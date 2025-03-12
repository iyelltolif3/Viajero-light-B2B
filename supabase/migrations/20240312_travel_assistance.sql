-- Create customers table
create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade,
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  tax_id text,
  country text not null,
  city text,
  address text
);

-- Create travel_assistance table
create table if not exists public.travel_assistance (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  status text not null check (status in ('active', 'expired', 'cancelled', 'pending')),
  voucher_code text unique not null,
  qr_code_url text not null,
  start_date date not null,
  end_date date not null,
  destination_country text not null,
  origin_country text not null,
  passenger_name text not null,
  passenger_email text,
  passenger_phone text,
  passenger_document_type text not null,
  passenger_document_number text not null,
  passenger_birthdate date not null,
  assistance_plan text not null,
  price numeric(10,2) not null,
  currency text not null default 'USD',
  payment_status text not null check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  payment_date timestamp with time zone,
  notes text
);

-- Create assistance_events table (for tracking important events)
create table if not exists public.assistance_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  assistance_id uuid references public.travel_assistance(id) on delete cascade not null,
  event_type text not null check (event_type in (
    'voucher_generated',
    'voucher_downloaded',
    'voucher_viewed',
    'assistance_activated',
    'assistance_expired',
    'assistance_cancelled',
    'payment_received',
    'payment_failed',
    'refund_processed',
    'customer_support_contacted'
  )),
  event_data jsonb,
  ip_address text,
  user_agent text
);

-- Create assistance_analytics table (for aggregated data)
create table if not exists public.assistance_analytics (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  customer_id uuid references public.customers(id) on delete cascade,
  total_active_assistances integer default 0,
  total_expired_assistances integer default 0,
  total_cancelled_assistances integer default 0,
  total_sales numeric(10,2) default 0,
  total_refunds numeric(10,2) default 0,
  most_common_destination text,
  avg_assistance_duration integer,
  unique (date, customer_id)
);

-- Create assistance_documents table (for storing vouchers and other documents)
create table if not exists public.assistance_documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  assistance_id uuid references public.travel_assistance(id) on delete cascade not null,
  document_type text not null check (document_type in ('voucher', 'receipt', 'terms', 'claim')),
  file_name text not null,
  file_url text not null,
  file_size integer not null,
  mime_type text not null,
  is_active boolean default true
);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.travel_assistance enable row level security;
alter table public.assistance_events enable row level security;
alter table public.assistance_analytics enable row level security;
alter table public.assistance_documents enable row level security;

-- Policies for customers
create policy "Users can view their own customer data"
  on public.customers
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admin users can view all customer data"
  on public.customers
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Policies for travel_assistance
create policy "Users can view their own assistance data"
  on public.travel_assistance
  for select
  to authenticated
  using (
    customer_id in (
      select id from public.customers
      where user_id = auth.uid()
    )
  );

create policy "Admin users can manage all assistance data"
  on public.travel_assistance
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Policies for assistance_events
create policy "Users can view their own assistance events"
  on public.assistance_events
  for select
  to authenticated
  using (
    assistance_id in (
      select id from public.travel_assistance
      where customer_id in (
        select id from public.customers
        where user_id = auth.uid()
      )
    )
  );

create policy "Admin users can manage all assistance events"
  on public.assistance_events
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Policies for assistance_analytics
create policy "Users can view their own analytics"
  on public.assistance_analytics
  for select
  to authenticated
  using (
    customer_id in (
      select id from public.customers
      where user_id = auth.uid()
    )
  );

create policy "Admin users can manage all analytics"
  on public.assistance_analytics
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Policies for assistance_documents
create policy "Users can view their own documents"
  on public.assistance_documents
  for select
  to authenticated
  using (
    assistance_id in (
      select id from public.travel_assistance
      where customer_id in (
        select id from public.customers
        where user_id = auth.uid()
      )
    )
  );

create policy "Admin users can manage all documents"
  on public.assistance_documents
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Create function to update analytics
create or replace function public.update_assistance_analytics()
returns trigger as $$
begin
  -- Update or insert analytics for the customer
  insert into public.assistance_analytics (
    date,
    customer_id,
    total_active_assistances,
    total_expired_assistances,
    total_cancelled_assistances,
    total_sales,
    total_refunds,
    most_common_destination,
    avg_assistance_duration
  )
  select
    current_date,
    customer_id,
    count(*) filter (where status = 'active') as total_active_assistances,
    count(*) filter (where status = 'expired') as total_expired_assistances,
    count(*) filter (where status = 'cancelled') as total_cancelled_assistances,
    sum(price) filter (where payment_status = 'completed') as total_sales,
    sum(price) filter (where payment_status = 'refunded') as total_refunds,
    (
      select destination_country
      from (
        select destination_country, count(*) as cnt
        from public.travel_assistance
        where customer_id = NEW.customer_id
        group by destination_country
        order by cnt desc
        limit 1
      ) as subq
    ) as most_common_destination,
    avg(end_date - start_date)::integer as avg_assistance_duration
  from public.travel_assistance
  where customer_id = NEW.customer_id
  group by customer_id
  on conflict (date, customer_id)
  do update set
    total_active_assistances = EXCLUDED.total_active_assistances,
    total_expired_assistances = EXCLUDED.total_expired_assistances,
    total_cancelled_assistances = EXCLUDED.total_cancelled_assistances,
    total_sales = EXCLUDED.total_sales,
    total_refunds = EXCLUDED.total_refunds,
    most_common_destination = EXCLUDED.most_common_destination,
    avg_assistance_duration = EXCLUDED.avg_assistance_duration;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for analytics updates
create trigger update_analytics_on_assistance_change
  after insert or update
  on public.travel_assistance
  for each row
  execute function public.update_assistance_analytics();

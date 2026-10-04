-- ========================================================
-- QueueMate - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all tables,
-- RLS policies, and initial demo data.
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Businesses Table
create table if not exists public.businesses (
  id text primary key,
  name text not null,
  industry text not null,
  description text default '',
  full_description text default '',
  email text,
  working_hours text not null default '08:00 – 17:00',
  queue_window text not null default '08:00 – 16:30',
  opens_at text default '08:00 AM',
  closes_at text default '05:00 PM',
  queue_opens text default '08:00 AM',
  queue_closes text default '04:30 PM',
  daily_capacity text default '100',
  status text not null default 'Open' check (status in ('Open', 'Closed')),
  icon text default 'bank',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Staff Members Table
create table if not exists public.staff (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  business_name text,
  name text not null,
  email text not null,
  role text default 'Counter Staff',
  counter_name text default 'Counter 1',
  staff_pin text default '1234',
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Queue Tickets (Customers) Table
create table if not exists public.tickets (
  id text primary key,
  number text not null,
  business_id text not null references public.businesses(id) on delete cascade,
  business_name text,
  customer_name text default 'Guest Customer',
  phone_number text,
  category_id text not null default 'general',
  category_name text not null default 'General Inquiries',
  status text not null default 'waiting' check (status in ('waiting', 'called', 'serving', 'completed', 'noshow')),
  counter_id integer,
  counter_name text,
  qr_code_data text,
  is_scanned boolean default false,
  scanned_at bigint,
  created_at bigint not null,
  called_at bigint,
  completed_at bigint
);

-- 4. Customer Accounts Table
create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text unique not null,
  pin text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.businesses enable row level security;
alter table public.staff enable row level security;
alter table public.tickets enable row level security;
alter table public.customers enable row level security;

-- Public / Anonymous access policies (for client-side demo and kiosk operations)
create policy "Allow public read access to businesses"
  on public.businesses for select using (true);

create policy "Allow public insert/update/delete to businesses"
  on public.businesses for all using (true) with check (true);

create policy "Allow public read access to staff"
  on public.staff for select using (true);

create policy "Allow public insert/update/delete to staff"
  on public.staff for all using (true) with check (true);

create policy "Allow public read access to tickets"
  on public.tickets for select using (true);

create policy "Allow public insert/update/delete to tickets"
  on public.tickets for all using (true) with check (true);

create policy "Allow public read access to customers"
  on public.customers for select using (true);

create policy "Allow public insert/update to customers"
  on public.customers for all using (true) with check (true);

-- Insert Default Demo Businesses
insert into public.businesses (id, name, industry, description, full_description, email, working_hours, queue_window, opens_at, closes_at, queue_opens, queue_closes, daily_capacity, status, icon)
values
  ('city-bank', 'City Bank', 'Banking', 'Full-service banking for all your personal & corporate needs', 'Full-service banking for all your personal and business financial needs.', 'admin@citybank.com', '08:00 – 17:00', '08:00 – 16:30', '08:00 AM', '05:00 PM', '08:00 AM', '04:30 PM', '100', 'Open', 'bank'),
  ('health-plus', 'Health Plus Clinic', 'Healthcare', 'Primary care, specialist consultations & urgent care', 'Primary care, specialist consultations, and emergency health services.', 'admin@healthplus.com', '07:00 – 16:00', '07:30 – 15:30', '07:00 AM', '04:00 PM', '07:30 AM', '03:30 PM', '80', 'Open', 'clinic'),
  ('tech-mart', 'TechMart Support', 'Retail', 'Electronics, gadgets and warranty repair counter', 'Electronics, gadgets, and tech accessories customer support and sales.', 'support@techmart.com', '08:30 – 18:00', '09:00 – 17:30', '08:30 AM', '06:00 PM', '09:00 AM', '05:30 PM', '120', 'Open', 'techmart')
on conflict (id) do nothing;

-- Insert Default Staff Members
insert into public.staff (id, business_id, business_name, name, email, role, counter_name, staff_pin, active)
values
  ('staff-1', 'city-bank', 'City Bank', 'Elena Rostova', 'elena@citybank.com', 'Senior Teller', 'Counter 1', '1234', true),
  ('staff-2', 'city-bank', 'City Bank', 'Marcus Chen', 'marcus@citybank.com', 'Customer Representative', 'Counter 2', '2345', true),
  ('staff-3', 'health-plus', 'Health Plus Clinic', 'Dr. Sophia Patel', 'sophia@healthplus.com', 'Triage Nurse', 'Counter 1', '3456', true),
  ('staff-4', 'tech-mart', 'TechMart Support', 'David Kim', 'david@techmart.com', 'Tech Specialist', 'Counter 1', '4567', true)
on conflict (id) do nothing;

-- Insert Default Demo Customer Account
insert into public.customers (id, name, phone, pin)
values
  ('cust-1', 'Gerry', '+1 234 567 8900', '1234')
on conflict (phone) do nothing;


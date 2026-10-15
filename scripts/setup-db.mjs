// scripts/setup-db.mjs
// Runs the full QueueMate schema against your Supabase project.
// Usage: node scripts/setup-db.mjs

const PROJECT_URL = 'https://mtwunmiehjbsbthvbezw.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10d3VubWllaGpic2J0aHZiZXp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI2MTQzNSwiZXhwIjoyMTA0ODM3NDM1fQ.-KZXhh4gJTnDcoafbNyyJ9KWqV3vTMbxPkfAp4cowRo';

// All SQL statements split into individual executable chunks
const statements = [
  // ── Extensions ──────────────────────────────────────────────────────────────
  `create extension if not exists "uuid-ossp"`,

  // ── 1. Businesses ────────────────────────────────────────────────────────────
  `create table if not exists public.businesses (
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
    created_at timestamptz default timezone('utc', now()) not null
  )`,

  // ── 2. Staff Members ─────────────────────────────────────────────────────────
  `create table if not exists public.staff (
    id text primary key,
    business_id text not null references public.businesses(id) on delete cascade,
    business_name text,
    name text not null,
    email text not null,
    role text default 'Counter Staff',
    counter_name text default 'Counter 1',
    staff_pin text default '1234',
    active boolean default true,
    created_at timestamptz default timezone('utc', now()) not null
  )`,

  // ── 3. Tickets ───────────────────────────────────────────────────────────────
  `create table if not exists public.tickets (
    id text primary key,
    number text not null,
    business_id text not null references public.businesses(id) on delete cascade,
    business_name text,
    customer_name text default 'Guest Customer',
    phone_number text,
    category_id text not null default 'general',
    category_name text not null default 'General Inquiries',
    status text not null default 'waiting'
      check (status in ('waiting','called','serving','completed','noshow')),
    counter_id integer,
    counter_name text,
    is_scanned boolean default false,
    scanned_at bigint,
    created_at bigint not null,
    called_at bigint,
    completed_at bigint
  )`,

  // ── 4. Customer Accounts ─────────────────────────────────────────────────────
  `create table if not exists public.customers (
    id text primary key,
    name text not null,
    phone text unique not null,
    pin text not null,
    created_at timestamptz default timezone('utc', now()) not null
  )`,

  // ── Indexes ──────────────────────────────────────────────────────────────────
  `create index if not exists idx_staff_business_id on public.staff(business_id)`,
  `create index if not exists idx_tickets_business_id on public.tickets(business_id)`,
  `create index if not exists idx_tickets_status on public.tickets(status)`,
  `create index if not exists idx_tickets_created_at on public.tickets(created_at)`,

  // ── RLS Enable ───────────────────────────────────────────────────────────────
  `alter table public.businesses enable row level security`,
  `alter table public.staff enable row level security`,
  `alter table public.tickets enable row level security`,
  `alter table public.customers enable row level security`,

  // ── RLS Policies — drop first to avoid duplicates ────────────────────────────
  `drop policy if exists "public_businesses_select" on public.businesses`,
  `drop policy if exists "public_businesses_all" on public.businesses`,
  `drop policy if exists "public_staff_select" on public.staff`,
  `drop policy if exists "public_staff_all" on public.staff`,
  `drop policy if exists "public_tickets_select" on public.tickets`,
  `drop policy if exists "public_tickets_all" on public.tickets`,
  `drop policy if exists "public_customers_select" on public.customers`,
  `drop policy if exists "public_customers_all" on public.customers`,

  // ── RLS Policies — create ────────────────────────────────────────────────────
  `create policy "public_businesses_select" on public.businesses for select using (true)`,
  `create policy "public_businesses_all" on public.businesses for all using (true) with check (true)`,
  `create policy "public_staff_select" on public.staff for select using (true)`,
  `create policy "public_staff_all" on public.staff for all using (true) with check (true)`,
  `create policy "public_tickets_select" on public.tickets for select using (true)`,
  `create policy "public_tickets_all" on public.tickets for all using (true) with check (true)`,
  `create policy "public_customers_select" on public.customers for select using (true)`,
  `create policy "public_customers_all" on public.customers for all using (true) with check (true)`,

  // ── Seed: Businesses ─────────────────────────────────────────────────────────
  `insert into public.businesses
    (id,name,industry,description,full_description,email,working_hours,queue_window,
     opens_at,closes_at,queue_opens,queue_closes,daily_capacity,status,icon)
  values
    ('city-bank','City Bank','Banking',
     'Full-service banking for personal and corporate finance',
     'Full-service banking for all your personal and business financial needs.',
     'admin@citybank.com','08:00 – 17:00','08:00 – 16:30',
     '08:00 AM','05:00 PM','08:00 AM','04:30 PM','100','Open','bank'),
    ('health-plus','Health Plus Clinic','Healthcare',
     'Primary care, specialist consultations & urgent care',
     'Primary care, specialist consultations, and emergency health services.',
     'admin@healthplus.com','07:00 – 16:00','07:30 – 15:30',
     '07:00 AM','04:00 PM','07:30 AM','03:30 PM','80','Open','clinic'),
    ('tech-mart','TechMart','Retail',
     'Electronics, gadgets and warranty repair counter',
     'Electronics, gadgets, and tech accessories customer support and sales.',
     'support@techmart.com','08:30 – 18:00','09:00 – 17:30',
     '08:30 AM','06:00 PM','09:00 AM','05:30 PM','120','Open','techmart')
  on conflict (id) do update set
    name = excluded.name,
    industry = excluded.industry,
    description = excluded.description,
    email = excluded.email,
    status = excluded.status`,

  // ── Seed: Staff ───────────────────────────────────────────────────────────────
  `insert into public.staff
    (id,business_id,business_name,name,email,role,counter_name,staff_pin,active)
  values
    ('staff-1','city-bank','City Bank','Elena Rostova','elena@citybank.com','Senior Teller','Counter 1','1234',true),
    ('staff-2','city-bank','City Bank','Marcus Chen','marcus@citybank.com','Customer Representative','Counter 2','2345',true),
    ('staff-3','health-plus','Health Plus Clinic','Dr. Sophia Patel','sophia@healthplus.com','Triage Nurse','Counter 1','3456',true),
    ('staff-4','tech-mart','TechMart','David Kim','david@techmart.com','Tech Specialist','Counter 1','4567',true)
  on conflict (id) do update set
    business_id = excluded.business_id,
    name = excluded.name,
    email = excluded.email,
    role = excluded.role,
    counter_name = excluded.counter_name,
    staff_pin = excluded.staff_pin`,

  // ── Seed: Demo Customer ───────────────────────────────────────────────────────
  `insert into public.customers (id,name,phone,pin)
  values ('cust-1','Gerry','+1 234 567 8900','1234')
  on conflict (phone) do nothing`,
];

// ── Execute via Supabase Management API ────────────────────────────────────────
const REF = 'mtwunmiehjbsbthvbezw';
const MGMT_URL = `https://api.supabase.com/v1/projects/${REF}/database/query`;

async function runSQL(sql) {
  // Try the Management API first (requires PAT — may not work with service_role)
  // Fall back to direct PostgREST RPC if available
  const res = await fetch(`${PROJECT_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  return res;
}

// ── Use the Supabase Management API directly ──────────────────────────────────
async function execSQL(sql, label) {
  try {
    const res = await fetch(MGMT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      // 42P07 = relation already exists — safe to ignore
      const msg = typeof data === 'object' ? (data.message || JSON.stringify(data)) : text;
      if (msg.includes('already exists') || msg.includes('42P07') || msg.includes('42P16')) {
        console.log(`  ⏭  ${label} — already exists, skipping`);
        return true;
      }
      console.error(`  ✗  ${label}\n     ${msg}`);
      return false;
    }

    console.log(`  ✓  ${label}`);
    return true;
  } catch (err) {
    console.error(`  ✗  ${label}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🚀 QueueMate — Supabase Database Setup');
  console.log(`   Project: ${PROJECT_URL}\n`);

  const labels = [
    'Enable uuid-ossp',
    'Create businesses table',
    'Create staff table',
    'Create tickets table',
    'Create customers table',
    'Index: staff.business_id',
    'Index: tickets.business_id',
    'Index: tickets.status',
    'Index: tickets.created_at',
    'RLS: businesses',
    'RLS: staff',
    'RLS: tickets',
    'RLS: customers',
    'Drop old policies: businesses select',
    'Drop old policies: businesses all',
    'Drop old policies: staff select',
    'Drop old policies: staff all',
    'Drop old policies: tickets select',
    'Drop old policies: tickets all',
    'Drop old policies: customers select',
    'Drop old policies: customers all',
    'Policy: businesses select',
    'Policy: businesses all',
    'Policy: staff select',
    'Policy: staff all',
    'Policy: tickets select',
    'Policy: tickets all',
    'Policy: customers select',
    'Policy: customers all',
    'Seed: businesses (3)',
    'Seed: staff (4)',
    'Seed: demo customer',
  ];

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < statements.length; i++) {
    const success = await execSQL(statements[i], labels[i] || `Statement ${i + 1}`);
    if (success) ok++; else fail++;
  }

  console.log(`\n${fail === 0 ? '✅' : '⚠️ '} Done — ${ok} succeeded, ${fail} failed`);

  if (fail > 0) {
    console.log('\n💡 If the Management API rejected the requests, you can run');
    console.log('   supabase/schema.sql manually in the Supabase SQL Editor:');
    console.log(`   https://supabase.com/dashboard/project/${REF}/sql/new\n`);
  } else {
    console.log('\n🎉 All tables and seed data are live in Supabase!\n');
  }
}

main();

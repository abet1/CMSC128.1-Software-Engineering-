-- PayMamaya / Loan Tracker - Supabase initial schema
-- Execute in Supabase SQL editor or via supabase migrations.

create extension if not exists "pgcrypto";

-- =====================================================
-- Enums
-- =====================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type public.transaction_type as enum (
      'LEND',
      'BORROW',
      'GROUP_EXPENSE',
      'STRAIGHT_EXPENSE',
      'INSTALLMENT_EXPENSE'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_frequency') then
    create type public.payment_frequency as enum ('WEEKLY', 'MONTHLY', 'ANNUALLY');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('PAID', 'PARTIALLY_PAID', 'UNPAID');
  end if;

  if not exists (select 1 from pg_type where typname = 'installment_status') then
    create type public.installment_status as enum (
      'PENDING',
      'UNPAID',
      'PAID',
      'SKIPPED',
      'DELINQUENT',
      'OVERDUE'
    );
  end if;
end $$;

-- =====================================================
-- Utility triggers
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_loan_entry_status()
returns trigger
language plpgsql
as $$
begin
  if new.amount_remaining <= 0 then
    new.status = 'PAID';
  elsif new.amount_remaining < new.amount_borrowed then
    new.status = 'PARTIALLY_PAID';
  else
    new.status = 'UNPAID';
  end if;
  return new;
end;
$$;

-- =====================================================
-- Core tables
-- =====================================================
create table if not exists public.persons (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  first_name text,
  middle_name text,
  last_name text,
  nickname text,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_persons_owner_user_id on public.persons(owner_user_id);
create index if not exists idx_persons_name on public.persons(name);

create table if not exists public.contact_groups (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contact_groups_owner_user_id on public.contact_groups(owner_user_id);

create table if not exists public.group_members (
  group_id uuid not null references public.contact_groups(id) on delete cascade,
  person_id uuid not null references public.persons(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, person_id)
);

create index if not exists idx_group_members_owner_user_id on public.group_members(owner_user_id);
create index if not exists idx_group_members_person_id on public.group_members(person_id);

create table if not exists public.loan_entries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  entry_name text not null,
  reference_id text unique,
  amount_borrowed numeric(12,2) not null check (amount_borrowed >= 0),
  amount_remaining numeric(12,2) not null check (amount_remaining >= 0),
  borrower_contact_id uuid references public.persons(id) on delete set null,
  borrower_group_id uuid references public.contact_groups(id) on delete set null,
  lender_contact_id uuid references public.persons(id) on delete set null,
  transaction_type public.transaction_type not null,
  status public.payment_status not null default 'UNPAID',
  date_borrowed date not null default current_date,
  payment_frequency public.payment_frequency,
  number_of_terms int check (number_of_terms is null or number_of_terms > 0),
  notes text,
  loan_channel text,
  proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_remaining <= amount_borrowed),
  check (
    (borrower_contact_id is not null and borrower_group_id is null)
    or
    (borrower_contact_id is null and borrower_group_id is not null)
  )
);

create index if not exists idx_loan_entries_owner_user_id on public.loan_entries(owner_user_id);
create index if not exists idx_loan_entries_borrower_contact_id on public.loan_entries(borrower_contact_id);
create index if not exists idx_loan_entries_borrower_group_id on public.loan_entries(borrower_group_id);
create index if not exists idx_loan_entries_status on public.loan_entries(status);
create index if not exists idx_loan_entries_date_borrowed on public.loan_entries(date_borrowed desc);

create table if not exists public.installment_plans (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null unique references public.loan_entries(id) on delete cascade,
  start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_installment_plans_owner_user_id on public.installment_plans(owner_user_id);

create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.installment_plans(id) on delete cascade,
  term_number int not null check (term_number > 0),
  due_date date not null,
  amount_due numeric(12,2) not null check (amount_due >= 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  status public.installment_status not null default 'PENDING',
  paid_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, term_number)
);

create index if not exists idx_installments_owner_user_id on public.installments(owner_user_id);
create index if not exists idx_installments_plan_id on public.installments(plan_id);
create index if not exists idx_installments_due_date on public.installments(due_date);
create index if not exists idx_installments_status on public.installments(status);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null references public.loan_entries(id) on delete cascade,
  payee_id uuid references public.persons(id) on delete set null,
  installment_id uuid references public.installments(id) on delete set null,
  payment_amount numeric(12,2) not null check (payment_amount > 0),
  payment_date date not null default current_date,
  proof_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_owner_user_id on public.payments(owner_user_id);
create index if not exists idx_payments_transaction_id on public.payments(transaction_id);
create index if not exists idx_payments_payment_date on public.payments(payment_date desc);

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null references public.loan_entries(id) on delete cascade,
  person_id uuid not null references public.persons(id) on delete cascade,
  allocated_amount numeric(12,2) not null check (allocated_amount >= 0),
  allocated_percent numeric(7,4) check (allocated_percent is null or allocated_percent between 0 and 100),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  is_fully_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (transaction_id, person_id)
);

create index if not exists idx_payment_allocations_owner_user_id on public.payment_allocations(owner_user_id);
create index if not exists idx_payment_allocations_transaction_id on public.payment_allocations(transaction_id);

-- =====================================================
-- Triggers
-- =====================================================
drop trigger if exists trg_persons_set_updated_at on public.persons;
create trigger trg_persons_set_updated_at
before update on public.persons
for each row execute function public.set_updated_at();

drop trigger if exists trg_contact_groups_set_updated_at on public.contact_groups;
create trigger trg_contact_groups_set_updated_at
before update on public.contact_groups
for each row execute function public.set_updated_at();

drop trigger if exists trg_loan_entries_set_updated_at on public.loan_entries;
create trigger trg_loan_entries_set_updated_at
before update on public.loan_entries
for each row execute function public.set_updated_at();

drop trigger if exists trg_installment_plans_set_updated_at on public.installment_plans;
create trigger trg_installment_plans_set_updated_at
before update on public.installment_plans
for each row execute function public.set_updated_at();

drop trigger if exists trg_installments_set_updated_at on public.installments;
create trigger trg_installments_set_updated_at
before update on public.installments
for each row execute function public.set_updated_at();

drop trigger if exists trg_payment_allocations_set_updated_at on public.payment_allocations;
create trigger trg_payment_allocations_set_updated_at
before update on public.payment_allocations
for each row execute function public.set_updated_at();

drop trigger if exists trg_loan_entries_sync_status on public.loan_entries;
create trigger trg_loan_entries_sync_status
before insert or update of amount_borrowed, amount_remaining on public.loan_entries
for each row execute function public.sync_loan_entry_status();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
alter table public.persons enable row level security;
alter table public.contact_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.loan_entries enable row level security;
alter table public.installment_plans enable row level security;
alter table public.installments enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;

drop policy if exists "own_persons_select" on public.persons;
create policy "own_persons_select" on public.persons for select using (owner_user_id = auth.uid());
drop policy if exists "own_persons_insert" on public.persons;
create policy "own_persons_insert" on public.persons for insert with check (owner_user_id = auth.uid());
drop policy if exists "own_persons_update" on public.persons;
create policy "own_persons_update" on public.persons for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "own_persons_delete" on public.persons;
create policy "own_persons_delete" on public.persons for delete using (owner_user_id = auth.uid());

drop policy if exists "own_groups_select" on public.contact_groups;
create policy "own_groups_select" on public.contact_groups for select using (owner_user_id = auth.uid());
drop policy if exists "own_groups_insert" on public.contact_groups;
create policy "own_groups_insert" on public.contact_groups for insert with check (owner_user_id = auth.uid());
drop policy if exists "own_groups_update" on public.contact_groups;
create policy "own_groups_update" on public.contact_groups for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "own_groups_delete" on public.contact_groups;
create policy "own_groups_delete" on public.contact_groups for delete using (owner_user_id = auth.uid());

drop policy if exists "own_group_members_select" on public.group_members;
create policy "own_group_members_select" on public.group_members for select using (owner_user_id = auth.uid());
drop policy if exists "own_group_members_insert" on public.group_members;
create policy "own_group_members_insert" on public.group_members for insert with check (owner_user_id = auth.uid());
drop policy if exists "own_group_members_update" on public.group_members;
create policy "own_group_members_update" on public.group_members for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "own_group_members_delete" on public.group_members;
create policy "own_group_members_delete" on public.group_members for delete using (owner_user_id = auth.uid());

drop policy if exists "own_loan_entries_select" on public.loan_entries;
create policy "own_loan_entries_select" on public.loan_entries for select using (owner_user_id = auth.uid());
drop policy if exists "own_loan_entries_insert" on public.loan_entries;
create policy "own_loan_entries_insert" on public.loan_entries for insert with check (owner_user_id = auth.uid());
drop policy if exists "own_loan_entries_update" on public.loan_entries;
create policy "own_loan_entries_update" on public.loan_entries for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "own_loan_entries_delete" on public.loan_entries;
create policy "own_loan_entries_delete" on public.loan_entries for delete using (owner_user_id = auth.uid());

drop policy if exists "own_installment_plans_select" on public.installment_plans;
create policy "own_installment_plans_select" on public.installment_plans for select using (owner_user_id = auth.uid());
drop policy if exists "own_installment_plans_insert" on public.installment_plans;
create policy "own_installment_plans_insert" on public.installment_plans for insert with check (owner_user_id = auth.uid());
drop policy if exists "own_installment_plans_update" on public.installment_plans;
create policy "own_installment_plans_update" on public.installment_plans for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "own_installment_plans_delete" on public.installment_plans;
create policy "own_installment_plans_delete" on public.installment_plans for delete using (owner_user_id = auth.uid());

drop policy if exists "own_installments_select" on public.installments;
create policy "own_installments_select" on public.installments for select using (owner_user_id = auth.uid());
drop policy if exists "own_installments_insert" on public.installments;
create policy "own_installments_insert" on public.installments for insert with check (owner_user_id = auth.uid());
drop policy if exists "own_installments_update" on public.installments;
create policy "own_installments_update" on public.installments for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "own_installments_delete" on public.installments;
create policy "own_installments_delete" on public.installments for delete using (owner_user_id = auth.uid());

drop policy if exists "own_payments_select" on public.payments;
create policy "own_payments_select" on public.payments for select using (owner_user_id = auth.uid());
drop policy if exists "own_payments_insert" on public.payments;
create policy "own_payments_insert" on public.payments for insert with check (owner_user_id = auth.uid());
drop policy if exists "own_payments_update" on public.payments;
create policy "own_payments_update" on public.payments for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "own_payments_delete" on public.payments;
create policy "own_payments_delete" on public.payments for delete using (owner_user_id = auth.uid());

drop policy if exists "own_payment_allocations_select" on public.payment_allocations;
create policy "own_payment_allocations_select" on public.payment_allocations for select using (owner_user_id = auth.uid());
drop policy if exists "own_payment_allocations_insert" on public.payment_allocations;
create policy "own_payment_allocations_insert" on public.payment_allocations for insert with check (owner_user_id = auth.uid());
drop policy if exists "own_payment_allocations_update" on public.payment_allocations;
create policy "own_payment_allocations_update" on public.payment_allocations for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "own_payment_allocations_delete" on public.payment_allocations;
create policy "own_payment_allocations_delete" on public.payment_allocations for delete using (owner_user_id = auth.uid());

-- Grant access to authenticated users (RLS enforces ownership).
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

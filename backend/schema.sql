-- =====================================================================
-- K S ENTERPRISES HRMS  -  run this ONCE in Supabase -> SQL Editor
-- =====================================================================

-- ---------- 1. TABLES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  emp_code text unique not null,            -- e.g. KS01/2025-26  (this is the login ID)
  name text not null,
  role text not null default 'employee' check (role in ('admin','employee')),
  designation text default 'Unskilled',     -- Unskilled / Supervisor / Driver / Forklift Operator
  gender text default 'Male',
  dob date,
  doj date,
  esi_no text, uan_no text, pf_no text,
  mobile text, aadhaar text, bank_details text,
  photo_url text,
  fixed_basic numeric default 15126.92,     -- "Fixed Basic & DA" column of Form 22
  fixed_other numeric default 0,            -- "Fixed Other Allow"
  fixed_ph numeric default 484.84,          -- "Fixed PH" (national & festival holidays)
  can_mark_attendance boolean default false,-- employee allowed to fill attendance for everyone
  active boolean default true,              -- false = left the company, access blocked
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.attendance (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  att_date date not null,
  status text not null check (status in ('P','P/2')),   -- blank (no row) = absent
  marked_by uuid references public.profiles(id),
  unique (profile_id, att_date)
);

create table public.ton_entries (
  id bigint generated always as identity primary key,
  list_type text not null check (list_type in ('primary','secondary')),
  entry_date date not null,
  vehicle_no text,
  invoiced_qty numeric default 0,
  tonnage numeric default 0,
  category text,            -- DAIRY / PET (primary list)
  party_name text,          -- secondary list: NAME column
  worker_names text,        -- NEW: names of employees who loaded (replaces invoice no / buyer)
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table public.payslips (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  month date not null,                      -- always the 1st of the month
  data jsonb not null,                      -- full Form-22 row for that employee
  published boolean default false,          -- true = employee can see it
  published_at timestamptz,
  unique (profile_id, month)
);

create table public.birthday_wishes (
  id bigint generated always as identity primary key,
  from_profile uuid not null references public.profiles(id) on delete cascade,
  to_profile uuid not null references public.profiles(id) on delete cascade,
  wish_year int not null,
  message text,
  created_at timestamptz default now(),
  unique (from_profile, to_profile, wish_year)
);

-- ---------- 2. HELPER FUNCTIONS ----------
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and active) $$;

create or replace function public.can_mark() returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from profiles where id = auth.uid() and active and (role='admin' or can_mark_attendance)) $$;

create or replace function public.is_active_user() returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from profiles where id = auth.uid() and active) $$;

-- ---------- 3. SAFE DIRECTORY (names, photos, birthdays visible to everyone) ----------
create or replace view public.directory as
  select id, emp_code, name, designation, gender, dob, photo_url, role
  from public.profiles where active;
grant select on public.directory to authenticated;

-- ---------- 4. ROW LEVEL SECURITY ----------
alter table public.profiles        enable row level security;
alter table public.attendance      enable row level security;
alter table public.ton_entries     enable row level security;
alter table public.payslips        enable row level security;
alter table public.birthday_wishes enable row level security;

-- profiles: you see yourself; admin sees & changes everything
create policy "profiles read"   on public.profiles for select using (id = auth.uid() or is_admin());
create policy "profiles admin"  on public.profiles for all    using (is_admin()) with check (is_admin());

-- attendance: employee sees own; admin / permitted employees see & edit all
create policy "att read"  on public.attendance for select using (profile_id = auth.uid() or can_mark());
create policy "att write" on public.attendance for all    using (can_mark()) with check (can_mark());

-- ton list: every active employee can read/add/edit; delete = admin or the person who added it
create policy "ton read"   on public.ton_entries for select using (is_active_user());
create policy "ton insert" on public.ton_entries for insert with check (is_active_user());
create policy "ton update" on public.ton_entries for update using (is_active_user());
create policy "ton delete" on public.ton_entries for delete using (is_admin() or created_by = auth.uid());

-- payslips: employee sees ONLY own + ONLY published; admin everything
create policy "slip read"  on public.payslips for select using ((profile_id = auth.uid() and published) or is_admin());
create policy "slip admin" on public.payslips for all    using (is_admin()) with check (is_admin());

-- birthday wishes
create policy "wish read"   on public.birthday_wishes for select
  using (to_profile = auth.uid() or from_profile = auth.uid() or is_admin());
create policy "wish insert" on public.birthday_wishes for insert
  with check (from_profile = auth.uid() and to_profile <> auth.uid());

-- ---------- 5. PHOTO STORAGE ----------
insert into storage.buckets (id, name, public) values ('avatars','avatars',true) on conflict do nothing;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars admin write" on storage.objects for all
  using (bucket_id = 'avatars' and is_admin()) with check (bucket_id = 'avatars' and is_admin());

-- ---------- 6. LIVE UPDATES (admin changes appear on all phones instantly) ----------
alter publication supabase_realtime add table public.attendance, public.ton_entries, public.payslips, public.birthday_wishes;

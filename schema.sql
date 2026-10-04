-- Run once in Supabase > SQL Editor
create table departments(id uuid primary key default gen_random_uuid(), name text not null unique);
create table shifts(code text primary key, label text not null, start_time time not null, end_time time not null);
insert into shifts values('O','Off duty','00:00','00:00'),('M','Morning','08:00','14:00'),('D','Full day','08:00','18:00');
create table profiles(id uuid primary key references auth.users on delete cascade, full_name text not null, email text not null,
  role text not null default 'staff' check(role in('hod','staff')), department_id uuid references departments, active boolean not null default true);
create table rosters(id uuid primary key default gen_random_uuid(), department_id uuid not null references departments,
  month date not null, published boolean not null default false, unique(department_id,month));
create table assignments(roster_id uuid references rosters on delete cascade, user_id uuid references profiles, day date not null,
  shift_code text not null references shifts, primary key(roster_id,user_id,day));
create table publication_history(id bigserial primary key, roster_id uuid references rosters, action text, acted_by uuid, at timestamptz default now());

create function is_hod() returns boolean language sql security definer stable as $$
  select exists(select 1 from profiles where id=auth.uid() and role='hod' and active) $$;
create function my_dept() returns uuid language sql security definer stable as $$
  select department_id from profiles where id=auth.uid() and active $$;

alter table departments enable row level security; alter table shifts enable row level security; alter table profiles enable row level security;
alter table rosters enable row level security; alter table assignments enable row level security; alter table publication_history enable row level security;

create policy dep_r on departments for select using(id=my_dept());
create policy sh_r on shifts for select using(auth.uid() is not null);
create policy sh_w on shifts for all using(is_hod()) with check(is_hod());
create policy pr_r on profiles for select using(id=auth.uid() or department_id=my_dept());
create policy pr_w on profiles for all using(is_hod() and department_id=my_dept()) with check(is_hod() and department_id=my_dept());
create policy ro_r on rosters for select using(department_id=my_dept() and (published or is_hod()));
create policy ro_w on rosters for all using(is_hod() and department_id=my_dept()) with check(is_hod() and department_id=my_dept());
create policy as_r on assignments for select using(exists(select 1 from rosters r where r.id=roster_id and r.department_id=my_dept() and (r.published or is_hod())));
create policy as_w on assignments for all using(is_hod()) with check(is_hod());
create policy ph_r on publication_history for select using(is_hod());
create policy ph_w on publication_history for insert with check(is_hod());

alter publication supabase_realtime add table rosters;

-- FIRST HOD: 1) insert department, 2) create your user in Authentication > Users, 3) run (edit values):
-- insert into departments(name) values('My Department');
-- insert into profiles(id,full_name,email,role,department_id)
--   select u.id,'Your Name',u.email,'hod',(select id from departments limit 1) from auth.users u where u.email='you@example.com';

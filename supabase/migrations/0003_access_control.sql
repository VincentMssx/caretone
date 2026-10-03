-- CareVoice: demandes d'accès, suspension des membres et journal d'administration.

alter table public.organizations
  add column if not exists accepting_requests boolean not null default false;

alter table public.organization_members
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended'));

create or replace function private.current_organization_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select organization_id
  from public.organization_members
  where user_id = (select auth.uid()) and status = 'active'
$$;

create table if not exists public.access_requests (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  display_name text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  unique (organization_id, email)
);

create table if not exists public.access_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  event text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists access_requests_org_status_idx
  on public.access_requests(organization_id, status, requested_at desc);
create index if not exists access_audit_logs_org_created_idx
  on public.access_audit_logs(organization_id, created_at desc);

alter table public.access_requests enable row level security;
alter table public.access_audit_logs enable row level security;
revoke all on public.access_requests, public.access_audit_logs from anon, authenticated;

grant select, update on public.access_requests to authenticated;
grant select on public.access_audit_logs to authenticated;

create policy "owners read access requests" on public.access_requests for select to authenticated
  using (organization_id in (
    select id from public.organizations where owner_id = (select auth.uid())
  ));
create policy "owners update access requests" on public.access_requests for update to authenticated
  using (organization_id in (
    select id from public.organizations where owner_id = (select auth.uid())
  ));
create policy "owners read access audit" on public.access_audit_logs for select to authenticated
  using (organization_id in (
    select id from public.organizations where owner_id = (select auth.uid())
  ));

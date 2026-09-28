-- CareVoice MVP: modèle multi-cabinet et RLS.
-- Les champs cliniques et d'identité restent chiffrés par l'API avant insertion.

create schema if not exists private;

create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'nurse' check (role in ('owner', 'nurse', 'replacement')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists organization_members_user_idx
  on public.organization_members(user_id);

create or replace function private.current_organization_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select organization_id
  from public.organization_members
  where user_id = (select auth.uid())
$$;

revoke all on function private.current_organization_ids() from public;
grant usage on schema private to authenticated;
grant execute on function private.current_organization_ids() to authenticated;

alter table public.patients
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists encrypted_care_profile text,
  add column if not exists archived_at timestamptz;

alter table public.transmissions
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists version integer not null default 1,
  add column if not exists encrypted_vitals text,
  add column if not exists validated_at timestamptz;

create table if not exists public.professionals (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  encrypted_profile text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tours (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tour_date date not null,
  period text not null check (period in ('morning', 'evening', 'office')),
  assigned_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'completed')),
  created_at timestamptz not null default now(),
  unique (organization_id, tour_date, period)
);

create table if not exists public.tour_visits (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tour_id uuid not null references public.tours(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  sequence_order integer not null check (sequence_order > 0),
  planned_at timestamptz,
  encrypted_care_note text,
  status text not null default 'planned' check (status in ('planned', 'done', 'cancelled')),
  unique (tour_id, patient_id)
);

create table if not exists public.schedule_shifts (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  shift_date date not null,
  period text not null check (period in ('morning', 'evening')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  unique (organization_id, user_id, shift_date, period)
);

create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  encrypted_billing_data text not null,
  status text not null default 'draft' check (status in ('draft', 'validated', 'submitted')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  encrypted_content text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  encrypted_subject text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  encrypted_body text not null,
  created_at timestamptz not null default now()
);

create index if not exists patients_org_idx on public.patients(organization_id);
create index if not exists transmissions_org_idx on public.transmissions(organization_id);
create index if not exists professionals_org_idx on public.professionals(organization_id);
create index if not exists tours_org_idx on public.tours(organization_id);
create index if not exists tour_visits_org_idx on public.tour_visits(organization_id);
create index if not exists schedule_shifts_org_idx on public.schedule_shifts(organization_id);
create index if not exists quotes_org_idx on public.quotes(organization_id);
create index if not exists notes_org_idx on public.notes(organization_id);
create index if not exists conversations_org_idx on public.conversations(organization_id);
create index if not exists messages_org_idx on public.messages(organization_id);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.professionals enable row level security;
alter table public.tours enable row level security;
alter table public.tour_visits enable row level security;
alter table public.schedule_shifts enable row level security;
alter table public.quotes enable row level security;
alter table public.notes enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on public.organizations, public.organization_members, public.patients,
  public.transmissions, public.professionals, public.tours, public.tour_visits,
  public.schedule_shifts, public.quotes, public.notes, public.conversations,
  public.messages from anon;

grant select, insert, update, delete on public.organizations, public.organization_members,
  public.patients, public.transmissions, public.professionals, public.tours,
  public.tour_visits, public.schedule_shifts, public.quotes, public.notes,
  public.conversations, public.messages to authenticated;

create policy "members read organizations" on public.organizations for select to authenticated
  using (id in (select private.current_organization_ids()));
create policy "owners create organizations" on public.organizations for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "owners update organizations" on public.organizations for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "members read memberships" on public.organization_members for select to authenticated
  using (organization_id in (select private.current_organization_ids()));
create policy "owners manage memberships" on public.organization_members for all to authenticated
  using (organization_id in (select id from public.organizations where owner_id = (select auth.uid())))
  with check (organization_id in (select id from public.organizations where owner_id = (select auth.uid())));

-- Les tables métier utilisent la même frontière de cabinet.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'patients', 'transmissions', 'professionals', 'tours', 'tour_visits',
    'schedule_shifts', 'quotes', 'notes', 'conversations', 'messages'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy "cabinet members select" on public.%I for select to authenticated using (organization_id in (select private.current_organization_ids()))',
      table_name
    );
    execute format(
      'create policy "cabinet members insert" on public.%I for insert to authenticated with check (organization_id in (select private.current_organization_ids()))',
      table_name
    );
    execute format(
      'create policy "cabinet members update" on public.%I for update to authenticated using (organization_id in (select private.current_organization_ids())) with check (organization_id in (select private.current_organization_ids()))',
      table_name
    );
    execute format(
      'create policy "cabinet members delete" on public.%I for delete to authenticated using (organization_id in (select private.current_organization_ids()))',
      table_name
    );
  end loop;
end $$;

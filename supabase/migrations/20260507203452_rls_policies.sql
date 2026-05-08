-- RLS policies for the envero-marine schema.
--
-- Model:
--   anon          : visitors with no session (publishable key, no JWT user).
--   authenticated : logged-in staff. Distinguished by helpers below.
--   service_role  : backend (seed scripts, server endpoints). Bypasses RLS via the
--                   BYPASSRLS attribute on the postgres role; no policy applies.
--
-- The two helper functions below run as SECURITY DEFINER so they can read
-- public.app_user even when RLS on app_user is enabled (otherwise the policies
-- on app_user that reference these helpers would recurse into themselves).

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_user
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

create or replace function public.is_vendor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_user
    where id = auth.uid()
      and role = 'vendor'
      and active = true
  );
$$;

-- Lock everything down: enabling RLS with no policies means default deny for
-- anon and authenticated. service_role keeps full access.
alter table public.app_user      enable row level security;
alter table public.client        enable row level security;
alter table public.quiz          enable row level security;
alter table public.quiz_question enable row level security;
alter table public.appointment   enable row level security;
alter table public.message       enable row level security;

-- ===========================================================================
-- app_user
-- ===========================================================================

create policy app_user_admin_all
  on public.app_user
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy app_user_vendor_select_self
  on public.app_user
  for select
  to authenticated
  using (id = auth.uid() and public.is_vendor());

-- ===========================================================================
-- client
-- ===========================================================================

create policy client_admin_all
  on public.client
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy client_vendor_select_assigned
  on public.client
  for select
  to authenticated
  using (
    public.is_vendor()
    and exists (
      select 1 from public.appointment a
      where a.client_id = client.id
        and a.vendor_id = auth.uid()
    )
  );

create policy client_anon_insert
  on public.client
  for insert
  to anon
  with check (true);

-- ===========================================================================
-- quiz
-- ===========================================================================

create policy quiz_admin_all
  on public.quiz
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy quiz_vendor_select
  on public.quiz
  for select
  to authenticated
  using (public.is_vendor());

create policy quiz_anon_select_active
  on public.quiz
  for select
  to anon
  using (active = true);

-- ===========================================================================
-- quiz_question
-- ===========================================================================

create policy quiz_question_admin_all
  on public.quiz_question
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy quiz_question_vendor_select
  on public.quiz_question
  for select
  to authenticated
  using (public.is_vendor());

create policy quiz_question_anon_select_active
  on public.quiz_question
  for select
  to anon
  using (
    active = true
    and exists (
      select 1 from public.quiz q
      where q.id = quiz_question.quiz_id
        and q.active = true
    )
  );

-- ===========================================================================
-- appointment
-- ===========================================================================

create policy appointment_admin_all
  on public.appointment
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy appointment_vendor_select_own
  on public.appointment
  for select
  to authenticated
  using (vendor_id = auth.uid() and public.is_vendor());

-- Vendor can update their own appointments. The policy guards vendor_id
-- (cannot reassign to a different vendor); the trigger below guards
-- client_id (RLS WITH CHECK can't compare NEW vs OLD).
create policy appointment_vendor_update_own
  on public.appointment
  for update
  to authenticated
  using (vendor_id = auth.uid() and public.is_vendor())
  with check (vendor_id = auth.uid() and public.is_vendor());

-- Anonymous visitors create appointment requests. They cannot pre-assign a
-- vendor or set a non-pending status — admin promotes the request later.
create policy appointment_anon_insert
  on public.appointment
  for insert
  to anon
  with check (vendor_id is null and status = 'pending');

-- Block vendors from changing client_id on UPDATE. (vendor_id is already
-- guarded by the policy WITH CHECK; this trigger is the symmetric guard
-- for client_id, which policies can't express without OLD/NEW access.)
create or replace function public.appointment_vendor_protect_columns()
returns trigger
language plpgsql
as $$
begin
  if public.is_vendor() then
    if new.client_id is distinct from old.client_id then
      raise exception 'vendor cannot change client_id on appointment %', old.id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_appointment_vendor_protect_columns
  before update on public.appointment
  for each row execute function public.appointment_vendor_protect_columns();

-- ===========================================================================
-- message
-- ===========================================================================

create policy message_admin_all
  on public.message
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Anonymous contact form submissions. Cannot pre-mark as read or pre-assign
-- handled_by — only admin sets those.
create policy message_anon_insert
  on public.message
  for insert
  to anon
  with check (read = false and handled_by is null);

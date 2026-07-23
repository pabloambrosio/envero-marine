-- Schema reducido: la única función del sitio es guardar citas y que un
-- admin único (sin roles, sin app_user) las consulte/gestione.
--
-- Se tiran client, app_user, quiz, quiz_question y message del diseño
-- anterior — ver docs/plans/2026-07-22-appointment-only-backend-design.md.
-- Los datos de contacto (name/email/phone) viven directo en appointment,
-- no hay más tabla client. El admin es un usuario fijo en auth.users,
-- seedeado por scripts/seed-admin.js.

create table public.appointment (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  email            text not null,
  phone            text not null,
  appointment_date timestamptz not null,
  status           text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'cancelled')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_appointment_status on public.appointment (status);
create index idx_appointment_date on public.appointment (appointment_date);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_appointment_updated
  before update on public.appointment
  for each row execute function public.set_updated_at();

-- RLS: sin roles. anon solo puede crear citas pendientes; cualquier sesión
-- autenticada (el admin único) ve y gestiona todo.
alter table public.appointment enable row level security;

create policy appointment_anon_insert
  on public.appointment
  for insert
  to anon
  with check (status = 'pending');

create policy appointment_authenticated_select
  on public.appointment
  for select
  to authenticated
  using (true);

create policy appointment_authenticated_update
  on public.appointment
  for update
  to authenticated
  using (true)
  with check (true);

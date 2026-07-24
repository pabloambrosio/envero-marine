-- Tabla `message`: soporta el form de contacto público del home. Mismo
-- patrón de RLS que `appointment` (ver 20260723024338_appointment_only_schema.sql):
-- anon solo inserta, authenticated (el admin único) lee todo. Los GRANTs de
-- base los cubre el `alter default privileges` de
-- 20260723193932_appointment_grants.sql, que aplica a cualquier tabla nueva
-- creada por el rol `postgres` en `public`.

create table public.message (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text,
  company_name text,
  message      text not null,
  created_at   timestamptz not null default now()
);

create index idx_message_created_at on public.message (created_at desc);

alter table public.message enable row level security;

create policy message_anon_insert
  on public.message
  for insert
  to anon
  with check (true);

create policy message_authenticated_select
  on public.message
  for select
  to authenticated
  using (true);

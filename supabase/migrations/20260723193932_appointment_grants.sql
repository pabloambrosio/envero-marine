-- El stack local de Supabase (Docker) solo otorga por defecto Dxtm
-- (delete/references/trigger/maintain) a anon/authenticated/service_role
-- sobre tablas creadas por el rol `postgres` — falta insert/select/update.
-- Nunca se había notado porque nadie probó un INSERT real contra
-- `appointment` en una DB local recién reseteada hasta ahora (el wizard
-- público no tenía submit). `service_role` tiene BYPASSRLS, pero eso solo
-- salta las policies de RLS, no reemplaza el GRANT de base.
grant select, insert, update, delete on public.appointment
  to anon, authenticated, service_role;

-- Mismo problema a futuro para cualquier tabla nueva creada por `postgres`.
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;

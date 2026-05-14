-- Materializar las reglas de slot de cita en la base.
--
-- Tres invariantes que ya valida el módulo `appointment` en
-- src/modules/appointment/lib/slot.ts. La DB no debería confiar solo en eso:
-- si mañana se agrega otro caller (script, service-role, cliente nuevo),
-- la base sigue cuidando la regla.
--
-- Reglas (Ciudad del Carmen, Campeche, México · TZ America/Merida UTC-6):
--   1. La cita cae en una hora exacta (sin minutos, segundos ni fracciones).
--   2. Lunes a viernes, 08:00–18:00. Último slot empieza 17:00.
--   3. Solo puede haber UNA cita "real" (confirmed/completed) por slot.
--      pending y cancelled coexisten — varios anons proponen el mismo
--      horario, el admin confirma uno solo y cancela el resto a mano.
--
-- Si la migración falla al aplicarse, es porque hay filas existentes que
-- violan los CHECK. En dev, lo más rápido es `yarn supabase db reset`
-- (re-aplica todo desde cero). En prod, investigar antes de borrar.

-- 1) CHECK: la cita está en una hora en punto.
--
--    date_trunc('hour', x) iguala x solo si x ya está en :00:00 sin fracción
--    de segundo. Aplicado en el huso de la empresa para que el constraint
--    sea inmutable (no dependa del huso de la sesión Postgres).
alter table public.appointment
  add constraint appointment_slot_on_hour_check
  check (
    date_trunc('hour', appointment_date at time zone 'America/Merida')
      = appointment_date at time zone 'America/Merida'
  );

-- 2) CHECK: día Mon–Fri y hora 08–17 en America/Merida.
--
--    extract(dow): 0=domingo, 6=sábado. Mon–Fri = 1..5.
--    `between 8 and 17` cubre los slots 08:00..17:00 (último slot 17:00–18:00).
alter table public.appointment
  add constraint appointment_slot_business_hours_check
  check (
    extract(dow from appointment_date at time zone 'America/Merida')
      between 1 and 5
    and extract(hour from appointment_date at time zone 'America/Merida')
      between 8 and 17
  );

-- 3) Partial unique index: una sola cita real por slot.
--
--    pending y cancelled NO entran al índice — varios anons pueden proponer
--    el mismo horario tranquilos. Cuando el admin confirma una, esa entra
--    al índice. Si intenta confirmar una segunda del mismo slot, Postgres
--    devuelve unique_violation (SQLSTATE 23505) y el endpoint admin lo
--    mapea a un error amigable.
--
--    Cancelar libera el slot (sale del índice). Completed se mantiene
--    adentro: el slot queda históricamente ocupado.
create unique index appointment_one_real_per_slot
  on public.appointment (appointment_date)
  where status in ('confirmed', 'completed');

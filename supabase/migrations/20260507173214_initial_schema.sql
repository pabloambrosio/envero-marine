-- Initial schema for envero-marine
-- Tables: app_user, client, quiz, quiz_question, appointment, message
-- Decisions:
--   * Users are split: authenticated staff in app_user (FK -> auth.users),
--     leads/visitors stored in client (no auth).
--   * Quizzes are templates; questions live in quiz_question with a
--     position int that the front uses to order them.
--   * "Solicitudes de cita" are appointments with status='pending';
--     admin promotes them to 'confirmed' and assigns vendor_id.
--   * quiz_snapshot holds both questions and answers at the moment
--     the appointment was requested (immutable).

-- Staff users (vendor + admin). Mirrors a row from auth.users.
create table public.app_user (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  email        text unique not null,
  role         text not null check (role in ('vendor', 'admin')),
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Clients / leads (no auth)
create table public.client (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  phone        text,
  company_name text,
  ip_hash      text,
  created_at   timestamptz not null default now()
);

-- Quiz template
create table public.quiz (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  version      int not null default 1,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Questions belonging to a quiz
create table public.quiz_question (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quiz(id) on delete cascade,
  position     integer not null default 0,
  prompt       text not null,
  type         text not null default 'text',
  config       jsonb,
  required     boolean not null default true,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_quiz_question_quiz_position
  on public.quiz_question (quiz_id, position);

-- Appointment (pending until accepted by admin and assigned a vendor)
create table public.appointment (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.client(id) on delete cascade,
  vendor_id        uuid references public.app_user(id),
  quiz_id          uuid references public.quiz(id),
  quiz_snapshot    jsonb not null,
  appointment_date timestamptz not null,
  status           text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_appointment_status on public.appointment (status);
create index idx_appointment_vendor on public.appointment (vendor_id);

-- Contact form messages
create table public.message (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  subject       text,
  message       text not null,
  ip_hash       text,
  read          boolean not null default false,
  handled_by    uuid references public.app_user(id),
  created_at    timestamptz not null default now()
);

-- Reusable updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_app_user_updated
  before update on public.app_user
  for each row execute function public.set_updated_at();

create trigger trg_quiz_updated
  before update on public.quiz
  for each row execute function public.set_updated_at();

create trigger trg_quiz_question_updated
  before update on public.quiz_question
  for each row execute function public.set_updated_at();

create trigger trg_appointment_updated
  before update on public.appointment
  for each row execute function public.set_updated_at();

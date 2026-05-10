-- Migrate quiz_question from a generic question engine to three closed types.
--
-- Why:
--   Originally `type` was free-form text and `config` was opaque jsonb, on the
--   assumption we'd build a flexible question engine. We've scoped that down:
--   only three question kinds will ever exist (single/multi choice + open
--   text), the answer options live in a typed array, and a single boolean
--   toggles the extra free-text "Other" answer. No engine, no jsonb config.
--
-- Existing rows are dev seed data; deleting is cheaper than mapping the old
-- `type` strings + `config` shapes onto the new schema.

-- 1. Wipe legacy rows. They'd violate the new CHECK below.
delete from public.quiz_question;

-- 2. Drop the open-ended config column.
alter table public.quiz_question
  drop column config;

-- 3. Replace the free-form `type` text column with a closed enum.
--    No default: every question must declare its type explicitly.
create type public.question_type as enum (
  'single_choice',
  'multiple_choice',
  'open_text'
);

alter table public.quiz_question
  alter column type drop default;

alter table public.quiz_question
  alter column type type public.question_type
  using type::public.question_type;

-- 4. Add the typed options array and the allow_other flag.
--
--    options is text[] (not jsonb): plain strings ordered by array index are
--    enough. We don't need labels, ids or metadata — and if we ever do, the
--    immutable record of what the client picked already lives in
--    appointment.quiz_snapshot.
--
--    allow_other defaults to true: by default every choice question shows an
--    extra free-text field for "Other". The admin can switch it off per
--    question. For open_text questions the flag is meaningless (the question
--    is itself open) and the CHECK below pins it to true.
alter table public.quiz_question
  add column options     text[]  not null default '{}',
  add column allow_other boolean not null default true;

-- 5. Cross-field CHECK mirroring the Zod schema in
--    src/modules/quiz/types/question.ts. The API rejects bad payloads with a
--    400; this constraint is the belt-and-suspenders so a buggy caller can't
--    leave the table in an inconsistent state.
--
--    Rules:
--      single_choice / multiple_choice → at least 2 options.
--      open_text                       → no options, allow_other forced to
--                                        true (the flag is irrelevant when
--                                        the whole question is already open).
alter table public.quiz_question
  add constraint quiz_question_type_options_check
  check (
    (
      type in ('single_choice', 'multiple_choice')
      and cardinality(options) >= 2
    )
    or (
      type = 'open_text'
      and cardinality(options) = 0
      and allow_other = true
    )
  );

-- Atomic bulk reorder of quiz_question rows.
--
-- Why a function:
--   Supabase JS / PostgREST has no client-side transactions, so doing N updates
--   from the service layer leaves the door open to partial reorder if one fails
--   mid-way (two questions ending with position=0, etc). A plpgsql function
--   runs in an implicit transaction: any RAISE inside the loop rolls back every
--   UPDATE applied so far.
--
-- Security:
--   SECURITY INVOKER (default) so the function respects the caller's RLS. The
--   `quiz_question_admin_all` policy is what actually authorises the writes —
--   the function does not bypass it. The middleware admin gate is layer 1,
--   RLS is layer 2.
--
-- Pertenencia (que el id pertenezca al quiz):
--   Each UPDATE filters by both id and quiz_id. If a row is missing (wrong
--   quiz_id, or non-existent id) the UPDATE affects 0 rows, GET DIAGNOSTICS
--   catches it, and we raise — triggering the rollback.

create or replace function public.reorder_quiz_questions(
  p_quiz_id uuid,
  p_items   jsonb
)
returns setof public.quiz_question
language plpgsql
as $$
declare
  item     jsonb;
  affected int;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    update public.quiz_question
       set position = (item->>'position')::int
     where id      = (item->>'id')::uuid
       and quiz_id = p_quiz_id;

    get diagnostics affected = row_count;

    if affected = 0 then
      raise exception 'question % not found in quiz %',
        item->>'id', p_quiz_id;
    end if;
  end loop;

  return query
    select *
      from public.quiz_question
     where quiz_id = p_quiz_id
     order by position asc;
end;
$$;

-- Supabase grants execute to anon/authenticated/service_role by default on
-- public functions. We revoke from anon explicitly: even though RLS would
-- already block any UPDATE attempt, denying invocation is the cleaner default.
revoke execute on function public.reorder_quiz_questions(uuid, jsonb) from public;
revoke execute on function public.reorder_quiz_questions(uuid, jsonb) from anon;
grant  execute on function public.reorder_quiz_questions(uuid, jsonb) to authenticated;

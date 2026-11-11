-- Psychosocial risk survey: schema, row-level security and submit function.
-- Run once in Supabase > SQL Editor (or with the Supabase CLI: supabase db push).

-- 1. Who may use the survey. Managed from the app (Admin > Access) or SQL.
create table if not exists public.allowed_emails (
  email    text primary key check (email = lower(email)),
  role     text not null default 'respondent' check (role in ('respondent', 'admin')),
  added_at timestamptz not null default now()
);

-- 2. Answers. Deliberately has NO user id, NO timestamp and NO IP.
create table if not exists public.responses (
  id             uuid primary key default gen_random_uuid(),
  year           int  not null,
  workplace      text not null check (workplace in ('escritorio', 'terreno', 'ambos')),
  engagement     text not null check (engagement in ('proprio', 'externo', 'freelancer', 'nd')),
  answers        jsonb not null,
  comment_stress text,
  comment_change text
);
create index if not exists responses_year_idx on public.responses (year);

-- 3. Who has already answered in a given year (no link to the answers).
create table if not exists public.submissions (
  year    int  not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (year, user_id)
);

alter table public.allowed_emails enable row level security;
alter table public.responses      enable row level security;
alter table public.submissions    enable row level security;

-- Helpers that read the signed-in user's email from the JWT.
create or replace function public.current_email()
returns text language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create or replace function public.is_allowed()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.allowed_emails where email = public.current_email())
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.allowed_emails
    where email = public.current_email() and role = 'admin'
  )
$$;

-- allowed_emails: no policies on purpose. Only the server (service role key) can read or write it.

-- responses: only admins can read or delete. Nobody inserts directly; use submit_response().
drop policy if exists "admins read responses"   on public.responses;
drop policy if exists "admins delete responses" on public.responses;
create policy "admins read responses"   on public.responses for select to authenticated using (public.is_admin());
create policy "admins delete responses" on public.responses for delete to authenticated using (public.is_admin());

-- submissions: a person can see only their own rows.
drop policy if exists "own submissions" on public.submissions;
create policy "own submissions" on public.submissions for select to authenticated using (user_id = auth.uid());

-- Single entry point for answering. Checks the allowlist, enforces one response per
-- person per year, and stores answers and the "has answered" marker in one transaction.
create or replace function public.submit_response(
  p_year int,
  p_workplace text,
  p_engagement text,
  p_answers jsonb,
  p_comment_stress text,
  p_comment_change text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_allowed() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  begin
    insert into public.submissions (year, user_id) values (p_year, auth.uid());
  exception when unique_violation then
    raise exception 'already_submitted' using errcode = '23505';
  end;

  insert into public.responses (year, workplace, engagement, answers, comment_stress, comment_change)
  values (p_year, p_workplace, p_engagement, p_answers,
          left(nullif(trim(coalesce(p_comment_stress, '')), ''), 800),
          left(nullif(trim(coalesce(p_comment_change, '')), ''), 800));
end;
$$;

revoke all on function public.submit_response(int, text, text, jsonb, text, text) from public, anon;
grant execute on function public.submit_response(int, text, text, jsonb, text, text) to authenticated;

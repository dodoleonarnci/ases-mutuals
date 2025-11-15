do $$
begin
    if not exists (
        select 1
        from pg_type t
        join pg_namespace n on n.oid = t.typnamespace
        where t.typname = 'sex_identity'
          and n.nspname = 'public'
    ) then
        create type public.sex_identity as enum ('male', 'female', 'non-binary');
    end if;
end
$$;

alter table if exists public.students
    alter column first_name drop not null,
    alter column last_name drop not null;

alter table if exists public.students
    add column if not exists sex public.sex_identity,
    add column if not exists dorm text,
    add column if not exists involvements text,
    add column if not exists close_friends text[],
    add column if not exists survey_completed boolean not null default false;

comment on column public.students.sex is 'Self-reported sex used for survey insights.';
comment on column public.students.dorm is 'Current dorm assignment provided through the onboarding survey.';
comment on column public.students.involvements is 'Free-form description of on-campus involvements.';
comment on column public.students.close_friends is 'List of 5-20 close friends supplied during the survey.';
comment on column public.students.survey_completed is 'Indicates whether the onboarding survey was submitted.';



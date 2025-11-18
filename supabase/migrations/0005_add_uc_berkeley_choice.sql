do $$
begin
    if not exists (
        select 1
        from pg_type t
        join pg_namespace n on n.oid = t.typnamespace
        where t.typname = 'uc_berkeley_choice'
          and n.nspname = 'public'
    ) then
        create type public.uc_berkeley_choice as enum ('no_friends', 'uc_berkeley');
    end if;
end
$$;

alter table if exists public.students
    add column if not exists uc_berkeley_choice public.uc_berkeley_choice;

comment on column public.students.uc_berkeley_choice is 'Response to the funny survey question: Would you rather have no friends or go to UC Berkeley?';


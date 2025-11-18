alter table if exists public.students
    add column if not exists user_id text;

comment on column public.students.user_id is 'User ID from the student names list, used for matching and identification.';


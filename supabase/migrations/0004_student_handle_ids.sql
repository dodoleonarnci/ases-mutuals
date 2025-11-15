alter table if exists public.students
    add column if not exists handle text;

update public.students
set handle = lower(split_part(email, '@', 1))
where handle is null;

alter table if exists public.students
    alter column handle set not null;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'students_handle_key'
    ) then
        alter table if exists public.students
            add constraint students_handle_key unique (handle);
    end if;
end
$$;

alter table if exists public.friendships
    add column if not exists requester_handle text,
    add column if not exists addressee_handle text;

update public.friendships f
set requester_handle = s.handle
from public.students s
where f.requester_id = s.id;

update public.friendships f
set addressee_handle = s.handle
from public.students s
where f.addressee_id = s.id;

alter table if exists public.matches
    add column if not exists student_a_handle text,
    add column if not exists student_b_handle text;

update public.matches m
set student_a_handle = s.handle
from public.students s
where m.student_a_id = s.id;

update public.matches m
set student_b_handle = s.handle
from public.students s
where m.student_b_id = s.id;

alter table if exists public.friendships
    drop constraint if exists friendships_requester_id_fkey,
    drop constraint if exists friendships_addressee_id_fkey;

alter table if exists public.matches
    drop constraint if exists matches_student_a_id_fkey,
    drop constraint if exists matches_student_b_id_fkey;

drop index if exists idx_friendships_requester;
drop index if exists idx_friendships_addressee;
drop index if exists idx_matches_student_a;
drop index if exists idx_matches_student_b;

alter table if exists public.friendships
    drop column if exists requester_id,
    drop column if exists addressee_id;

alter table if exists public.friendships
    rename column requester_handle to requester_id;

alter table if exists public.friendships
    rename column addressee_handle to addressee_id;

alter table if exists public.matches
    drop column if exists student_a_id,
    drop column if exists student_b_id;

alter table if exists public.matches
    rename column student_a_handle to student_a_id;

alter table if exists public.matches
    rename column student_b_handle to student_b_id;

alter table if exists public.friendships
    alter column requester_id set not null,
    alter column addressee_id set not null;

alter table if exists public.matches
    alter column student_a_id set not null,
    alter column student_b_id set not null;

alter table if exists public.students
    drop constraint if exists students_pkey;

alter table if exists public.students
    rename column id to legacy_uuid;

alter table if exists public.students
    rename column handle to id;

alter table if exists public.students
    add constraint students_pkey primary key (id);

alter table if exists public.students
    drop column if exists legacy_uuid;

alter table if exists public.friendships
    add constraint friendships_requester_id_fkey foreign key (requester_id) references public.students(id) on delete cascade,
    add constraint friendships_addressee_id_fkey foreign key (addressee_id) references public.students(id) on delete cascade;

alter table if exists public.matches
    add constraint matches_student_a_id_fkey foreign key (student_a_id) references public.students(id) on delete cascade,
    add constraint matches_student_b_id_fkey foreign key (student_b_id) references public.students(id) on delete cascade;

create index if not exists idx_friendships_requester on public.friendships (requester_id);
create index if not exists idx_friendships_addressee on public.friendships (addressee_id);
create index if not exists idx_matches_student_a on public.matches (student_a_id);
create index if not exists idx_matches_student_b on public.matches (student_b_id);



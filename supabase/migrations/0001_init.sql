create extension if not exists "uuid-ossp";
create extension if not exists citext;

create table if not exists public.students (
    id uuid primary key default gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    email citext not null unique,
    grad_year integer check (grad_year between 2020 and 2035),
    major text,
    interests text[],
    created_at timestamptz not null default timezone('utc', now())
);

create type public.friendship_status as enum ('pending', 'accepted', 'rejected');

create table if not exists public.friendships (
    id uuid primary key default gen_random_uuid(),
    requester_id uuid not null references public.students(id) on delete cascade,
    addressee_id uuid not null references public.students(id) on delete cascade,
    status friendship_status not null default 'pending',
    initiated_at timestamptz not null default timezone('utc', now()),
    responded_at timestamptz,
    unique(requester_id, addressee_id)
);

create type public.match_status as enum ('proposed', 'active', 'inactive');

create table if not exists public.matches (
    id uuid primary key default gen_random_uuid(),
    student_a_id uuid not null references public.students(id) on delete cascade,
    student_b_id uuid not null references public.students(id) on delete cascade,
    friendship_id uuid references public.friendships(id) on delete set null,
    compatibility_score numeric(5,2) default 0,
    status match_status not null default 'proposed',
    matched_at timestamptz not null default timezone('utc', now()),
    check (student_a_id <> student_b_id)
);

create index if not exists idx_friendships_requester on public.friendships (requester_id);
create index if not exists idx_friendships_addressee on public.friendships (addressee_id);
create index if not exists idx_matches_student_a on public.matches (student_a_id);
create index if not exists idx_matches_student_b on public.matches (student_b_id);

comment on table public.students is 'Core student profile records for the mutual matching webapp.';
comment on table public.friendships is 'Tracks friendship requests and their status between students.';
comment on table public.matches is 'Stores algorithmic matches generated from friendships or other heuristics.';



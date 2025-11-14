create table if not exists public.signups (
    id uuid primary key default gen_random_uuid(),
    email citext not null unique,
    created_at timestamptz not null default timezone('utc', now())
);

comment on table public.signups is 'Email waitlist for early access to the platform.';
comment on column public.signups.email is 'Unique email used to notify prospective users.';



alter table if exists public.signups
add column if not exists password_hash text;

comment on column public.signups.password_hash is 'BCrypt hashed password collected during the simple signup flow.';


alter table if exists public.signups
  add column if not exists phone text,
  add column if not exists instagram_handle text;

comment on column public.signups.phone is 'Optional phone number supplied during signup.';
comment on column public.signups.instagram_handle is 'Optional Instagram handle supplied during signup.';


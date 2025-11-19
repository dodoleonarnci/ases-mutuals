-- Remove friendships table and related structures
-- Note: friendship_id in matches table is kept as nullable but unused

-- Drop foreign key constraint from matches.friendship_id
alter table if exists public.matches
    drop constraint if exists matches_friendship_id_fkey;

-- Drop the friendships table
drop table if exists public.friendships cascade;

-- Drop the friendship_status enum
drop type if exists public.friendship_status;


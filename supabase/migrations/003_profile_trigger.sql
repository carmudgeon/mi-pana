-- Migration: 003_profile_trigger
-- Creates a trigger that automatically inserts a row into `profiles`
-- whenever a new user is confirmed in auth.users.
--
-- This replaces the client-side profile insert in AuthContext.signUp,
-- which fails with an RLS violation because the session is not yet
-- established at the time supabase.auth.signUp() returns.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    -- Use the username from user_metadata if provided, otherwise derive
    -- a default from the email address (part before the @)
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;  -- idempotent: safe to re-run
  return new;
end;
$$;

-- Fire after every new confirmed user is inserted into auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

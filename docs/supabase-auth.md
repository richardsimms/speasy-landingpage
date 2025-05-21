# supabase authentication guide

(updated 21 May 2025 to cover the “null value in column email” error)

This document explains how Speasy uses Supabase for password-less auth and what to do when the “500: Database error saving new user – null value in column email of relation users” message appears.

⸻

overview

Speasy relies on Supabase Auth tables (auth.users) while mirroring minimal data into an app-level table (public.users). A trigger named on_auth_user_created copies each new auth user into public.users.

⸻

why new-user invites can fail

If public.users.email is declared NOT NULL (the default) and the trigger inserts only the user id, the insert statement inside the trigger violates that constraint, aborting the whole transaction. Supabase then surfaces a generic 500 error.

the failing trigger code

insert into public.users (id) values (new.id);
-- email omitted → NULL → constraint error


⸻

the fix

Pick either of the following, depending on whether you actually need the email stored in public.users.

fix	when to use	code
A. include the email (recommended)	You want the email in public.users	plpgsql insert into public.users (id, email) values (new.id, new.email); 
B. allow NULL emails	You do not use the email in this table	sql alter table public.users alter column email drop not null; 

patched trigger (option A shown)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (email) do update
    set id = excluded.id;

  return new;
end;
$$;

-- ensure trigger exists (runs AFTER INSERT on auth.users)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

Once this change is applied, creating or inviting users via the Supabase dashboard and via supabase.auth.admin.createUser() will succeed without the 500 error.

⸻

updated database schema section

Replace the original “Database schema setup” block with:

-- public.users holds app-specific data
create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  stripe_customer_id text,
  subscription_status text,
  subscription_end_date timestamptz
);

-- trigger keeps public.users in sync with auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (email) do update set id = excluded.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


⸻

troubleshooting (new entry)

“null value in column email of relation users”

Symptom
Inviting or signing up a user returns 500: Database error saving new user and the Auth log shows null value in column "email".

Cause
public.handle_new_user() writes a row into public.users without providing the email; the table’s email column is NOT NULL.

Resolution
Update the trigger to include new.email (or relax the constraint) as shown above, then retry the invite.

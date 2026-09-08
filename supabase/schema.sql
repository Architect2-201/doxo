-- =======================================================
-- DOXO DATABASE SCHEMA & PERMISSION POLICIES (SUPABASE)
-- =======================================================

-- 1. Create PROFILES table linked to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  city text default 'თბილისი',
  role text default 'user' check (role in ('user', 'provider', 'admin')),
  status text default 'pending_verification' check (status in ('pending_verification', 'verified', 'rejected', 'blocked')),
  permissions jsonb default '{
    "canUseAI": false,
    "canBookTasks": false,
    "canViewCatalog": true,
    "canAccessDecisionCenter": false,
    "canAccessWallet": false,
    "canAccessProviderPortal": false
  }'::jsonb,
  preferences jsonb default '{}'::jsonb,
  verified_at timestamp with time zone,
  verified_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Policies
-- Allow anyone to read profiles (or authenticated users read their own)
create policy "Allow users to read their own profile"
  on public.profiles for select
  using (auth.uid() = id or (select email from auth.users where id = auth.uid()) = 'nukrichachava9@gmail.com');

-- Allow admins to see all profiles
create policy "Allow admins to read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or (select email from auth.users where id = auth.uid()) = 'nukrichachava9@gmail.com'
  );

-- Allow users to update their own basic profile info
create policy "Allow users to update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow admins to update any profile (including status and permissions)
create policy "Allow admins to update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or (select email from auth.users where id = auth.uid()) = 'nukrichachava9@gmail.com'
  );

-- 4. Automatic Trigger to create Profile on User Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_admin boolean;
  default_status text;
  default_role text;
  default_permissions jsonb;
begin
  -- Check if super admin
  if new.email = 'nukrichachava9@gmail.com' then
    is_admin := true;
    default_role := 'admin';
    default_status := 'verified';
    default_permissions := '{
      "canUseAI": true,
      "canBookTasks": true,
      "canViewCatalog": true,
      "canAccessDecisionCenter": true,
      "canAccessWallet": true,
      "canAccessProviderPortal": true
    }'::jsonb;
  else
    is_admin := false;
    default_role := 'user';
    default_status := 'pending_verification';
    default_permissions := '{
      "canUseAI": false,
      "canBookTasks": false,
      "canViewCatalog": true,
      "canAccessDecisionCenter": false,
      "canAccessWallet": false,
      "canAccessProviderPortal": false
    }'::jsonb;
  end if;

  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    status,
    permissions,
    created_at,
    updated_at
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    default_role,
    default_status,
    default_permissions,
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fitnesssite: profiles, programs, access grants, RLS
-- Run in Supabase SQL Editor or via CLI after linking project.

create extension if not exists "uuid-ossp";

-- Membership tier: 1 Başlangıç, 2 Gelişim, 3 Premium (etiket / faturalama için)
create type public.user_role as enum ('user', 'admin');
create type public.membership_tier as enum ('1', '2', '3');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role public.user_role not null default 'user',
  membership_tier public.membership_tier,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  cover_image_path text,
  price_label text,
  sort_order int not null default 0,
  published boolean not null default false,
  show_on_home boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Üye alanı: sadece erişim verilen kullanıcılar + admin
create table public.program_contents (
  program_id uuid primary key references public.programs (id) on delete cascade,
  body text,
  video_path text,
  updated_at timestamptz not null default now()
);

create table public.user_program_access (
  user_id uuid not null references public.profiles (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (user_id, program_id)
);

create index programs_published_idx on public.programs (published, sort_order);
create index access_user_idx on public.user_program_access (user_id);

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.program_contents enable row level security;
alter table public.user_program_access enable row level security;

-- Helper: current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- Programs: pazarlama alanı — yayınlanan herkese açık satır başlıkları
create policy "programs_select_published_or_access"
  on public.programs for select
  using (
    public.is_admin()
    or published = true
    or exists (
      select 1 from public.user_program_access a
      where a.program_id = programs.id and a.user_id = auth.uid()
    )
  );

-- İçerik: sadece admin veya erişimi olan üye
create policy "program_contents_select"
  on public.program_contents for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.user_program_access a
      where a.program_id = program_contents.program_id and a.user_id = auth.uid()
    )
  );

create policy "program_contents_insert_admin"
  on public.program_contents for insert
  with check (public.is_admin());

create policy "program_contents_update_admin"
  on public.program_contents for update
  using (public.is_admin());

create policy "program_contents_delete_admin"
  on public.program_contents for delete
  using (public.is_admin());

create policy "programs_insert_admin"
  on public.programs for insert
  with check (public.is_admin());

create policy "programs_update_admin"
  on public.programs for update
  using (public.is_admin());

create policy "programs_delete_admin"
  on public.programs for delete
  using (public.is_admin());

-- Access: users see own; admin all
create policy "access_select_own"
  on public.user_program_access for select
  using (auth.uid() = user_id);

create policy "access_select_admin"
  on public.user_program_access for select
  using (public.is_admin());

create policy "access_write_admin"
  on public.user_program_access for insert
  with check (public.is_admin());

create policy "access_delete_admin"
  on public.user_program_access for delete
  using (public.is_admin());

-- New auth users get profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'::public.user_role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage: supabase/migrations/002_storage_program_media.sql dosyasını bucket oluşturduktan sonra çalıştırın.
--
-- İlk admin hesabı (kayıt olduktan sonra, e-postanızla):
-- update public.profiles set role = 'admin' where email = 'sizin@eposta.com';

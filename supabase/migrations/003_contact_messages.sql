-- Genel iletişim formu mesajları (footer / iletişim sayfası)
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  message text not null,
  kvkk_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  constraint contact_kvkk_required check (kvkk_accepted = true)
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- Ziyaretçi ve üye gönderebilir
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  with check (true);

-- Sadece admin okur (panelde liste ileride eklenebilir)
create policy "contact_messages_select_admin"
  on public.contact_messages for select
  using (public.is_admin());

-- Ana sayfa "Ev antrenman programları" vitrin kartları
create table public.home_packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level_display text not null default '1',
  pill_start text not null,
  pill_access text not null,
  blurb text not null,
  features jsonb not null default '[]'::jsonb,
  price_label text not null,
  cover_image_path text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index home_packages_sort_idx on public.home_packages (published, sort_order);

alter table public.home_packages enable row level security;

create policy "home_packages_select_visible"
  on public.home_packages for select
  using (published = true or public.is_admin());

create policy "home_packages_insert_admin"
  on public.home_packages for insert
  with check (public.is_admin());

create policy "home_packages_update_admin"
  on public.home_packages for update
  using (public.is_admin());

create policy "home_packages_delete_admin"
  on public.home_packages for delete
  using (public.is_admin());

-- Mevcut üç paket (ilk kurulum)
insert into public.home_packages (
  title, level_display, pill_start, pill_access, blurb, features, price_label, sort_order
) values
(
  'Başlangıç Paketi',
  '1',
  'Ödeme sonrası hemen başla',
  '1 yıl erişim',
  '0–2 ay düzenli antrenman deneyimi olanlar için: tüm vücut, temel teknik, seanslar 30–40 dk.',
  '["Tüm vücut çalışması", "Temel hareket tekniği", "Kademeli yük artışı", "12 antrenman × 30–40 dk"]'::jsonb,
  '1.990 ₺',
  0
),
(
  'Güç ve Kuvvet Paketi',
  '2',
  'Ödeme sonrası hemen başla',
  '1 yıl erişim',
  'Orta seviye: 2–6 ay düzenli antrenman veya Başlangıç paketinden sonra.',
  '["Tüm vücut güç odaklı", "Teknik detay", "12 antrenman × 60 dk"]'::jsonb,
  '2.390 ₺',
  1
),
(
  'Sıkılaşma ve Form Paketi',
  '3',
  'Belirlenen tarihte başlangıç',
  '10 hafta erişim',
  '6+ ay düzenli antrenman veya Güç paketinden sonra; salon etkisini evde hedefleyenler.',
  '["Evde salon verimi", "Definasyon odağı", "12 antrenman × 60 dk"]'::jsonb,
  '2.890 ₺',
  2
);

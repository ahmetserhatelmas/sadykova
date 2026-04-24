-- Ana sayfa: üst kategori etiketleri + okul/salon vitrin kartları (ProgramShowcase)

create table public.home_showcase_pills (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index home_showcase_pills_sort_idx
  on public.home_showcase_pills (published, sort_order);

alter table public.home_showcase_pills enable row level security;

create policy "home_showcase_pills_select"
  on public.home_showcase_pills for select
  using (published = true or public.is_admin());

create policy "home_showcase_pills_insert_admin"
  on public.home_showcase_pills for insert
  with check (public.is_admin());

create policy "home_showcase_pills_update_admin"
  on public.home_showcase_pills for update
  using (public.is_admin());

create policy "home_showcase_pills_delete_admin"
  on public.home_showcase_pills for delete
  using (public.is_admin());

create table public.home_showcase_cards (
  id uuid primary key default gen_random_uuid(),
  card_type text not null check (card_type in ('list', 'sections')),
  title text not null,
  price_label text not null,
  cta_label text not null,
  badges jsonb not null default '[]'::jsonb,
  list_heading text,
  list_points jsonb,
  section_blocks jsonb,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index home_showcase_cards_sort_idx
  on public.home_showcase_cards (published, sort_order);

alter table public.home_showcase_cards enable row level security;

create policy "home_showcase_cards_select"
  on public.home_showcase_cards for select
  using (published = true or public.is_admin());

create policy "home_showcase_cards_insert_admin"
  on public.home_showcase_cards for insert
  with check (public.is_admin());

create policy "home_showcase_cards_update_admin"
  on public.home_showcase_cards for update
  using (public.is_admin());

create policy "home_showcase_cards_delete_admin"
  on public.home_showcase_cards for delete
  using (public.is_admin());

insert into public.home_showcase_pills (label, sort_order) values
  ('Güç', 0),
  ('Ev ve salon', 1),
  ('Kütle', 2),
  ('Definasyon', 3),
  ('Yeni başlayanlar', 4),
  ('Salon antrenmanı', 5),
  ('Başlangıç', 6);

insert into public.home_showcase_cards (
  card_type, title, price_label, cta_label, badges, list_heading, list_points, section_blocks, sort_order
) values
(
  'list',
  'RAHAT KİLO VERME VE KÜTLE KAZANIMI OKULU',
  '5.500 ₺',
  'Detayları gör',
  '[{"icon":"play","text":"Mayıs ayında başlangıç"},{"icon":"lock","text":"1 yıl erişim"}]'::jsonb,
  'Program sonuçları:',
  '["Kalori hesaplamayı öğrenirsiniz","Makrolar dengeli beslenme","Kilo verme, alma ve koruma için uygun","Yasaklı besin listesi yok","Uzun vadede formunuzu koruyacak bilgi"]'::jsonb,
  null,
  0
),
(
  'sections',
  'SPOR SALONU PROGRAMLARI',
  '2.390 ₺',
  'Detay ve satın al',
  '[{"icon":"play","text":"Ödeme sonrası hemen başla"},{"icon":"lock","text":"1 yıl erişim"}]'::jsonb,
  null,
  null,
  '[{"title":"Programınıza göre seçin:","items":["Haftada 2 gün tüm vücut","Haftada 3 gün tüm vücut","Haftada 4 gün üst / alt bölüm"]},{"title":"Seviyenize göre seçin:","items":["Yeni başlayanlar","Deneyimliler","Erkek programı"]}]'::jsonb,
  1
);

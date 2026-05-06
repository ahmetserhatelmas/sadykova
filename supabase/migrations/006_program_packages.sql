-- Programları ev paketine bağla; üye paket etiketi (1/2/3) ile eşleşen programlara otomatik erişim (RLS).
alter table public.programs
  add column if not exists home_package_id uuid references public.home_packages (id) on delete set null;

alter table public.programs
  add column if not exists list_group_title text;

create index if not exists programs_home_package_idx
  on public.programs (home_package_id, sort_order);

comment on column public.programs.home_package_id is 'Üyelik seviyesi (membership_tier) bu paketin level_display ile eşleşen kullanıcılara program otomatik açılır.';
comment on column public.programs.list_group_title is 'Üye panelinde programları alt başlık altında gruplamak için (örn. Hafta 1).';

-- RLS: programs — paket eşleşmesi
drop policy if exists "programs_select_published_or_access" on public.programs;

create policy "programs_select_published_or_access"
  on public.programs for select
  using (
    public.is_admin()
    or published = true
    or exists (
      select 1 from public.user_program_access a
      where a.program_id = programs.id and a.user_id = auth.uid()
    )
    or (
      programs.home_package_id is not null
      and exists (
        select 1
        from public.profiles pr
        inner join public.home_packages hp on hp.id = programs.home_package_id
        where pr.id = auth.uid()
          and pr.membership_tier is not null
          and hp.level_display = pr.membership_tier::text
      )
    )
  );

-- RLS: program_contents — aynı paket kuralı
drop policy if exists "program_contents_select" on public.program_contents;

create policy "program_contents_select"
  on public.program_contents for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.user_program_access a
      where a.program_id = program_contents.program_id and a.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.programs p
      inner join public.profiles pr on pr.id = auth.uid()
      inner join public.home_packages hp on hp.id = p.home_package_id
      where p.id = program_contents.program_id
        and p.home_package_id is not null
        and pr.membership_tier is not null
        and hp.level_display = pr.membership_tier::text
    )
  );

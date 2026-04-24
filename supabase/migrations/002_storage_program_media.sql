-- Önce Dashboard → Storage → "program-media" adında public bucket oluşturun.
-- Sonra bu dosyayı çalıştırın.

insert into storage.buckets (id, name, public)
values ('program-media', 'program-media', true)
on conflict (id) do nothing;

create policy "program_media_read"
  on storage.objects for select
  using (bucket_id = 'program-media');

create policy "program_media_write_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'program-media'
    and public.is_admin()
  );

create policy "program_media_update_admin"
  on storage.objects for update
  using (bucket_id = 'program-media' and public.is_admin());

create policy "program_media_delete_admin"
  on storage.objects for delete
  using (bucket_id = 'program-media' and public.is_admin());

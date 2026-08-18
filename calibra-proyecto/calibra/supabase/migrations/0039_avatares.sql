-- ============================================================
-- Prodigia — foto de perfil personalizada vía Supabase Storage (Fase P3)
-- Correr después de 0038_duelos_tiempo_real.sql
-- ============================================================

alter table public.profiles add column avatar_url text;

-- avatar_url es una URL pública de un archivo que el propio usuario ya
-- subió (siempre a su propia carpeta, ver policies de storage.objects
-- abajo) — no hace falta una función security definer para esto, mismo
-- criterio que display_name/meta_xp_diaria en 0035: alcanza con el
-- GRANT de columna.
revoke update on public.profiles from authenticated;
grant update (
  display_name,
  meta_xp_diaria,
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  interes_inicial,
  avatar_url
) on public.profiles to authenticated;

-- Bucket público (las fotos de perfil no son datos sensibles — se ven
-- en ranking, feed, duelos). 2MB de tope, solo imágenes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Cada usuario sube/reemplaza/borra únicamente dentro de una carpeta
-- nombrada con su propio user_id (ej. "avatares/<uuid>/foto.png") —
-- mismo patrón documentado en la guía oficial de Storage de Supabase.
create policy "cada quien sube su propio avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cada quien reemplaza su propio avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cada quien borra su propio avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cualquiera lee avatares (bucket publico)"
  on storage.objects for select
  using (bucket_id = 'avatares');

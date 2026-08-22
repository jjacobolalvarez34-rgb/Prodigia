-- Fase 4 de la tanda de internacionalización: el selector de idioma tiene
-- que persistir entre sesiones y dispositivos, no solo en la cookie del
-- navegador (NEXT_LOCALE, que next-intl ya maneja solo) — por eso se
-- guarda también en el perfil. El middleware usa esto en la primera visita
-- de un dispositivo nuevo (sin cookie todavía) para no perder la
-- preferencia ya elegida en otro dispositivo.
alter table public.profiles
  add column if not exists idioma text not null default 'es'
    check (idioma in ('es', 'en'));

create or replace function public.elegir_idioma(p_idioma text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_idioma not in ('es', 'en') then
    raise exception 'idioma inválido: %', p_idioma;
  end if;

  update public.profiles
  set idioma = p_idioma
  where id = auth.uid();
end;
$$;

grant execute on function public.elegir_idioma(text) to authenticated;

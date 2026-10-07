-- ============================================================
-- Prodigia — Aceptación de Términos y Política de privacidad
-- (pedido del usuario, 2026-10-06, para publicar en Google Play).
--
-- Hasta ahora nadie aceptaba explícitamente los Términos: ni al registrarse
-- en la web ni al instalar la app. Desde esta migración cada cuenta guarda
-- QUÉ versión aceptó y CUÁNDO. La web la pide al registrarse (casilla
-- obligatoria) y a las cuentas que ya existían les pide aceptarla una vez;
-- la app la pide al abrirla por primera vez, antes de entrar.
-- La versión vigente vive en src/lib/legal/terminos.ts (VERSION_TERMINOS).
-- Requiere 0256. Solo agrega columnas y una función.
-- ============================================================

alter table public.profiles add column if not exists terminos_aceptados_version text;
alter table public.profiles add column if not exists terminos_aceptados_en timestamptz;

-- Las columnas NO se pueden escribir desde el cliente (el GRANT UPDATE de
-- profiles es por columna y no las incluye): solo esta función las toca.
create or replace function public.aceptar_terminos(p_version text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_version is null or char_length(p_version) not between 1 and 40 then
    raise exception 'versión inválida';
  end if;
  update public.profiles
  set terminos_aceptados_version = p_version,
      terminos_aceptados_en = now()
  where id = v_user
    and (terminos_aceptados_version is distinct from p_version);
end;
$$;
grant execute on function public.aceptar_terminos(text) to authenticated;

notify pgrst, 'reload schema';

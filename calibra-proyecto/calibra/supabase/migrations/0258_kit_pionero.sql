-- ============================================================
-- Prodigia — «Kit del Pionero»: regalo por usar la app (aprobado por el
-- usuario el 2026-10-07, docs/PLAN_PRIMERA_VEZ_APP.md §4).
--
-- Una sola vez por cuenta, la primera vez que inicia sesión en la app
-- (también quien ya jugaba en la web):
--   - 1.000 Chispas;
--   - el marco «Pionero» (exclusivo: no se vende ni sale en cápsulas), que
--     queda puesto si no tenía ninguno;
--   - el título «Pionero»;
--   - 1 cápsula.
-- La app llama a reclamar_kit_app() y muestra la animación solo si devuelve
-- reclamado = true (si ya lo tenía, devuelve false y no pasa nada).
-- Requiere 0257. Solo agrega una columna, amplía un check y crea una función.
-- ============================================================

alter table public.profiles add column if not exists kit_app_reclamado_en timestamptz;

-- Igual que 0248, más 'pionero'.
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (
    'ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio',
    'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia',
    'neon_violeta', 'neon_cian', 'neon_magenta',
    'temporada_aurora', 'temporada_brasas', 'temporada_escarcha', 'temporada_cosmos',
    'coleccion_numeria', 'coleccion_enigmia', 'coleccion_geografia', 'coleccion_quimia', 'coleccion_anatomia', 'coleccion_melodia',
    'coleccion_trigonometria', 'coleccion_historia', 'coleccion_calculia', 'coleccion_circuitia', 'coleccion_estadistica', 'coleccion_naipia', 'coleccion_codia',
    'pionero'
  ));

create or replace function public.reclamar_kit_app()
returns table (reclamado boolean, chispas integer, marco_puesto boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_marco_previo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select coalesce(pr.marco_perfil, 'ninguno') into v_marco_previo from public.profiles pr where pr.id = v_user;

  -- El "where ... is null" hace que reclamar dos veces a la vez no dé doble premio.
  update public.profiles as pr
  set kit_app_reclamado_en = now(),
      puntos_total = coalesce(pr.puntos_total, 0) + 1000,
      marcos_desbloqueados = case
        when 'pionero' = any(pr.marcos_desbloqueados) then pr.marcos_desbloqueados
        else array_append(pr.marcos_desbloqueados, 'pionero')
      end,
      marco_perfil = case when coalesce(pr.marco_perfil, 'ninguno') = 'ninguno' then 'pionero' else pr.marco_perfil end
  where pr.id = v_user and pr.kit_app_reclamado_en is null;

  if not found then
    return query select false, 0, false;
    return;
  end if;

  perform public.desbloquear_titulo(v_user, 'pionero', 'Pionero', 'app');

  insert into public.capsulas_usuario (user_id, tipo, origen)
  values (v_user, 'diaria', 'kit_app')
  on conflict (user_id, origen) do nothing;

  return query select true, 1000, v_marco_previo = 'ninguno';
end;
$$;

revoke execute on function public.reclamar_kit_app() from public, anon;
grant execute on function public.reclamar_kit_app() to authenticated;

notify pgrst, 'reload schema';

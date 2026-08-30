-- ============================================================
-- Prodigia — Grupo B, Fase 1+2: 6 marcos de perfil temáticos, uno por
-- mundo (assets reales del usuario, public/marcos/marco_<mundo>.png —
-- anillo circular transparente, se overlayea sobre el avatar).
-- Correr después de 0103_fix_revoke_public_desbloquear_titulo.sql.
--
-- Fase 1 — criterio de desbloqueo (comprable, tiene que sentirse
-- relacionado al mundo que representa, no un ítem más): comprable con
-- Chispas SOLO si ya alcanzaste nivel_mundo >= 40 en ESE mundo (escala
-- 1-100 de registrar_puntos_mundo, ver 0098_paridad_mundos_fixes.sql —
-- 40 es progreso real, no arrancar de cero, pero lejos de exigir
-- dominio total). Precio 2400 Chispas para los 6 — un escalón por
-- encima de marco_platino (2200), por debajo de marco_diamante (3200):
-- son exclusivos temáticos, no el tope de prestigio (ese sigue siendo
-- marco_prodigio).
--
-- Fase 2 — recompensa por completar el mundo: el logro "Maestro de
-- <Mundo>" (titulos/catalogo.ts, criterio `mundo_completado` — nivel
-- 10 de calibración en TODOS los temas del mundo, ya evaluado en
-- src/lib/titulos/verificar.ts) ahora ADEMÁS otorga el marco temático
-- de ese mundo gratis, automático, sin importar si ya se había
-- comprado (idempotente). Efecto retroactivo: el DO block de abajo
-- revisa a todos los usuarios existentes contra el mismo criterio
-- exacto que ya usa "Maestro de X" (mismos tipos/umbrales que
-- verificar.ts) y se lo otorga ya mismo si corresponde — igual
-- filosofía que el retroactivo de 0062_lecciones_por_mundo_y_mundo_
-- completado.sql, extendido acá a los 6 mundos (0062 solo cubría
-- numeria/geografia/quimia/enigmia — anatomia y melodia nunca
-- existían todavía en esa fecha).
-- ============================================================

-- ---------- 1) profiles.marco_perfil: permitir los 6 slugs nuevos ----------
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (
    'ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio',
    'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia'
  ));

-- ---------- 2) comprar_item_tienda: agrega los 6 items marco_<mundo> ----------
create or replace function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  fuentes_desbloqueadas text[],
  marcos_desbloqueados text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_costo_base integer;
  v_mundo text;
  v_nivel_mundo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_costo_base := case p_item
    when 'escudo' then 350
    when 'congelamiento' then 450
    when 'boost' then 600
    when 'fuente_mono' then 1000
    when 'fuente_serif' then 1400
    when 'fuente_manuscrita' then 5000
    when 'fuente_impacto' then 1200
    when 'fuente_script' then 1800
    when 'fuente_futurista' then 2500
    when 'marco_bronce' then 1000
    when 'marco_plata' then 1300
    when 'marco_oro' then 1700
    when 'marco_platino' then 2200
    when 'marco_diamante' then 3200
    when 'marco_prodigio' then 5000
    when 'marco_numeria' then 2400
    when 'marco_enigmia' then 2400
    when 'marco_geografia' then 2400
    when 'marco_quimia' then 2400
    when 'marco_anatomia' then 2400
    when 'marco_melodia' then 2400
    else null
  end;

  if v_costo_base is null then
    raise exception 'item invalido';
  end if;
  if p_costo < ceil(v_costo_base * 0.5) then
    raise exception 'precio invalido';
  end if;

  -- Marcos de mundo (a diferencia de los de rango): exigen progreso
  -- real en ESE mundo antes de poder comprarse, no solo Chispas — se
  -- sienten relacionados al mundo, no un ítem más de la vidriera.
  if p_item in ('marco_numeria', 'marco_enigmia', 'marco_geografia', 'marco_quimia', 'marco_anatomia', 'marco_melodia') then
    v_mundo := replace(p_item, 'marco_', '');
    select w.nivel_mundo into v_nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = v_mundo;
    if coalesce(v_nivel_mundo, 0) < 40 then
      raise exception 'todavia no alcanzaste suficiente nivel en % para desbloquear este marco', v_mundo;
    end if;
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_costo then
    raise exception 'te faltan Chispas para comprar esto';
  end if;

  if p_item = 'escudo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        escudos_extra_pendientes = pr.escudos_extra_pendientes + 1
    where pr.id = v_user;
  elsif p_item = 'congelamiento' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        congelamientos_disponibles = pr.congelamientos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'boost' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        boost_multiplicador_pendiente = 1.5
    where pr.id = v_user;
  elsif p_item like 'marco_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = case
          when (replace(p_item, 'marco_', '')) = any(pr.marcos_desbloqueados)
            then pr.marcos_desbloqueados
          else array_append(pr.marcos_desbloqueados, replace(p_item, 'marco_', ''))
        end
    where pr.id = v_user;
  else
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fuentes_desbloqueadas = case
          when (replace(p_item, 'fuente_', '')) = any(pr.fuentes_desbloqueadas)
            then pr.fuentes_desbloqueadas
          else array_append(pr.fuentes_desbloqueadas, replace(p_item, 'fuente_', ''))
        end
    where pr.id = v_user;
  end if;

  return query
    select pr.puntos_total, pr.escudos_extra_pendientes, pr.congelamientos_disponibles,
      pr.boost_multiplicador_pendiente, pr.fuentes_desbloqueadas, pr.marcos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;

-- ---------- 3) otorgar_marco_mundo: grant idempotente (interno + retroactivo) ----------
-- p_user_id explícito porque el DO block de abajo (Fase 2, retroactivo)
-- necesita otorgar en nombre de CUALQUIER usuario, no solo auth.uid() —
-- por eso NO es el RPC que llama el cliente (ver el wrapper "_propio"
-- abajo, que es el único grantable).
create function public.otorgar_marco_mundo(p_user_id uuid, p_mundo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles as pr
  set marcos_desbloqueados = case
        when p_mundo = any(pr.marcos_desbloqueados) then pr.marcos_desbloqueados
        else array_append(pr.marcos_desbloqueados, p_mundo)
      end
  where pr.id = p_user_id;
end;
$$;

-- Lección de la migración 0103 (el mismo gotcha que rompió el fix de
-- desbloquear_titulo): Postgres le da EXECUTE a la pseudo-role PUBLIC
-- en cualquier función nueva por default, en el momento de crearla —
-- no otorgárselo a mano a "authenticated" NO alcanza, hay que
-- revocárselo explícito a PUBLIC o cualquier rol lo hereda igual.
revoke execute on function public.otorgar_marco_mundo(uuid, text) from public;

create function public.otorgar_marco_mundo_propio(p_mundo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;
  perform public.otorgar_marco_mundo(auth.uid(), p_mundo);
end;
$$;

grant execute on function public.otorgar_marco_mundo_propio(text) to authenticated;

-- ---------- 4) Fase 2: efecto retroactivo — otorgar a quien ya cumple hoy ----------
-- Mismos criterios exactos que "mundoCompletado" en
-- src/lib/titulos/verificar.ts (que a su vez alimenta el título
-- "Maestro de X"). Corre una sola vez, en el momento en que esta
-- migración se aplica — si nadie califica todavía, no hace nada.
do $$
declare
  v_user record;
  v_completo boolean;
begin
  for v_user in select id from public.profiles loop
    select (count(*) filter (where nivel >= 10) = 8) into v_completo
    from public.skill_levels
    where user_id = v_user.id and problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra');
    if v_completo then perform public.otorgar_marco_mundo(v_user.id, 'numeria'); end if;

    select (nivel >= 10) into v_completo from public.skill_levels where user_id = v_user.id and problem_type = 'geografia';
    if coalesce(v_completo, false) then perform public.otorgar_marco_mundo(v_user.id, 'geografia'); end if;

    select (count(*) filter (where nivel >= 10) = 3) into v_completo
    from public.skill_levels
    where user_id = v_user.id and problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla');
    if v_completo then perform public.otorgar_marco_mundo(v_user.id, 'quimia'); end if;

    select (nivel >= 10) into v_completo from public.logic_skill_levels where user_id = v_user.id;
    if coalesce(v_completo, false) then perform public.otorgar_marco_mundo(v_user.id, 'enigmia'); end if;

    select (count(*) filter (where nivel >= 10) = 4) into v_completo
    from public.skill_levels
    where user_id = v_user.id and problem_type in ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso');
    if v_completo then perform public.otorgar_marco_mundo(v_user.id, 'anatomia'); end if;

    select (count(*) filter (where nivel >= 10) = 6) into v_completo
    from public.skill_levels
    where user_id = v_user.id and problem_type in ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto');
    if v_completo then perform public.otorgar_marco_mundo(v_user.id, 'melodia'); end if;
  end loop;
end $$;

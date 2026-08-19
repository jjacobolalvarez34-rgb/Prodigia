-- ============================================================
-- Prodigia — rediseño de la Tienda (Fases 2-7 de la tanda de mercado)
-- Correr después de 0053_problemas_personalizados.sql
--
-- Cubre, en una sola migración porque todas tocan `comprar_item_tienda`
-- y/o `profiles` y conviene dejarlas consistentes entre sí:
--   Fase 2 — precios revisados
--   Fase 3 — bug real de "doble o nada" (ver diagnóstico abajo)
--   Fase 4 — tope de apuesta + toggle para ocultarla
--   Fase 5 — saca "color del dial", agrega "fuentes" (tipografías)
--   Fase 6 — cambiar de nombre pasa a costar Puntos (Chispas)
--   Fase 7 — marcos de perfil: de 2 (plata/oro) a los 6 rangos reales
-- ============================================================

-- ------------------------------------------------------------
-- Fase 2 — economía: cuánto rinde una partida típica
--
-- src/lib/practica/formulas.ts: XP = 10 base × multiplicador_nivel ×
-- bonus_velocidad, solo si es correcto. multiplicador_nivel va de 1.0x
-- (nivel 1) a 2.35x (nivel 10); bonus_velocidad de 1.0x a 1.5x. Un
-- sprint son 10 problemas (TOTAL_PROBLEMAS/TOTAL_PREGUNTAS en todos los
-- runners). Para un jugador típico (nivel de calibración ~3-5, ritmo
-- moderado, ~70% de aciertos — la calibración adaptativa apunta
-- justamente a mantener la dificultad ahí) eso da:
--   multiplicador ~1.3-1.6, bonus ~1.15 → ~14-18 Puntos por acierto
--   × ~7 aciertos de 10 ≈ 100-130 Puntos por partida completa
-- Se usa 120 Puntos/partida como unidad de referencia para los precios
-- de abajo. Objetivo: ítems funcionales baratos (fracción de partida),
-- cosméticos medios (~1 partida), cosméticos de prestigio (~2-3
-- partidas como techo, nunca más).
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- Fase 3 — diagnóstico del botón de "doble o nada" roto
--
-- apostar_doble_o_nada (0025) exige `count(*) from public.attempts
-- >= 20` antes de dejar apostar. El problema: attempts SOLO recibe
-- filas de Numeria/Fracciones/Decimales/Potencias/Álgebra/Geografía
-- (ver /api/attempts). Enigmia escribe en una tabla aparte
-- (logic_attempts, 0015) y NINGÚN duelo — ni casual ni clasificatorio
-- — toca "attempts" nunca (van directo por registrar_resultado_duelo a
-- duels/duel_results). Una cuenta que jugó activamente pero sobre todo
-- duelos (que fue gran parte de esta sesión) o Enigmia puede tener 0
-- filas en "attempts" y quedar bloqueada para siempre con un error que,
-- además, se renderiza hasta abajo de una pantalla larga — en la
-- práctica, "aprieto apostar y no pasa nada". No es un problema de
-- cableado de UI: el gate de elegibilidad subcuenta actividad real. El
-- fix suma logic_attempts (Enigmia) y duel_results (cualquier duelo,
-- usando su precisión ya guardada por duelo) a la cuenta y a la base
-- histórica de precisión. Además: apostar_doble_o_nada nunca tuvo techo
-- de monto (el array de montos del cliente es solo UI, nada lo hacía
-- cumplir server-side) — se agrega acá también (Fase 4).
-- ------------------------------------------------------------

alter table public.profiles
  add column if not exists ocultar_doble_o_nada boolean not null default false,
  add column if not exists fuente_nombre text not null default 'default',
  add column if not exists fuentes_desbloqueadas text[] not null default array['default'];

alter table public.profiles
  add constraint profiles_fuente_nombre_check
  check (fuente_nombre in ('default', 'mono', 'serif', 'manuscrita'));

-- Fase 7: 6 rangos reales en vez de plata/oro sueltos — mismos slugs
-- que RANGOS_ELO (src/types/database.ts), así "marco_perfil" y "rango
-- de duelos" comparten exactamente el mismo vocabulario.
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in ('ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio'));

-- Fase 6: el cambio de nombre pasa a costar Puntos — display_name deja
-- de ser una columna de escritura libre. El primer nombre (onboarding,
-- display_name todavía null) sigue siendo gratis: lo resuelve la misma
-- función de abajo, no un camino aparte.
revoke update on public.profiles from authenticated;
grant update (
  meta_xp_diaria,
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  interes_inicial,
  avatar_url,
  ocultar_doble_o_nada
) on public.profiles to authenticated;

create or replace function public.cambiar_nombre_usuario(p_nombre text)
returns table (display_name text, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_nombre text := trim(p_nombre);
  v_actual text;
  v_saldo integer;
  v_costo constant integer := 100;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if length(v_nombre) < 2 or length(v_nombre) > 40 then
    raise exception 'el nombre tiene que tener entre 2 y 40 caracteres';
  end if;

  select p.display_name, p.puntos_total into v_actual, v_saldo
  from public.profiles p where p.id = v_user;

  -- Primer nombre (onboarding) gratis; a partir de ahí, cuesta.
  if v_actual is not null then
    if v_saldo < v_costo then
      raise exception 'te faltan Chispas — cambiar de nombre cuesta % Chispas', v_costo;
    end if;
  end if;

  begin
    update public.profiles as pr
    set display_name = v_nombre,
        puntos_total = case when v_actual is not null then pr.puntos_total - v_costo else pr.puntos_total end
    where pr.id = v_user;
  exception
    when unique_violation then
      raise exception 'ese nombre ya lo está usando otra cuenta';
  end;

  return query select pr.display_name, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.cambiar_nombre_usuario(text) to authenticated;

-- ---------- Fase 5: sacar elegir_color_dial (ítem descontinuado) ----------
-- Se deja la columna color_dial/colores_dial_desbloqueados en la tabla
-- (dato histórico inofensivo, nada la vuelve a escribir) — solo se
-- retira la función de compra/selección y, más abajo, el ítem del
-- catálogo. elegir_fuente_nombre la reemplaza como cosmético del dial.
drop function if exists public.elegir_color_dial(text);

create function public.elegir_fuente_nombre(p_fuente text)
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
  if not exists (
    select 1 from public.profiles where id = v_user and p_fuente = any(fuentes_desbloqueadas)
  ) then
    raise exception 'fuente no desbloqueada';
  end if;
  update public.profiles set fuente_nombre = p_fuente where id = v_user;
end;
$$;

grant execute on function public.elegir_fuente_nombre(text) to authenticated;

-- ---------- comprar_item_tienda: catálogo y precios nuevos ----------
drop function if exists public.comprar_item_tienda(text, integer);

create function public.comprar_item_tienda(p_item text, p_costo integer)
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
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_item not in (
    'escudo', 'congelamiento', 'boost',
    'fuente_mono', 'fuente_serif', 'fuente_manuscrita',
    'marco_bronce', 'marco_plata', 'marco_oro', 'marco_platino', 'marco_diamante', 'marco_prodigio'
  ) then
    raise exception 'item invalido';
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

-- ---------- Fase 3 (fix real) + Fase 4 (tope de apuesta) ----------
create or replace function public.apostar_doble_o_nada(p_monto integer)
returns table (umbral numeric, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuesta_previa integer;
  v_total_simple bigint;
  v_correctos_simple bigint;
  v_duelos bigint;
  v_actividad bigint;
  v_umbral numeric;
  v_apuesta_maxima constant integer := 200;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto <= 0 then
    raise exception 'monto invalido';
  end if;
  if p_monto > v_apuesta_maxima then
    raise exception 'la apuesta máxima es % Chispas', v_apuesta_maxima;
  end if;

  select puntos_total, apuesta_monto into v_saldo, v_apuesta_previa
  from public.profiles where id = v_user;

  if v_apuesta_previa > 0 then
    raise exception 'ya tenes una apuesta activa';
  end if;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  -- Actividad real = intentos sueltos (Numeria/Fracciones/Decimales/
  -- Potencias/Álgebra/Geografía + Enigmia) + duelos jugados (cada duelo
  -- pesa como ~10 problemas, la duración típica de un sprint).
  select count(*), count(*) filter (where correct)
    into v_total_simple, v_correctos_simple
  from (
    select correct from public.attempts where user_id = v_user
    union all
    select correct from public.logic_attempts where user_id = v_user
  ) t;

  select count(*) into v_duelos from public.duel_results where user_id = v_user;

  v_actividad := v_total_simple + v_duelos * 10;

  if v_actividad < 20 then
    raise exception 'jugá un poco más antes de poder apostar';
  end if;

  if v_total_simple >= 5 then
    v_umbral := v_correctos_simple::numeric / v_total_simple;
  elsif v_duelos > 0 then
    select avg(precision) into v_umbral from public.duel_results where user_id = v_user;
  else
    v_umbral := 0.7;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - p_monto,
      apuesta_monto = p_monto,
      apuesta_umbral = v_umbral
  where pr.id = v_user;

  return query select v_umbral, (select puntos_total from public.profiles where id = v_user);
end;
$$;

grant execute on function public.apostar_doble_o_nada(integer) to authenticated;

-- ---------- obtener_perfil_publico: suma fuente_nombre ----------
drop function if exists public.obtener_perfil_publico(uuid);

create function public.obtener_perfil_publico(p_user_id uuid)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  marco_perfil text,
  fuente_nombre text,
  elo_rating integer,
  puntos_total integer,
  created_at timestamptz,
  titulo_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;

  return query
    select p.id, p.display_name, p.avatar_url, p.marco_perfil, p.fuente_nombre,
      p.elo_rating, p.puntos_total, p.created_at, public.titulo_nombre_de(p.id)
    from public.profiles p
    where p.id = p_user_id;
end;
$$;

grant execute on function public.obtener_perfil_publico(uuid) to authenticated;

-- ---------- Fase 5: fuente_nombre también en el ranking (0049) ----------
drop function if exists public.ranking_semanal_filtrado(text, boolean);

create function public.ranking_semanal_filtrado(p_mundo text default null, p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia') then
    raise exception 'mundo invalido';
  end if;

  return query
    with datos as (
      select
        p.id as uid,
        p.display_name as dn,
        (case
          when p_mundo is null then coalesce((
            select sum(dp.xp_ganado) from public.daily_progress dp
            where dp.user_id = p.id and dp.fecha >= date_trunc('week', current_date)::date and dp.fecha <= current_date
          ), 0)
          when p_mundo = 'enigmia' then coalesce((
            select sum(la.xp) from public.logic_attempts la
            where la.user_id = p.id and la.created_at >= date_trunc('week', current_date)
          ), 0)
          when p_mundo = 'geografia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date) and a.problem_type = 'geografia'
          ), 0)
          else coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra')
          ), 0)
        end)::bigint as xp,
        p.avatar_url as av,
        p.elo_rating as elo,
        p.titulo_activo as ta,
        p.fuente_nombre as fn
      from public.profiles p
      join auth.users u on u.id = p.id
      where coalesce(u.is_anonymous, false) = false
        and (
          not p_solo_amigos
          or p.id = v_caller
          or exists (
            select 1 from public.friendships f
            where f.estado = 'aceptada'
              and ((f.user_id = v_caller and f.friend_id = p.id) or (f.friend_id = v_caller and f.user_id = p.id))
          )
        )
    )
    select d.uid, d.dn, d.xp, d.av, d.elo, d.ta, public.titulo_nombre_de(d.uid), d.fn
    from datos d
    where d.xp > 0
    order by d.xp desc;
end;
$$;

grant execute on function public.ranking_semanal_filtrado(text, boolean) to authenticated;

-- ============================================================
-- Prodigia — Niveles de cuenta recalibrados + recompensa por
-- subir de nivel (T5 + T6, 2026-09-08). Correr después de
-- 0117 (tanda del otro agente) — 0118 es el número libre.
--
-- 1) CURVA (T5): la de 0070 (`floor(100 * power(n, 1.6))`, XP
--    acumulado) hace que pasar de nivel cueste casi lo mismo en un
--    rango ancho: marginal ≈203 en el nivel 2, ≈763 en el 13, ≈828
--    en el 15, ≈980 en el 20. Por eso "nivelar se siente plano y
--    trivial" (el "~816 constante" que reportó el PO). Se reemplaza
--    por una escalera por tramos, costo marginal CREciente y con
--    COTA superior: primeros niveles regalados, medios exigentes,
--    altos valiosos y nunca imposibles.
--
--    xp_requerido_nivel_cuenta(n) = XP ACUMULADO para ALCANZAR n.
--    Costo marginal de cruzar de k-1 a k:
--      k=2: 200 · k=3..5: 300 · k=6..10: 550 · k=11..15: 900
--      k=16..20: 1400 · k=21..30: 1900 · k>=31: 2400 (cota)
--    Referencias: nivel 5 = 1100 XP (≈ 9 partidas típicas, rankeds
--    siguen siendo de las primeras semanas), nivel 15 = 8350,
--    nivel 30 = 34350, nivel 50 = 82350 (≈ 20 partidas/último
--    nivel, alcanzable, nunca imposible).
--
-- 2) RECOMPENSA (T6): la vieja (`50 * nivel`, 0070) era chica y
--    plana. La nueva recompensa_nivel_cuenta(n) = 50*n + 250
--    arranca en 300 (nivel 1), llega a 1000 en el nivel 15 (el
--    número que pidió el PO, pero solo cuando el nivel lo justifica)
--    y sigue escalando hasta 2750 en el 50. Siempre queda dentro de
--    ~0.5x-1.15x del costo marginal del nivel alcanzado: no regala
--    más de un nivel de grind y no infla la economía por subir
--    rápido en niveles baratos. Se paga SOLO en la transición
--    (misma branch `v_subio` de 0070/0115), el bonus NO toca
--    xp_historico_total (no se retroalimenta → sin duplicados ni
--    inflación compuesta) y los niveles viejos recalibrados jamás
--    re-pagan (solo se sube, nunca se baja ni se recompensa de nuevo
--    a nadie).
--
-- Sin cambios destructivos ni de datos: nivel_cuenta/xp_historico_
-- total siguen como están (grandfathering — a nadie se le baja el
-- nivel); la próxima transición ya usará la curva y la recompensa
-- nuevas. S0/S1 (registrar_xp_diario/registrar_puntos_mundo) y la
-- familia de la tienda NO se tocan.
-- ============================================================

-- ---------- Costo marginal de cruzar al nivel k (de k-1 a k) ----------
-- Helper único, fuente de la verdad de la curva. Se le da grant a
-- authenticated por la misma razón que 0070 se lo dio a
-- xp_requerido_nivel_cuenta: la curva de nivel no es secreto, y
-- xp_requerido_nivel_cuenta (security invoker, llamada desde el
-- cliente) la necesita para poder sumarla.
create or replace function public.costo_marginal_nivel_cuenta(p_nivel integer)
returns integer
language sql
immutable
as $$
  select case
    when p_nivel <= 2 then 200
    when p_nivel <= 5 then 300
    when p_nivel <= 10 then 550
    when p_nivel <= 15 then 900
    when p_nivel <= 20 then 1400
    when p_nivel <= 30 then 1900
    else 2400
  end;
$$;

grant execute on function public.costo_marginal_nivel_cuenta(integer) to authenticated;

-- ---------- 1) Curva nueva: XP acumulado para ALCANZAR nivel n ----------
-- Misma firma y semántica que la de 0070 (bigint acumulado, no
-- costo de un nivel a otro) — /perfil y los scripts que la usan
-- siguen funcionando sin cambios, solo el número cambia.
create or replace function public.xp_requerido_nivel_cuenta(p_nivel integer)
returns bigint
language sql
immutable
as $$
  select coalesce((
    select sum(public.costo_marginal_nivel_cuenta(k)::bigint)
    from generate_series(2, greatest(coalesce(p_nivel, 1), 1)) as k
  ), 0)::bigint;
$$;

-- ---------- 1b) nivel_desde_xp_cuenta: mismatch con la curva nueva ----------
-- El loop viejo (0070) comparaba contra xp_requerido(v+1) y quedaba
-- O(n^2) re-sumando la curva en cada iteración. Ahora consume el
-- costo marginal directo: mismo resultado, una sola pasada.
create or replace function public.nivel_desde_xp_cuenta(p_xp bigint)
returns integer
language plpgsql
immutable
as $$
declare
  v_nivel integer := 1;
  v_restante bigint := greatest(coalesce(p_xp, 0), 0);
begin
  while public.costo_marginal_nivel_cuenta(v_nivel + 1) <= v_restante loop
    v_restante := v_restante - public.costo_marginal_nivel_cuenta(v_nivel + 1);
    v_nivel := v_nivel + 1;
  end loop;
  return v_nivel;
end;
$$;

-- ---------- 2) Recompensa por subir de nivel ----------
-- 50*n + 250 → 300 (nivel 1) ... 1000 (nivel 15) ... 2750 (nivel 50).
create or replace function public.recompensa_nivel_cuenta(p_nivel integer)
returns integer
language sql
immutable
as $$
  select (50 * greatest(coalesce(p_nivel, 1), 1)) + 250;
$$;

-- ---------- 2b) acreditar_chispas: paga la recompensa nueva ----------
-- Misma función que quedó en 0115 (security definer, set search_path,
-- guard `p_user_id is distinct from auth.uid()` y SIN grant al
-- cliente — el revoke de 0115 se conserva porque create or replace
-- no re-otorga permisos). Único cambio: el bonus usa
-- recompensa_nivel_cuenta() en vez de `50 * v_nivel_nuevo`. La
-- rama `if v_nivel_nuevo > v_nivel_anterior` ya garantiza que el
-- pago solo se dispara en la TRANSICIÓN de nivel, nunca en un
-- recálculo de niveles viejos.
create or replace function public.acreditar_chispas(p_user_id uuid, p_monto integer)
returns table (nivel_subio boolean, nivel_nuevo integer, bonus_nivel integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clan_id uuid;
  v_nivel_anterior integer;
  v_xp_nuevo bigint;
  v_nivel_nuevo integer;
  v_bonus integer := 0;
  v_subio boolean := false;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'no autorizado';
  end if;

  update public.profiles set puntos_total = puntos_total + p_monto where id = p_user_id;

  if p_monto > 0 then
    select nivel_cuenta into v_nivel_anterior from public.profiles where id = p_user_id;

    update public.profiles set xp_historico_total = xp_historico_total + p_monto
      where id = p_user_id
      returning xp_historico_total into v_xp_nuevo;

    v_nivel_nuevo := public.nivel_desde_xp_cuenta(v_xp_nuevo);

    if v_nivel_nuevo > v_nivel_anterior then
      v_subio := true;
      v_bonus := public.recompensa_nivel_cuenta(v_nivel_nuevo);
      update public.profiles set nivel_cuenta = v_nivel_nuevo, puntos_total = puntos_total + v_bonus
        where id = p_user_id;
    end if;

    select clan_id into v_clan_id from public.clan_membresias where user_id = p_user_id;
    if v_clan_id is not null then
      update public.clan_membresias set xp_aportado = xp_aportado + p_monto where user_id = p_user_id;
      update public.clanes set xp_acumulado_historico = xp_acumulado_historico + p_monto where id = v_clan_id;
    end if;
  end if;

  return query select v_subio, coalesce(v_nivel_nuevo, v_nivel_anterior), v_bonus;
end;
$$;
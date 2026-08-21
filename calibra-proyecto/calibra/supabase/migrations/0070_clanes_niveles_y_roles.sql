-- ============================================================
-- Prodigia — Clanes: Fases 2-9 de la tanda "bugs y sistemas
-- faltantes" (Fase 1, el bug de mi_clan(), ya se corrigió en
-- 0069_clanes_fixes.sql — correr ese antes que este).
-- Correr después de 0069_clanes_fixes.sql
-- ============================================================

-- ---------- Fase 9 (parte de datos): meta diaria fija en 500 ----------
alter table public.profiles alter column meta_xp_diaria set default 500;
update public.profiles set meta_xp_diaria = 500 where meta_xp_diaria <> 500;
-- Ya no es editable por el usuario (Fase 9) — se saca del grant de
-- columnas actualizables. Mismo criterio que 0056: re-declarar la
-- lista completa vigente, no solo la columna que cambia.
revoke update on public.profiles from authenticated;
grant update (
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  onboarding_quimia_completado,
  interes_inicial,
  avatar_url,
  ocultar_doble_o_nada
) on public.profiles to authenticated;

-- ---------- Fase 4: nivel de cuenta ----------
alter table public.profiles add column if not exists xp_historico_total bigint not null default 0;
alter table public.profiles add column if not exists nivel_cuenta integer not null default 1;

-- Curva RPG sin techo: XP acumulado necesario para ALCANZAR el nivel N
-- (no el costo de un nivel a otro, el umbral acumulado). Exponente
-- 1.6: cada nivel pide notablemente más que el anterior, sin
-- estancarse ni volverse absurdo demasiado rápido.
create or replace function public.xp_requerido_nivel_cuenta(p_nivel integer)
returns bigint
language sql
as $$
  select floor(100 * power(greatest(p_nivel, 1), 1.6))::bigint;
$$;

create or replace function public.nivel_desde_xp_cuenta(p_xp bigint)
returns integer
language plpgsql
as $$
declare
  v_nivel integer := 1;
begin
  while public.xp_requerido_nivel_cuenta(v_nivel + 1) <= p_xp loop
    v_nivel := v_nivel + 1;
  end loop;
  return v_nivel;
end;
$$;

-- Se llama directo desde /perfil (barra de progreso al nivel
-- siguiente) — necesita grant explícito, no solo uso interno.
grant execute on function public.xp_requerido_nivel_cuenta(integer) to authenticated;

-- ---------- Fase 5: nivel de clan, misma curva, mucho más lenta ----------
-- Multiplicador base 40x más alto que el de cuenta (2000 vs 50, ver
-- más abajo el nivel de cuenta también recalibrado) y exponente más
-- alto (1.9 vs 1.6) — un clan entero tiene que juntar mucho más que
-- una sola cuenta para el mismo nivel, a propósito: "logro colectivo
-- de largo plazo", no un nivel de cuenta con más ceros.
create or replace function public.xp_requerido_nivel_clan(p_nivel integer)
returns bigint
language sql
as $$
  select floor(4000 * power(greatest(p_nivel, 1), 1.9))::bigint;
$$;

create or replace function public.nivel_desde_xp_clan(p_xp bigint)
returns integer
language plpgsql
as $$
declare
  v_nivel integer := 1;
begin
  while public.xp_requerido_nivel_clan(v_nivel + 1) <= p_xp loop
    v_nivel := v_nivel + 1;
  end loop;
  return v_nivel;
end;
$$;

alter table public.clanes add column if not exists xp_acumulado_historico bigint not null default 0;
alter table public.clan_membresias add column if not exists xp_aportado bigint not null default 0;

-- nivel_clan() pasa de "suma de puntos_total de miembros actuales" (un
-- proxy raro que además se perdía al irse un miembro) a la curva de
-- arriba sobre xp_acumulado_historico (Fase 3: nunca baja, ni se
-- pierde cuando alguien se va del clan).
create or replace function public.nivel_clan(p_clan_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select public.nivel_desde_xp_clan(coalesce((select xp_acumulado_historico from public.clanes where id = p_clan_id), 0));
$$;

-- ---------- Fase 3+4: acreditar Chispas en un solo lugar — balance
-- gastable + acumulado histórico de cuenta (nunca baja) + acumulado
-- del clan activo del usuario en ESE momento (nunca baja tampoco,
-- incluso si se va del clan después) ----------
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
  update public.profiles set puntos_total = puntos_total + p_monto where id = p_user_id;

  -- Solo las ganancias reales (nunca los descuentos de tienda/apuestas,
  -- que también podrían pasar por acá en el futuro) suman al acumulado
  -- histórico — de ahí el chequeo > 0.
  if p_monto > 0 then
    select nivel_cuenta into v_nivel_anterior from public.profiles where id = p_user_id;

    update public.profiles set xp_historico_total = xp_historico_total + p_monto
      where id = p_user_id
      returning xp_historico_total into v_xp_nuevo;

    v_nivel_nuevo := public.nivel_desde_xp_cuenta(v_xp_nuevo);

    if v_nivel_nuevo > v_nivel_anterior then
      v_subio := true;
      -- Paquete de Chispas al subir de nivel — escala con el nivel
      -- alcanzado, así que subir nivel 20 se siente mejor que nivel 2.
      v_bonus := 50 * v_nivel_nuevo;
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

grant execute on function public.acreditar_chispas(uuid, integer) to authenticated;

-- registrar_xp_diario (cubre Numeria/Geografía/Quimia/Enigmia — todo
-- pasa por acá) y completar_reto_diario ahora acreditan a través de
-- acreditar_chispas() en vez de tocar profiles directo — mismo
-- resultado externo (misma forma de retorno, ningún cambio en el
-- frontend), pero ahora también alimentan Fase 3/4. Deliberadamente
-- NO se toca comprar_item_tienda/apostar_doble_o_nada/
-- resolver_apuesta_si_activa (0025): son gasto o reciclado de Chispas
-- ya contadas antes, no "ganancia nueva" — contarlas de nuevo infla el
-- nivel de cuenta por apostar, no por practicar.
create or replace function public.registrar_xp_diario(p_xp integer)
returns table (
  xp_total integer,
  xp_ganado_hoy integer,
  meta_alcanzada boolean,
  meta_xp_diaria integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_meta integer;
  v_xp_hoy integer;
  v_meta_alcanzada boolean;
  v_puntos_total integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  insert into public.daily_progress (user_id, fecha, xp_ganado)
  values (v_user, current_date, p_xp)
  on conflict (user_id, fecha)
  do update set xp_ganado = public.daily_progress.xp_ganado + excluded.xp_ganado
  returning public.daily_progress.xp_ganado into v_xp_hoy;

  select p.meta_xp_diaria into v_meta from public.profiles p where p.id = v_user;
  v_meta_alcanzada := v_xp_hoy >= v_meta;

  update public.daily_progress
  set meta_alcanzada = v_meta_alcanzada
  where user_id = v_user and fecha = current_date;

  perform public.acreditar_chispas(v_user, p_xp);
  select puntos_total into v_puntos_total from public.profiles where id = v_user;

  return query select v_puntos_total, v_xp_hoy, v_meta_alcanzada, v_meta;
end;
$$;

grant execute on function public.registrar_xp_diario(integer) to authenticated;

create or replace function public.completar_reto_diario(p_fecha date, p_correctos smallint)
returns table (puntos_bonus integer, puntos_total integer, ya_completado boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_bonus integer;
  v_existe boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_fecha <> current_date then
    raise exception 'fecha invalida';
  end if;

  select exists(
    select 1 from public.retos_diarios_completados where user_id = v_user and fecha = p_fecha
  ) into v_existe;

  if v_existe then
    return query select 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user), true;
    return;
  end if;

  v_bonus := greatest(0, least(5, p_correctos)) * 15;

  insert into public.retos_diarios_completados (user_id, fecha, correctos, puntos_bonus)
  values (v_user, p_fecha, p_correctos, v_bonus);

  perform public.acreditar_chispas(v_user, v_bonus);

  return query select v_bonus, (select pr.puntos_total from public.profiles pr where pr.id = v_user), false;
end;
$$;

grant execute on function public.completar_reto_diario(date, smallint) to authenticated;

-- Recompensa de misión de clan (0068): también es una ganancia
-- individual real — pasa a sumar al nivel de cuenta de cada miembro
-- (pero OJO: no vuelve a sumar al acumulado del CLAN, sería
-- circular — el clan ya "ganó" ese XP con los intentos que completaron
-- la misión, contarlo de nuevo lo infla).
create or replace function public.avanzar_mision_de_clan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clan_id uuid;
  v_mision record;
  v_miembro uuid;
begin
  if new.correct is distinct from true or coalesce(new.xp, 0) <= 0 then
    return new;
  end if;

  select clan_id into v_clan_id from public.clan_membresias where user_id = new.user_id;
  if v_clan_id is null then
    return new;
  end if;

  select * into v_mision from public.clan_misiones
  where clan_id = v_clan_id and semana_inicio = date_trunc('week', current_date)::date
  for update;

  if v_mision.id is null or v_mision.completada then
    return new;
  end if;

  update public.clan_misiones
    set progreso_actual = progreso_actual + 1,
        completada = (progreso_actual + 1) >= objetivo_cantidad
    where id = v_mision.id;

  if (v_mision.progreso_actual + 1) >= v_mision.objetivo_cantidad then
    for v_miembro in select user_id from public.clan_membresias where clan_id = v_clan_id loop
      update public.profiles set puntos_total = puntos_total + v_mision.recompensa_chispas where id = v_miembro;
      update public.profiles set xp_historico_total = xp_historico_total + v_mision.recompensa_chispas where id = v_miembro;
    end loop;
    update public.clan_misiones set recompensa_repartida = true where id = v_mision.id;
  end if;

  return new;
end;
$$;

-- ---------- Fase 2: crear_clan cuesta 5000 Chispas ----------
create or replace function public.crear_clan(p_nombre text, p_tag text, p_color text, p_descripcion text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_saldo integer;
  v_costo constant integer := 5000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — salí del actual antes de crear uno nuevo';
  end if;
  if length(trim(p_nombre)) < 3 then
    raise exception 'el nombre del clan necesita al menos 3 caracteres';
  end if;

  select puntos_total into v_saldo from public.profiles where id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas: crear un clan cuesta % (tenés %)', v_costo, v_saldo;
  end if;

  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  insert into public.clanes (nombre, descripcion, tipo, owner_id, tag, color_estandarte)
  values (trim(p_nombre), coalesce(nullif(trim(p_descripcion), ''), 'Sin descripción todavía.'), 'jugadores', v_user, nullif(trim(p_tag), ''), coalesce(p_color, '#6C4CF1'))
  returning id into v_id;

  insert into public.clan_membresias (clan_id, user_id, rol) values (v_id, v_user, 'fundador');

  return v_id;
end;
$$;

grant execute on function public.crear_clan(text, text, text, text) to authenticated;

-- ---------- Fase 6: roles con nombre propio ----------
-- Fundador (quien lo creó, o a quien le tocó el rol al irse el
-- fundador anterior), Guía (miembro de confianza que el fundador
-- puede promover) y Miembro. Nombres coherentes con la voz de
-- Prodigia (títulos/roles ya usados en el resto del proyecto:
-- "Maestro de X", "Explorador de Quimia") en vez de admin/mod
-- genéricos.
-- El orden acá importa de verdad, en los 3 pasos:
--   1) soltar la constraint VIEJA primero — si no, el update de abajo
--      (que pone 'fundador') se prueba contra la constraint vieja
--      (que solo permite 'lider'/'miembro') y falla ahí mismo.
--   2) recién con la columna sin ninguna constraint activa, convertir
--      los datos ('lider' -> 'fundador').
--   3) sumar la constraint NUEVA al final, cuando los datos ya están
--      limpios — si se agrega antes del update, valida las filas
--      viejas todavía en 'lider' contra un check que ya no las acepta
--      y falla por el lado contrario.
alter table public.clan_membresias drop constraint clan_membresias_rol_check;
update public.clan_membresias set rol = 'fundador' where rol = 'lider';
alter table public.clan_membresias add constraint clan_membresias_rol_check check (rol in ('fundador', 'guia', 'miembro'));

create or replace function public.unirse_a_clan(p_clan_id uuid)
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
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — salí del actual antes de unirte a otro';
  end if;
  if not exists (select 1 from public.clanes where id = p_clan_id and tipo = 'jugadores') then
    raise exception 'clan no encontrado';
  end if;

  insert into public.clan_membresias (clan_id, user_id, rol) values (p_clan_id, v_user, 'miembro');
end;
$$;

create or replace function public.salir_del_clan()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_clan_id uuid;
  v_era_fundador boolean;
  v_siguiente uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select clan_id, (rol = 'fundador') into v_clan_id, v_era_fundador from public.clan_membresias where user_id = v_user;
  if v_clan_id is null then
    raise exception 'no estás en ningún clan';
  end if;

  delete from public.clan_membresias where user_id = v_user;

  if v_era_fundador then
    -- Preferí un Guía si hay uno (ya venía con responsabilidad
    -- delegada); si no, el miembro más antiguo.
    select user_id into v_siguiente from public.clan_membresias
    where clan_id = v_clan_id
    order by (rol = 'guia') desc, unido_at asc
    limit 1;
    if v_siguiente is not null then
      update public.clan_membresias set rol = 'fundador' where clan_id = v_clan_id and user_id = v_siguiente;
    end if;
  end if;
end;
$$;

-- Promover/degradar — solo el fundador actual del clan puede tocar el
-- rol de otro miembro, y nunca al fundador mismo (para eso existe la
-- sucesión automática de salir_del_clan).
create or replace function public.cambiar_rol_miembro(p_user_id uuid, p_nuevo_rol text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_clan uuid;
  v_mi_rol text;
  v_clan_objetivo uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_nuevo_rol not in ('guia', 'miembro') then
    raise exception 'rol inválido';
  end if;

  select clan_id, rol into v_mi_clan, v_mi_rol from public.clan_membresias where user_id = v_user;
  if v_mi_rol is distinct from 'fundador' then
    raise exception 'solo el fundador puede cambiar roles';
  end if;

  select clan_id into v_clan_objetivo from public.clan_membresias where user_id = p_user_id;
  if v_clan_objetivo is null or v_clan_objetivo <> v_mi_clan then
    raise exception 'ese usuario no es miembro de tu clan';
  end if;

  update public.clan_membresias set rol = p_nuevo_rol where user_id = p_user_id and clan_id = v_mi_clan;
end;
$$;

grant execute on function public.cambiar_rol_miembro(uuid, text) to authenticated;

-- El "create or replace" de más abajo cambia la forma de RETURNS TABLE
-- respecto de la versión de 0068 (suma xp_aportado en el medio de la
-- lista de columnas) — Postgres no permite eso con create or replace
-- (error 42P13, "cannot change return type of existing function"), hay
-- que borrar la función primero. Sin este drop, esta migración entera
-- fallaba acá y se revertía TODO lo anterior en la misma transacción,
-- incluida la constraint de roles ya arreglada más arriba.
drop function if exists public.miembros_de_clan(uuid);

create function public.miembros_de_clan(p_clan_id uuid)
returns table (user_id uuid, display_name text, avatar_url text, rol text, chispas_semana integer, xp_aportado bigint, unido_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.avatar_url, cm.rol,
    coalesce((
      select sum(dp.xp_ganado)::integer from public.daily_progress dp
      where dp.user_id = p.id and dp.fecha >= date_trunc('week', current_date)::date and dp.fecha <= current_date
    ), 0) as chispas_semana,
    cm.xp_aportado,
    cm.unido_at
  from public.clan_membresias cm
  join public.profiles p on p.id = cm.user_id
  where cm.clan_id = p_clan_id
  order by case cm.rol when 'fundador' then 0 when 'guia' then 1 else 2 end, cm.xp_aportado desc;
$$;

drop function if exists public.mi_clan();

create function public.mi_clan()
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text, descripcion text,
  rol text, cantidad_miembros bigint, nivel_clan integer
)
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

  return query
    select c.id, c.nombre, c.tag, c.color_estandarte, c.descripcion, cm.rol,
      (select count(*) from public.clan_membresias cm2 where cm2.clan_id = c.id),
      public.nivel_clan(c.id)
    from public.clan_membresias cm
    join public.clanes c on c.id = cm.clan_id
    where cm.user_id = v_user;
end;
$$;

grant execute on function public.mi_clan() to authenticated;

-- ---------- Fase 7: guerra de clanes semanal — rival en vivo +
-- históricas + ranking con el Clan de Bots adentro ----------
alter table public.clanes add column if not exists guerras_ganadas integer not null default 0;

-- Ranking semanal ahora incluye también al Clan de Bots — compite con
-- el mismo criterio (suma de xp_ganado semanal de sus "miembros"), así
-- que necesita una fuente de XP semanal propia: cada bot del roster
-- aporta un valor fijo simulado a partir de su ELO (más ELO = más
-- aporte), ya que los bots no generan daily_progress real (nunca
-- juegan por su cuenta, solo cuando alguien los enfrenta). Escala
-- pensada para que el Clan de Bots quede en algún punto medio del
-- ranking, nunca automáticamente primero.
create or replace function public.ranking_clanes_semanal()
returns table (clan_id uuid, nombre text, tag text, color_estandarte text, xp_semana bigint, cantidad_miembros bigint, nivel_clan integer)
language sql
security definer
set search_path = public
as $$
  with jugadores as (
    select
      c.id, c.nombre, c.tag, c.color_estandarte,
      coalesce(sum(dp.xp_semana), 0)::bigint as xp_semana,
      count(distinct cm.user_id) as cantidad_miembros,
      public.nivel_clan(c.id) as nivel_clan
    from public.clanes c
    join public.clan_membresias cm on cm.clan_id = c.id
    left join lateral (
      select sum(d.xp_ganado) as xp_semana
      from public.daily_progress d
      where d.user_id = cm.user_id and d.fecha >= date_trunc('week', current_date)::date and d.fecha <= current_date
    ) dp on true
    where c.tipo = 'jugadores'
    group by c.id
  ),
  bots as (
    select
      c.id, c.nombre, c.tag, c.color_estandarte,
      coalesce(sum(round(m.tasa_acierto * 400)), 0)::bigint as xp_semana,
      count(*) as cantidad_miembros,
      public.nivel_clan(c.id) as nivel_clan
    from public.clanes c
    join public.clan_miembros m on m.clan_id = c.id
    where c.tipo = 'bots'
    group by c.id
  )
  select * from jugadores where xp_semana > 0
  union all
  select * from bots where xp_semana > 0
  order by xp_semana desc
  limit 50;
$$;

grant execute on function public.ranking_clanes_semanal() to authenticated;

-- Rival en vivo (Fase 7): el clan inmediatamente arriba en el ranking
-- semanal actual — no es un pareo pre-armado (no hay infraestructura
-- de cron para "cerrar" pareos), es "a quién tenés que superar ahora
-- mismo", recalculado en cada visita.
create or replace function public.rival_de_clan(p_clan_id uuid)
returns table (clan_id uuid, nombre text, tag text, color_estandarte text, xp_semana bigint, mi_xp_semana bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mi_posicion integer;
  v_mi_xp bigint;
begin
  select posicion, xp_semana into v_mi_posicion, v_mi_xp
  from (select r.*, row_number() over (order by r.xp_semana desc) as posicion from public.ranking_clanes_semanal() r) t
  where t.clan_id = p_clan_id;

  if v_mi_posicion is null or v_mi_posicion <= 1 then
    return; -- no está rankeado esta semana, o ya es el número 1 — sin rival que perseguir
  end if;

  return query
    select t.clan_id, t.nombre, t.tag, t.color_estandarte, t.xp_semana, v_mi_xp
    from (select r.*, row_number() over (order by r.xp_semana desc) as posicion from public.ranking_clanes_semanal() r) t
    where t.posicion = v_mi_posicion - 1;
end;
$$;

grant execute on function public.rival_de_clan(uuid) to authenticated;

-- Cierre perezoso de la semana anterior (mismo criterio que
-- asegurar_mision_semanal: sin cron, se dispara al abrir la página de
-- un clan). Le suma 1 a guerras_ganadas del clan que quedó #1 la
-- semana pasada, una sola vez por semana — el insert en
-- clan_semanas_procesadas con clave primaria por semana actúa de
-- traba: si dos usuarios abren la página casi al mismo tiempo, solo
-- uno de los dos gana la carrera del insert.
create table if not exists public.clan_semanas_procesadas (
  semana_inicio date primary key,
  procesado_at timestamptz not null default now()
);

create or replace function public.procesar_cierre_semana_clanes()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_semana_pasada date := date_trunc('week', current_date)::date - interval '7 days';
  v_ganador uuid;
begin
  insert into public.clan_semanas_procesadas (semana_inicio) values (v_semana_pasada)
  on conflict do nothing;
  if not found then
    return; -- ya se procesó esta semana (por otra visita) — no hay nada más que hacer
  end if;

  select cm.clan_id into v_ganador
  from public.clan_membresias cm
  join public.daily_progress dp on dp.user_id = cm.user_id
    and dp.fecha >= v_semana_pasada and dp.fecha < v_semana_pasada + 7
  join public.clanes c on c.id = cm.clan_id and c.tipo = 'jugadores'
  group by cm.clan_id
  order by sum(dp.xp_ganado) desc
  limit 1;

  if v_ganador is not null then
    update public.clanes set guerras_ganadas = guerras_ganadas + 1 where id = v_ganador;
  end if;
end;
$$;

grant execute on function public.procesar_cierre_semana_clanes() to authenticated;

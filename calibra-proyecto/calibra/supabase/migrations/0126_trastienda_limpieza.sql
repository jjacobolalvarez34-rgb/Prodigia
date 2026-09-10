-- 0126: Trastienda — limpieza, cuentas de prueba y español normalizado.
-- Sigue a 0125_recalcular_niveles_mundo_y_saneo.sql.
--
-- Tareas del backlog de la Trastienda resueltas acá:
--   1. Cuentas de prueba (QA tester, QA tester2, …) se marcan con
--      profiles.es_cuenta_prueba y se excluyen de TODOS los rankings
--      públicos, del ranking semanal historizable y del feed de mesas de
--      apuestas (fetch_apuestas_disponibles). 0119 no podía distinguirlas
--      (no existía una columna es_qa) y quedaban documentadas en el audit
--      como contaminación de datos de test.
--      Criterio de marcado: display_name que comienza en 'QA' (ilike 'qa%'),
--      que es el patrón de las cuentas de prueba. Es reversible a mano:
--      `update profiles set es_cuenta_prueba = false where id = '<id>';`
--   2. El Oráculo deja de calcular su ventana del lado del cliente: nueva
--      RPC ventana_predicciones() usa la MISMA fuente que el POST
--      (current_date del server) — evita la zona horaria del cliente.
--   3. Se ELIMINAN Acertijos de Enigmia y El Reloj del Sótano (decisión de
--      producto, 2026-09-09): tablas trastienda_acertijos/trastienda_reloj
--      y sus RPCs. La Calcu permanece.
--   4. Español normalizado (sin rioplatense) en los mensajes de negocio
--      que la Trastienda expone al cliente: se recrean girar_ruleta,
--      apostar_partida, apostar_prediccion_ranking, iniciar_la_pizarra y
--      apostar_doble_o_nada únicamente cambiando los mensajes rioplatenses
--      ('volvé', 'tenés', 'superás', 'tenes', 'jugá') por formas neutras.
--
-- Orden de aplicación recomendado: 0123 (completa) → 0124 → 0125 → 0126.
-- Idempotente salvo por el drop único de acertijos/reloj.

-- ---------- 1) Marca de cuentas de prueba ----------
alter table public.profiles add column if not exists es_cuenta_prueba boolean not null default false;

update public.profiles set es_cuenta_prueba = true
where display_name ilike 'qa%';

-- ---------- 2) Feed de mesas de apuestas: sin cuentas de prueba ----------
create or replace function public.fetch_apuestas_disponibles()
returns table (
  partida_id uuid,
  tipo text,
  estado text,
  operation_type text,
  jugador_a_id uuid,
  jugador_b_id uuid,
  nombre_a text,
  nombre_b text,
  elo_a integer,
  elo_b integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    d.id as partida_id,
    'duelo'::text as tipo,
    d.estado,
    d.operation_type,
    d.retador_id as jugador_a_id,
    d.retado_id as jugador_b_id,
    pa.display_name as nombre_a,
    pb.display_name as nombre_b,
    pa.elo_rating as elo_a,
    pb.elo_rating as elo_b
  from public.duels d
  join public.profiles pa on pa.id = d.retador_id
  join public.profiles pb on pb.id = d.retado_id
  where d.estado in ('pendiente', 'en_curso')
    and auth.uid() not in (d.retador_id, d.retado_id)
    and not pa.es_cuenta_prueba
    and not pb.es_cuenta_prueba
    and not exists (
      select 1 from public.trastienda_apuestas a
      where a.user_id = auth.uid() and a.partida_id = d.id
    )
  order by d.creado_at desc
  limit 20;
$$;

grant execute on function public.fetch_apuestas_disponibles() to authenticated;

-- ---------- 3) Rankings públicos: excluyen cuentas de prueba ----------

-- ranking_elo_global (persistente ELO competitivo, definido en 0119).
create or replace function public.ranking_elo_global(p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  elo_rating integer,
  avatar_url text,
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

  return query
    select p.id, p.display_name, p.elo_rating, p.avatar_url, p.titulo_activo,
      public.titulo_nombre_de(p.id), p.fuente_nombre
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
      and not p.es_bot
      and not p.es_cuenta_prueba
      and p.display_name is not null
      and btrim(p.display_name) <> ''
      and u.email_confirmed_at is not null
      and (
        not p_solo_amigos
        or p.id = v_caller
        or exists (
          select 1 from public.friendships f
          where f.estado = 'aceptada'
            and ((f.user_id = v_caller and f.friend_id = p.id) or (f.friend_id = v_caller and f.user_id = p.id))
        )
      )
    order by p.elo_rating desc
    limit 100;
end;
$$;

grant execute on function public.ranking_elo_global(boolean) to authenticated;

-- ranking_semanal_filtrado (por mundo, definido en 0119).
create or replace function public.ranking_semanal_filtrado(p_mundo text default null, p_solo_amigos boolean default false)
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
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
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
          when p_mundo = 'quimia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica')
          ), 0)
          when p_mundo = 'anatomia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso')
          ), 0)
          when p_mundo = 'melodia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto')
          ), 0)
          when p_mundo = 'trigonometria' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes')
          ), 0)
          when p_mundo = 'historia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas')
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
        and not p.es_bot
        and not p.es_cuenta_prueba
        and p.display_name is not null
        and btrim(p.display_name) <> ''
        and u.email_confirmed_at is not null
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

-- ranking_semanal (sin mundo, definido en 0119 con guard de autenticación).
drop function if exists public.ranking_semanal();

create function public.ranking_semanal()
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(sum(dp.xp_ganado), 0) as xp_semana,
    p.avatar_url,
    p.elo_rating,
    p.titulo_activo,
    public.titulo_nombre_de(p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  where coalesce(u.is_anonymous, false) = false
    and not p.es_bot
    and not p.es_cuenta_prueba
    and p.display_name is not null
    and btrim(p.display_name) <> ''
    and u.email_confirmed_at is not null
    and auth.uid() is not null
  group by p.id, p.display_name, p.avatar_url, p.elo_rating, p.titulo_activo
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

revoke execute on function public.ranking_semanal() from public, anon;
grant execute on function public.ranking_semanal() to authenticated;

-- posicion_ranking_puntos (para /perfil).
create or replace function public.posicion_ranking_puntos()
returns table (posicion bigint, total_jugadores bigint)
language sql
security definer
set search_path = public
as $$
  with reales as (
    select p.id, p.puntos_total, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
      and not p.es_bot
      and not p.es_cuenta_prueba
      and p.display_name is not null
      and btrim(p.display_name) <> ''
      and u.email_confirmed_at is not null
  ),
  ranking as (
    select id, row_number() over (order by puntos_total desc, created_at asc) as posicion
    from reales
  )
  select r.posicion, (select count(*) from reales) as total_jugadores
  from ranking r
  where r.id = auth.uid();
$$;

grant execute on function public.posicion_ranking_puntos() to authenticated;

-- ranking_semanal_de_semana (histórico, define la posición real del Oráculo).
create or replace function public.ranking_semanal_de_semana(p_semana date)
returns table (
  user_id uuid,
  posicion bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id as user_id,
         row_number() over (order by coalesce(sum(dp.xp_ganado), 0) desc, p.id) as posicion
  from public.profiles p
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= p_semana
    and dp.fecha < p_semana + 7
  where not p.es_cuenta_prueba
  group by p.id
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by posicion;
$$;

grant execute on function public.ranking_semanal_de_semana(date) to authenticated;

-- ---------- 4) Oráculo: ventana autoritativa del server ----------
-- La ventana de apuesta es lunes..miércoles usando current_date del server
-- (la misma de apostar_prediccion_ranking). El cliente ya no la calcula con
-- su reloj local — evita el desfase de zona horaria que cerraba/abría la
-- ventana en el momento equivocado.
create or replace function public.ventana_predicciones()
returns table (
  semana date,
  ventana_abierta boolean,
  hora_server timestamptz
)
language sql
stable
set search_path = public
as $$
  select
    date_trunc('week', current_date)::date as semana,
    current_date <= date_trunc('week', current_date)::date + 2 as ventana_abierta,
    now() as hora_server;
$$;

grant execute on function public.ventana_predicciones() to authenticated;

-- ---------- 5) Se eliminan Acertijos de Enigmia y El Reloj del Sótano ----------
drop function if exists public.iniciar_acertijos();
drop function if exists public.responder_acertijos(uuid, integer[]);
drop table if exists public.trastienda_acertijos cascade;

drop function if exists public.iniciar_el_reloj();
drop function if exists public.finalizar_el_reloj(uuid, integer[]);
drop table if exists public.trastienda_reloj cascade;

-- ---------- 6) Español normalizado en los mensajes de negocio ----------
-- Se cumplen las mismas garantías de 0121/0123 (security definer,
-- search_path public, transacciones atómicas, grants).

-- girar_ruleta (0123): 'volvé mañana' -> 'vuelve mañana'.
create or replace function public.girar_ruleta()
returns table (
  segmento text,
  premio_tipo text,
  premio_detalle jsonb,
  chispas_ganadas integer,
  puntos_total integer,
  giros_hoy integer,
  pity_activo boolean,
  costo_aplicado integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_giros_hoy integer;
  v_costo integer;
  v_pity_prev integer := 0;
  v_r numeric;
  v_segmento text;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_chispas integer := 0;
  v_pity_new integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido text;
  v_titulo_slug text;
  v_titulo_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_giros_hoy
  from public.trastienda_ruleta
  where user_id = v_user and fecha = current_date;

  if v_giros_hoy >= 5 then
    raise exception 'ya giraste las 5 veces de hoy — vuelve mañana';
  end if;

  v_costo := case when v_giros_hoy = 0 then 120 else 150 end;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas para girar';
  end if;

  select coalesce(r.pity_counter, 0) into v_pity_prev
  from public.trastienda_ruleta r
  where r.user_id = v_user
  order by r.creado_at desc
  limit 1;

  if v_pity_prev >= 3 then
    v_segmento := (array['chispas_25', 'chispas_50', 'escudo'])[1 + floor(random() * 3)::int];
  else
    v_r := random() * 100;
    if v_r < 5 then
      v_segmento := 'boost';
    elsif v_r < 13 then
      v_segmento := 'escudo';
    elsif v_r < 19 then
      v_segmento := 'congelamiento';
    elsif v_r < 31 then
      v_segmento := 'chispas_50';
    elsif v_r < 51 then
      v_segmento := 'chispas_25';
    elsif v_r < 54 then
      v_segmento := 'chispas_100';
    elsif v_r < 56 then
      v_segmento := 'fuente';
    elsif v_r < 57.5 then
      v_segmento := 'marco';
    elsif v_r < 58 then
      v_segmento := 'titulo';
    else
      v_segmento := 'nada';
    end if;
  end if;

  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  if v_segmento = 'boost' then
    update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'boost');
  elsif v_segmento = 'escudo' then
    update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'escudo');
  elsif v_segmento = 'congelamiento' then
    update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'congelamiento');
  elsif v_segmento = 'titulo' then
    select t.slug into v_titulo_slug
    from public.titulos_trastienda_base() t
    where t.slug not in (
      select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
    )
    order by random()
    limit 1;
    if v_titulo_slug is null then
      v_chispas := 200;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
      perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
      v_premio_tipo := 'titulo';
      v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
    end if;
  elsif v_segmento in ('chispas_25', 'chispas_50', 'chispas_100') then
    v_chispas := (string_to_array(v_segmento, '_'))[2]::int;
    update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
    v_premio_tipo := 'chispas';
    v_premio_detalle := jsonb_build_object('chispas', v_chispas);
  elsif v_segmento = 'fuente' then
    select coalesce(array_agg(f), array[]::text[]) into v_disponibles
    from unnest(v_fuentes) t(f)
    where not (
      f = any (coalesce((select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 200;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'fuente';
      v_premio_detalle := jsonb_build_object('fuente', v_elegido);
    end if;
  elsif v_segmento = 'marco' then
    select coalesce(array_agg(m), array[]::text[]) into v_disponibles
    from unnest(v_marcos) t(m)
    where not (
      m = any (coalesce((select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 300;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'marco';
      v_premio_detalle := jsonb_build_object('marco', v_elegido);
    end if;
  end if;

  v_pity_new := case when v_segmento = 'nada' then v_pity_prev + 1 else 0 end;

  insert into public.trastienda_ruleta
    (user_id, segmento, premio_tipo, premio_detalle, giro_numero, pity_counter, costo_aplicado)
  values
    (v_user, v_segmento, v_premio_tipo, v_premio_detalle, v_giros_hoy + 1, v_pity_new, v_costo);

  return query select
    v_segmento,
    v_premio_tipo,
    v_premio_detalle,
    v_chispas,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_giros_hoy + 1,
    v_pity_new >= 3,
    v_costo;
end;
$$;

grant execute on function public.girar_ruleta() to authenticated;

-- apostar_partida (0123): 'volvé mañana' y 'superás' -> formas neutras.
create or replace function public.apostar_partida(p_partida_id uuid, p_eleccion text, p_monto integer)
returns table (
  apuesta_id uuid,
  multiplier numeric,
  ganancia_potencial integer,
  puntos_total integer,
  apuestas_hoy integer,
  monto_apostado_hoy integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duelo public.duels%rowtype;
  v_elo_a integer;
  v_elo_b integer;
  v_mult numeric;
  v_saldo integer;
  v_apuestas_hoy integer := 0;
  v_monto_hoy integer := 0;
  v_perdida_hoy integer := 0;
  v_fila_limite public.trastienda_limites_diarios%rowtype;
  v_apuesta_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_eleccion not in ('a', 'b', 'empate') then
    raise exception 'eleccion invalida';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  select * into v_duelo from public.duels where id = p_partida_id;
  if not found then
    raise exception 'esa partida no existe';
  end if;
  if v_duelo.estado not in ('pendiente', 'en_curso') then
    raise exception 'esa partida ya cerró';
  end if;
  if v_user in (v_duelo.retador_id, v_duelo.retado_id) then
    raise exception 'no se puede apostar a una partida propia';
  end if;
  if exists (
    select 1 from public.trastienda_apuestas
    where user_id = v_user and partida_id = p_partida_id
  ) then
    raise exception 'ya apostaste a esa partida';
  end if;

  select * into v_fila_limite
  from public.trastienda_limites_diarios
  where user_id = v_user;
  if found and v_fila_limite.fecha = current_date then
    v_apuestas_hoy := v_fila_limite.apuestas_realizadas;
    v_monto_hoy := v_fila_limite.monto_total_apostado;
    v_perdida_hoy := v_fila_limite.perdida_total;
  end if;

  if v_apuestas_hoy >= 10 then
    raise exception 'ya apostaste las 10 veces de hoy — vuelve mañana';
  end if;
  if v_monto_hoy + p_monto > 500 then
    raise exception 'superas el tope diario de 500 Chispas apostadas';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  select elo_rating into v_elo_a from public.profiles where id = v_duelo.retador_id;
  select elo_rating into v_elo_b from public.profiles where id = v_duelo.retado_id;
  v_mult := public.multiplier_apuesta_partida(v_elo_a, v_elo_b, p_eleccion);

  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

  insert into public.trastienda_apuestas
    (user_id, partida_id, partida_tipo, jugador_a_id, jugador_b_id, eleccion, monto, multiplier, ganancia_potencial)
  values
    (v_user, p_partida_id, 'duelo', v_duelo.retador_id, v_duelo.retado_id,
     p_eleccion, p_monto, v_mult, floor(p_monto * v_mult)::int)
  returning id into v_apuesta_id;

  insert into public.trastienda_limites_diarios
    (user_id, fecha, apuestas_realizadas, monto_total_apostado, perdida_total)
  values (v_user, current_date, v_apuestas_hoy + 1, v_monto_hoy + p_monto, v_perdida_hoy)
  on conflict (user_id) do update set
    fecha = current_date,
    apuestas_realizadas = public.trastienda_limites_diarios.apuestas_realizadas + 1,
    monto_total_apostado = public.trastienda_limites_diarios.monto_total_apostado + p_monto;

  return query select
    v_apuesta_id,
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_apuestas_hoy + 1,
    v_monto_hoy + p_monto;
end;
$$;

grant execute on function public.apostar_partida(uuid, text, integer) to authenticated;

-- apostar_prediccion_ranking (0123): 'tenés' -> 'tienes'.
create or replace function public.apostar_prediccion_ranking(p_puesto text, p_monto integer)
returns table (
  prediccion_id uuid,
  semana_inicio date,
  multiplier numeric,
  ganancia_potencial integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_semana date := date_trunc('week', current_date)::date;
  v_mult numeric;
  v_saldo integer;
  v_existe boolean;
  v_prediccion_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  v_mult := public.multiplier_prediccion(p_puesto);
  if v_mult is null then
    raise exception 'puesto invalido';
  end if;

  perform public.resolver_prediccion_ranking(v_semana - 7);

  if current_date > v_semana + 2 then
    raise exception 'ya cerró la ventana de apuesta de esta semana — la próxima abre el lunes';
  end if;

  select exists(
    select 1 from public.trastienda_predicciones_ranking
    where user_id = v_user and semana_inicio = v_semana
  ) into v_existe;
  if v_existe then
    raise exception 'ya tienes una predicción para esta semana (una por semana)';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa predicción';
  end if;

  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

  insert into public.trastienda_predicciones_ranking
    (user_id, semana_inicio, puesto_predicho, monto, multiplier, ganancia_potencial)
  values
    (v_user, v_semana, p_puesto, p_monto, v_mult, floor(p_monto * v_mult)::int)
  returning id into v_prediccion_id;

  return query select
    v_prediccion_id,
    v_semana,
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.apostar_prediccion_ranking(text, integer) to authenticated;

-- iniciar_la_pizarra (0121): 'volvé mañana' -> 'vuelve mañana'.
create or replace function public.iniciar_la_pizarra()
returns table (
  pizarra_id uuid,
  entrada integer,
  partidas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_del_dia uuid;
  v_partidas_hoy integer;
  v_numero integer;
  v_minijuego_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_partidas_hoy
  from public.trastienda_pizarra where user_id = v_user and fecha = current_date;

  if v_partidas_hoy >= 3 then
    raise exception 'ya jugaste las 3 partidas de hoy — vuelve mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 30 then
    raise exception 'te faltan Chispas para entrar a la pizarra';
  end if;

  update public.trastienda_pizarra
  set estado = 'perdido', resuelto_at = now()
  where user_id = v_user and estado = 'jugando';

  v_numero := 1 + floor(random() * 100)::int;

  update public.profiles set puntos_total = puntos_total - 30 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_pizarra', 30)
  returning id into v_minijuego_id;

  insert into public.trastienda_pizarra (user_id, minijuego_id, secreto)
  values (v_user, v_minijuego_id, v_numero)
  returning id into v_del_dia;

  return query select
    v_del_dia,
    30,
    v_partidas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.iniciar_la_pizarra() to authenticated;

-- apostar_doble_o_nada (0121): 'tenes' y 'jugá' -> formas neutras.
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
  v_total_simple bigint := 0;
  v_correctos_simple bigint := 0;
  v_duelos bigint := 0;
  v_actividad bigint;
  v_umbral numeric;
  v_apuesta_maxima constant integer := 200;
  v_tiene_logic boolean;
  v_tiene_duelos boolean;
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

  select pr.puntos_total, pr.apuesta_monto into v_saldo, v_apuesta_previa
  from public.profiles pr where pr.id = v_user;

  if v_apuesta_previa > 0 then
    raise exception 'ya tienes una apuesta activa';
  end if;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  select count(*), count(*) filter (where correct) into v_total_simple, v_correctos_simple
  from public.attempts where user_id = v_user;

  v_tiene_logic := to_regclass('public.logic_attempts') is not null;
  if v_tiene_logic then
    select v_total_simple + count(*), v_correctos_simple + count(*) filter (where correct)
      into v_total_simple, v_correctos_simple
    from public.logic_attempts where user_id = v_user;
  end if;

  v_tiene_duelos := to_regclass('public.duel_results') is not null;
  if v_tiene_duelos then
    select count(*) into v_duelos from public.duel_results where user_id = v_user;
  end if;

  v_actividad := v_total_simple + v_duelos * 10;

  if v_actividad < 20 then
    raise exception 'juega un poco más antes de poder apostar';
  end if;

  if v_total_simple >= 5 then
    v_umbral := v_correctos_simple::numeric / v_total_simple;
  elsif v_tiene_duelos and v_duelos > 0 then
    select avg(precision) into v_umbral from public.duel_results where user_id = v_user;
  else
    v_umbral := 0.7;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - p_monto,
      apuesta_monto = p_monto,
      apuesta_umbral = v_umbral
  where pr.id = v_user;

  return query select v_umbral, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.apostar_doble_o_nada(integer) to authenticated;

-- ---------- 7) Grants de tablas y recarga de PostgREST ----------
-- trastienda_acertijos/trastienda_reloj nunca tuvieron grants: los DROPs
-- de arriba no dejan réplicas. La recarga evita cache stale de PostgREST
-- tras recrear los RPCs (el "algo salió mal" de los juegos era, en parte,
-- cache sin recargar).
notify pgrst, 'reload schema';
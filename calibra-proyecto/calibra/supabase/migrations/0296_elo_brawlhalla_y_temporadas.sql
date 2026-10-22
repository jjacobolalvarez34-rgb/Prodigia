-- ============================================================
-- Prodigia — ELO de rankeds como Brawlhalla y temporadas con recompensas (0296).
--
-- Pedido del usuario (2026-10-21): «500 elo es inicial, 800 de bronce, 1100 plata,
-- 1400 oro, 1700 platino, 2000 diamante, y entrar en el top 100 de los jugadores es
-- prodigio». Debajo de 800 hace falta un rango: Hierro (como el Tin de Brawlhalla).
-- Prodigio: ELO de 2000 o más y estar entre los 100 mejores.
--
-- 1) Escala nueva: los jugadores actuales pasan a la escala nueva conservando su
--    rango (tramo a tramo); quien nunca jugó una ranked (ELO 1200 exacto, el valor
--    de fábrica) queda en 500. Se hace una sola vez (migraciones_de_datos).
-- 2) Las ~30 funciones que eligen el contenido por ELO (nivel_*_por_rango,
--    modo_*_por_rango...) tenían los umbrales viejos: se redefinen desde su última
--    versión pasando la entrada por _elo_contenido(), que la lleva a la escala vieja.
-- 3) Factor K por 1,5 (los tramos ahora son de 300 en vez de 200).
-- 4) Temporadas: una por cada Gran Alineación (28 días; la 1 termina con la primera,
--    el 24/10/2026 a las 23:00 UTC). Un disparador guarda tu ELO máximo de cada
--    temporada; al terminar, la app muestra un anuncio con las recompensas (rango
--    alcanzado con su tier v1, v2, v3... según cuántas temporadas llegaste a él, un
--    título desde Oro y cápsulas) y se reclaman con reclamar_temporada_ranked().
-- Idempotente.
-- ============================================================

create table if not exists public.migraciones_de_datos (
  clave text primary key,
  hecho_at timestamptz not null default now()
);
alter table public.migraciones_de_datos enable row level security;

-- ---------- 1) Escalas ----------
-- Escala nueva a vieja (para elegir contenido con los umbrales de siempre).
create or replace function public._elo_contenido(p_elo numeric)
returns numeric
language sql
immutable
as $$
  select case
    when p_elo is null then null
    when p_elo >= 2300 then 1700 + (p_elo - 2300) * 2.0 / 3
    when p_elo >= 2000 then 1500 + (p_elo - 2000) * 2.0 / 3
    when p_elo >= 1700 then 1300 + (p_elo - 1700) * 2.0 / 3
    when p_elo >= 1400 then 1100 + (p_elo - 1400) * 2.0 / 3
    when p_elo >= 1100 then 900 + (p_elo - 1100) * 2.0 / 3
    when p_elo >= 800 then 800 + (p_elo - 800) / 3.0
    when p_elo >= 500 then 700 + (p_elo - 500) / 3.0
    else greatest(0, 400 + p_elo * 300.0 / 500)
  end;
$$;

-- Escala vieja a nueva (solo para pasar los ELO actuales).
create or replace function public._elo_desde_escala_vieja(p_elo numeric)
returns numeric
language sql
immutable
as $$
  select case
    when p_elo >= 1700 then 2300 + (p_elo - 1700) * 1.5
    when p_elo >= 1500 then 2000 + (p_elo - 1500) * 1.5
    when p_elo >= 1300 then 1700 + (p_elo - 1300) * 1.5
    when p_elo >= 1100 then 1400 + (p_elo - 1100) * 1.5
    when p_elo >= 900 then 1100 + (p_elo - 900) * 1.5
    when p_elo >= 800 then 800 + (p_elo - 800) * 3
    when p_elo >= 700 then 500 + (p_elo - 700) * 3
    else greatest(0, (p_elo - 400) * 500.0 / 300)
  end;
$$;

do $$
begin
  if not exists (select 1 from public.migraciones_de_datos where clave = 'elo_escala_brawlhalla') then
    update public.profiles as pr
      set elo_rating = case when pr.elo_rating = 1200 then 500 else round(public._elo_desde_escala_vieja(pr.elo_rating))::integer end;
    insert into public.migraciones_de_datos (clave) values ('elo_escala_brawlhalla');
  end if;
end;
$$;
alter table public.profiles alter column elo_rating set default 500;
create index if not exists profiles_elo_rating_idx on public.profiles (elo_rating desc);

-- ---------- Rangos ----------
create or replace function public._rango_por_umbral(p_elo integer)
returns text
language sql
immutable
as $$
  select case
    when p_elo >= 2000 then 'diamante'
    when p_elo >= 1700 then 'platino'
    when p_elo >= 1400 then 'oro'
    when p_elo >= 1100 then 'plata'
    when p_elo >= 800 then 'bronce'
    else 'hierro'
  end;
$$;

-- ELO del jugador número 100 (el corte de Prodigio); nunca menos de 2000.
create or replace function public.umbral_prodigio()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(2000, coalesce((select min(t.elo_rating) from (select pr.elo_rating from public.profiles pr order by pr.elo_rating desc limit 100) t), 2000));
$$;
grant execute on function public.umbral_prodigio() to anon, authenticated;

-- Antes era immutable con umbrales fijos; ahora Prodigio depende del top 100.
create or replace function public.rango_de_elo(p_elo integer)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when p_elo >= 2000 and p_elo >= public.umbral_prodigio() then 'prodigio' else public._rango_por_umbral(p_elo) end;
$$;

-- Factor K: los mismos escalones de antes en la escala nueva, por 1,5.
create or replace function public.k_factor_de_elo(p_elo integer)
returns numeric
language sql
immutable
as $$
  select case
    when p_elo >= 2000 then 15
    when p_elo >= 1700 then 18.75
    when p_elo >= 1400 then 22.5
    when p_elo >= 1100 then 26.25
    else 30
  end;
$$;
grant execute on function public.k_factor_de_elo(integer) to authenticated;

-- Bajar a Hierro no es un logro: no da título (base 0043).
create or replace function public.desbloquear_titulo(p_user_id uuid, p_slug text, p_nombre text, p_origen text default 'rango')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ya_tenia_alguno boolean;
begin
  if p_slug = 'rango_hierro' then
    return;
  end if;
  select exists(select 1 from public.titulos_usuario where user_id = p_user_id) into v_ya_tenia_alguno;

  insert into public.titulos_usuario (user_id, slug, nombre, origen)
  values (p_user_id, p_slug, p_nombre, p_origen)
  on conflict (user_id, slug) do nothing;

  if not v_ya_tenia_alguno then
    update public.profiles set titulo_activo = p_slug where id = p_user_id;
  end if;
end;
$$;

-- ---------- 2) Contenido por rango, en la escala nueva ----------
-- categoria_aleatoria_por_rango: última definición en 0048_enigmia_complejidad_por_rango.sql, con la entrada pasada a la escala vieja.
create or replace function public.categoria_aleatoria_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1500 then
    -- Diamante y Prodigio: las 4 categorías ya están desbloqueadas acá
    -- (la diferencia entre estos dos rangos es de COMPLEJIDAD, no de
    -- categoría — ver nivel_enigmia_por_rango).
    v_opciones := array['memoria', 'patrones', 'deduccion', 'computacional'];
  elsif public._elo_contenido(p_elo_promedio) >= 1300 then
    v_opciones := array['memoria', 'patrones', 'deduccion']; -- Platino: + Deducción
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['memoria', 'patrones']; -- Oro y Plata: Memoria + Patrones
  else
    v_opciones := array['patrones']; -- Bronce: solo Patrones
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- continente_aleatorio_por_rango: última definición en 0043_rankeds_rangos_titulos_multimundo.sql, con la entrada pasada a la escala vieja.
create or replace function public.continente_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['america', 'europa', 'africa', 'asia_oceania'];
  elsif public._elo_contenido(p_elo_promedio) >= 1100 then
    v_opciones := array['america', 'europa'];
  else
    v_opciones := array['america'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_anatomia_aleatorio_por_rango: última definición en 0090_duelos_anatomia_melodia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_anatomia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['oseo', 'muscular', 'organos', 'nervioso'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['oseo', 'muscular'];
  else
    v_opciones := array['oseo'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_calculia_aleatorio_por_rango: última definición en 0165_mundo_calculia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_calculia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['derivadas', 'integrales', 'series', 'multivariable'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['derivadas', 'integrales', 'series'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['derivadas', 'integrales'];
  else
    v_opciones := array['derivadas'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_circuitia_aleatorio_por_rango: última definición en 0167_mundo_circuitia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_circuitia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['serie', 'paralelo', 'mixto', 'cualitativo'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['serie', 'paralelo', 'mixto'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['serie', 'paralelo'];
  else
    v_opciones := array['serie'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_codia_aleatorio_por_rango: última definición en 0189_mundos_estadistica_naipia_codia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_codia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['sintaxis', 'salida', 'error', 'estructuras'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['sintaxis', 'salida', 'error'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['sintaxis', 'salida'];
  else
    v_opciones := array['sintaxis'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_dinamia_aleatorio_por_rango: última definición en 0263_mundos_dinamia_vitalia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_dinamia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['cinematica', 'vectores', 'newton', 'energia', 'termo', 'fluidos'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['cinematica', 'vectores', 'newton', 'energia', 'termo'];
  elsif public._elo_contenido(p_elo_promedio) >= 1300 then
    v_opciones := array['cinematica', 'vectores', 'newton', 'energia'];
  elsif public._elo_contenido(p_elo_promedio) >= 1100 then
    v_opciones := array['cinematica', 'vectores', 'newton'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['cinematica', 'vectores'];
  else
    v_opciones := array['cinematica'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_estadistica_aleatorio_por_rango: última definición en 0189_mundos_estadistica_naipia_codia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_estadistica_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['central', 'dispersion', 'probabilidad', 'datos', 'graficos'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['central', 'dispersion', 'probabilidad', 'datos'];
  elsif public._elo_contenido(p_elo_promedio) >= 1300 then
    v_opciones := array['central', 'dispersion', 'probabilidad'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['central', 'dispersion'];
  else
    v_opciones := array['central'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_historia_aleatorio_por_rango: última definición en 0109_mundo_historia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_historia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['cronologia', 'personajes', 'causaefecto', 'fechas'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['cronologia', 'personajes', 'causaefecto'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['cronologia', 'personajes'];
  else
    v_opciones := array['cronologia'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_melodia_aleatorio_por_rango: última definición en 0252_melodia_tempo.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_melodia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['fundamentos', 'lectura', 'alteraciones', 'escalas', 'acordes', 'oido_absoluto', 'tempo'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['fundamentos', 'lectura', 'alteraciones', 'escalas', 'tempo'];
  elsif public._elo_contenido(p_elo_promedio) >= 1300 then
    v_opciones := array['fundamentos', 'lectura', 'alteraciones', 'tempo'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['fundamentos', 'lectura'];
  else
    v_opciones := array['fundamentos'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_naipia_aleatorio_por_rango: última definición en 0189_mundos_estadistica_naipia_codia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_naipia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['hilo', 'ko', 'hiopt2', 'omega2', 'verdadero'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['hilo', 'ko', 'hiopt2', 'omega2'];
  elsif public._elo_contenido(p_elo_promedio) >= 1300 then
    v_opciones := array['hilo', 'ko', 'hiopt2'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['hilo', 'ko'];
  else
    v_opciones := array['hilo'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_quimia_aleatorio_por_rango: última definición en 0098_paridad_mundos_fixes.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_quimia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['simbolos', 'formulas', 'tabla', 'nomenclatura', 'organica']; -- Prodigio
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['simbolos', 'formulas', 'tabla', 'nomenclatura']; -- Diamante
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['simbolos', 'formulas']; -- Plata, Oro y Platino
  else
    v_opciones := array['simbolos']; -- Bronce
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_trigonometria_aleatorio_por_rango: última definición en 0108_mundo_trigonometria.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_trigonometria_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['razones', 'circulo', 'identidades', 'leyes'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['razones', 'circulo', 'identidades'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['razones', 'circulo'];
  else
    v_opciones := array['razones'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- modo_vitalia_aleatorio_por_rango: última definición en 0263_mundos_dinamia_vitalia.sql, con la entrada pasada a la escala vieja.
create or replace function public.modo_vitalia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if public._elo_contenido(p_elo_promedio) >= 1700 then
    v_opciones := array['celula', 'procesos', 'genetica', 'sistemas', 'reinos', 'ecologia'];
  elsif public._elo_contenido(p_elo_promedio) >= 1500 then
    v_opciones := array['celula', 'procesos', 'genetica', 'sistemas', 'reinos'];
  elsif public._elo_contenido(p_elo_promedio) >= 1300 then
    v_opciones := array['celula', 'procesos', 'genetica', 'sistemas'];
  elsif public._elo_contenido(p_elo_promedio) >= 1100 then
    v_opciones := array['celula', 'procesos', 'genetica'];
  elsif public._elo_contenido(p_elo_promedio) >= 900 then
    v_opciones := array['celula', 'procesos'];
  else
    v_opciones := array['celula'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- nivel_anatomia_por_rango: última definición en 0090_duelos_anatomia_melodia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_anatomia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_calculia_por_rango: última definición en 0165_mundo_calculia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_calculia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_circuitia_por_rango: última definición en 0167_mundo_circuitia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_circuitia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_codia_por_rango: última definición en 0189_mundos_estadistica_naipia_codia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_codia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_dinamia_por_rango: última definición en 0263_mundos_dinamia_vitalia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_dinamia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_enigmia_por_rango: última definición en 0048_enigmia_complejidad_por_rango.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_enigmia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint                        -- Prodigio: máxima complejidad
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint  -- Diamante: 8-9
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint  -- Platino: 6-7
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint  -- Oro: 4-5, secuencias más largas que Plata
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint  -- Plata: 2-3
    else 1::smallint                                                       -- Bronce: secuencias cortas
  end;
$$;

-- nivel_estadistica_por_rango: última definición en 0189_mundos_estadistica_naipia_codia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_estadistica_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_historia_por_rango: última definición en 0109_mundo_historia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_historia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_melodia_por_rango: última definición en 0090_duelos_anatomia_melodia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_melodia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_naipia_por_rango: última definición en 0189_mundos_estadistica_naipia_codia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_naipia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_numeria_por_rango: última definición en 0043_rankeds_rangos_titulos_multimundo.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_numeria_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 3))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (5 + floor(random() * 4))::smallint
    else (1 + floor(random() * 5))::smallint
  end;
$$;

-- nivel_quimia_por_rango: última definición en 0056_mundo_quimia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_quimia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint                        -- Prodigio: máxima dificultad
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint  -- Diamante: 8-9
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint  -- Platino: 6-7
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint  -- Oro: 4-5
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint  -- Plata: 2-3
    else 1::smallint                                                       -- Bronce
  end;
$$;

-- nivel_trigonometria_por_rango: última definición en 0108_mundo_trigonometria.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_trigonometria_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- nivel_vitalia_por_rango: última definición en 0263_mundos_dinamia_vitalia.sql, con la entrada pasada a la escala vieja.
create or replace function public.nivel_vitalia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when public._elo_contenido(p_elo_promedio) >= 1700 then 10::smallint
    when public._elo_contenido(p_elo_promedio) >= 1500 then (8 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1300 then (6 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 1100 then (4 + floor(random() * 2))::smallint
    when public._elo_contenido(p_elo_promedio) >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;


-- ---------- 3b) Emparejamiento en la escala nueva ----------
-- buscar_rival_duelo desde su última versión (0263): Platino pasa de 1300 a 1700 (desde
-- ahí la clasificatoria es solo «todas las ciudades» y no hay bots) y la ventana de
-- ELO que crece con la espera se ensancha por 1,5, igual que los tramos.
create or replace function public.buscar_rival_duelo(p_mundo text, p_operation_type text default null, p_ranked boolean default true)
returns table (duel_id uuid, encontrado boolean, rango_actual integer, segundos_esperando integer, mundo_encontrado text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_elo integer;
  v_entered timestamptz;
  v_rango integer;
  v_segundos integer;
  v_rival record;
  v_es_bot boolean := false;
  v_velocidad_min_bot integer;
  v_velocidad_max_bot integer;
  v_tasa_bot numeric;
  v_duel_id uuid;
  v_this_duel_id uuid;
  v_elo_promedio numeric;
  v_serie_id uuid;
  v_mundos text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
  v_i int;
  v_j int;
  v_tmp text;
  v_mundo_encontrado text;
  v_nivel_num smallint;
  v_nivel_enig smallint;
  v_nivel_quim smallint;
  v_nivel_anat smallint;
  v_nivel_melo smallint;
  v_nivel_trig smallint;
  v_nivel_hist smallint;
  v_nivel_calc smallint;
  v_nivel_circ smallint;
  v_nivel_esta smallint;
  v_nivel_naip smallint;
  v_nivel_codi smallint;
  v_nivel_dina smallint;
  v_nivel_vita smallint;
  v_nivel_ronda smallint;
  v_sim record;
  v_bot_id uuid;
  v_bot_elo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'aleatorio') then
    raise exception 'mundo invalido';
  end if;
  if p_mundo = 'aleatorio' and not p_ranked then
    raise exception 'casual no admite todas las ciudades — siempre es duelo simple';
  end if;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  if p_ranked and p_mundo <> 'aleatorio' and v_mi_elo >= 1700 then
    raise exception 'desde Platino solo se puede jugar "Todas las ciudades" en clasificatoria';
  end if;

  delete from public.duel_queue where last_seen_at < now() - interval '2 minutes';

  insert into public.duel_queue (user_id, operation_type, elo_rating, mundo, clasificatorio, entered_at, last_seen_at)
  values (v_user, p_operation_type, v_mi_elo, p_mundo, p_ranked, now(), now())
  on conflict (user_id) do update
    set operation_type = excluded.operation_type,
        elo_rating = excluded.elo_rating,
        mundo = excluded.mundo,
        clasificatorio = excluded.clasificatorio,
        entered_at = case
          when public.duel_queue.mundo <> excluded.mundo
            or public.duel_queue.clasificatorio <> excluded.clasificatorio
            or coalesce(public.duel_queue.operation_type, '') <> coalesce(excluded.operation_type, '')
          then now()
          else public.duel_queue.entered_at
        end,
        last_seen_at = now();

  select entered_at into v_entered from public.duel_queue where user_id = v_user;
  v_segundos := greatest(0, extract(epoch from (now() - v_entered))::integer);
  v_rango := least(450, 45 + (v_segundos / 10) * 45);

  -- Ranked: rival del rango más parecido (el margen crece con la espera).
  -- Casual (0244): cualquiera que esté buscando en esa ciudad, al azar, sin
  -- mirar el ELO — es para jugar con alguien, no para medirse.
  if p_ranked then
    select * into v_rival
    from public.duel_queue q
    where q.user_id <> v_user
      and q.mundo = p_mundo
      and q.clasificatorio = p_ranked
      and abs(q.elo_rating - v_mi_elo) <= v_rango
      and q.last_seen_at >= now() - interval '10 seconds'
    order by abs(q.elo_rating - v_mi_elo) asc
    for update skip locked
    limit 1;
  else
    select * into v_rival
    from public.duel_queue q
    where q.user_id <> v_user
      and q.mundo = p_mundo
      and q.clasificatorio = false
      and q.last_seen_at >= now() - interval '10 seconds'
    order by random()
    for update skip locked
    limit 1;
  end if;

  if v_rival.user_id is null and v_mi_elo < 1700 and v_segundos >= 30 then
    select p.id, p.elo_rating, m.velocidad_ms_min, m.velocidad_ms_max, m.tasa_acierto
      into v_bot_id, v_bot_elo, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot
    from public.clan_miembros m
    join public.profiles p on p.id = m.perfil_id
    order by case when p_ranked then abs(p.elo_rating - v_mi_elo) else random() * 100000 end asc
    limit 1;
    if v_bot_id is not null then
      v_rival.user_id := v_bot_id;
      v_rival.elo_rating := v_bot_elo;
      v_es_bot := true;
    end if;
  end if;

  if v_rival.user_id is null then
    return query select null::uuid, false, v_rango, v_segundos, null::text;
    return;
  end if;

  delete from public.duel_queue where user_id in (v_user, v_rival.user_id);

  v_elo_promedio := (v_mi_elo + v_rival.elo_rating) / 2.0;

  if p_mundo = 'aleatorio' then
    v_serie_id := gen_random_uuid();
    for v_i in reverse array_length(v_mundos, 1)..2 loop
      v_j := 1 + floor(random() * v_i)::int;
      v_tmp := v_mundos[v_i];
      v_mundos[v_i] := v_mundos[v_j];
      v_mundos[v_j] := v_tmp;
    end loop;

    -- "Mejor de 3": siempre 3 rondas aunque v_mundos tenga más
    -- elementos después del shuffle.
    for v_i in 1..3 loop
      v_nivel_num := case when v_mundos[v_i] = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end;
      v_nivel_enig := case when v_mundos[v_i] = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end;
      v_nivel_quim := case when v_mundos[v_i] = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end;
      v_nivel_anat := case when v_mundos[v_i] = 'anatomia' then public.nivel_anatomia_por_rango(v_elo_promedio) else null end;
      v_nivel_melo := case when v_mundos[v_i] = 'melodia' then public.nivel_melodia_por_rango(v_elo_promedio) else null end;
      v_nivel_trig := case when v_mundos[v_i] = 'trigonometria' then public.nivel_trigonometria_por_rango(v_elo_promedio) else null end;
      v_nivel_hist := case when v_mundos[v_i] = 'historia' then public.nivel_historia_por_rango(v_elo_promedio) else null end;
      v_nivel_calc := case when v_mundos[v_i] = 'calculia' then public.nivel_calculia_por_rango(v_elo_promedio) else null end;
      v_nivel_circ := case when v_mundos[v_i] = 'circuitia' then public.nivel_circuitia_por_rango(v_elo_promedio) else null end;
      v_nivel_esta := case when v_mundos[v_i] = 'estadistica' then public.nivel_estadistica_por_rango(v_elo_promedio) else null end;
      v_nivel_naip := case when v_mundos[v_i] = 'naipia' then public.nivel_naipia_por_rango(v_elo_promedio) else null end;
      v_nivel_codi := case when v_mundos[v_i] = 'codia' then public.nivel_codia_por_rango(v_elo_promedio) else null end;
      v_nivel_dina := case when v_mundos[v_i] = 'dinamia' then public.nivel_dinamia_por_rango(v_elo_promedio) else null end;
      v_nivel_vita := case when v_mundos[v_i] = 'vitalia' then public.nivel_vitalia_por_rango(v_elo_promedio) else null end;

      insert into public.duels (
        retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo,
        modo, serie_id, ronda_numero, ronda_total,
        nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, nivel_calculia, nivel_circuitia, nivel_estadistica, nivel_naipia, nivel_codia, nivel_dinamia, nivel_vitalia, clasificatorio
      ) values (
        v_user, v_rival.user_id, floor(random() * 1000000000)::bigint,
        case when v_mundos[v_i] = 'numeria'
          then (array['suma', 'resta', 'multiplicacion', 'division'])[1 + floor(random() * 4)::int]
          else null end,
        v_mundos[v_i],
        case
          when v_mundos[v_i] = 'geografia' then public.continente_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'enigmia' then public.categoria_aleatoria_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'quimia' then public.modo_quimia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'anatomia' then public.modo_anatomia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'melodia' then public.modo_melodia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'trigonometria' then public.modo_trigonometria_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'historia' then public.modo_historia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'calculia' then public.modo_calculia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'circuitia' then public.modo_circuitia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'estadistica' then public.modo_estadistica_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'naipia' then public.modo_naipia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'codia' then public.modo_codia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'dinamia' then public.modo_dinamia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'vitalia' then public.modo_vitalia_aleatorio_por_rango(v_elo_promedio)
          else null
        end,
        'mejor_de_3', v_serie_id, v_i, 3,
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi, v_nivel_dina, v_nivel_vita,
        true
      )
      returning id into v_this_duel_id;

      if v_es_bot then
        v_nivel_ronda := coalesce(
          v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi, v_nivel_dina, v_nivel_vita,
          greatest(1, least(10, round(3 + (v_elo_promedio - 1200) / 100)))::smallint
        );
        select * into v_sim from public.simular_resultado_bot(v_nivel_ronda, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot);
        insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
        values (v_this_duel_id, v_rival.user_id, v_sim.acierto, v_sim.tiempo_promedio, v_sim.puntaje, v_sim.respuestas);
      end if;
    end loop;

    select id, mundo into v_duel_id, v_mundo_encontrado from public.duels where serie_id = v_serie_id and ronda_numero = 1;
  else
    v_nivel_num := case when p_mundo = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end;
    v_nivel_enig := case when p_mundo = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end;
    v_nivel_quim := case when p_mundo = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end;
    v_nivel_anat := case when p_mundo = 'anatomia' then public.nivel_anatomia_por_rango(v_elo_promedio) else null end;
    v_nivel_melo := case when p_mundo = 'melodia' then public.nivel_melodia_por_rango(v_elo_promedio) else null end;
    v_nivel_trig := case when p_mundo = 'trigonometria' then public.nivel_trigonometria_por_rango(v_elo_promedio) else null end;
    v_nivel_hist := case when p_mundo = 'historia' then public.nivel_historia_por_rango(v_elo_promedio) else null end;
    v_nivel_calc := case when p_mundo = 'calculia' then public.nivel_calculia_por_rango(v_elo_promedio) else null end;
    v_nivel_circ := case when p_mundo = 'circuitia' then public.nivel_circuitia_por_rango(v_elo_promedio) else null end;
    v_nivel_esta := case when p_mundo = 'estadistica' then public.nivel_estadistica_por_rango(v_elo_promedio) else null end;
    v_nivel_naip := case when p_mundo = 'naipia' then public.nivel_naipia_por_rango(v_elo_promedio) else null end;
    v_nivel_codi := case when p_mundo = 'codia' then public.nivel_codia_por_rango(v_elo_promedio) else null end;
    v_nivel_dina := case when p_mundo = 'dinamia' then public.nivel_dinamia_por_rango(v_elo_promedio) else null end;
    v_nivel_vita := case when p_mundo = 'vitalia' then public.nivel_vitalia_por_rango(v_elo_promedio) else null end;

    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo,
      nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, nivel_calculia, nivel_circuitia, nivel_estadistica, nivel_naipia, nivel_codia, nivel_dinamia, nivel_vitalia, clasificatorio
    ) values (
      v_user, v_rival.user_id, floor(random() * 1000000000)::bigint,
      case when p_mundo = 'numeria'
        then (array['suma', 'resta', 'multiplicacion', 'division'])[1 + floor(random() * 4)::int]
        else null end,
      p_mundo,
      case
        when p_mundo = 'geografia' then public.continente_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'enigmia' then public.categoria_aleatoria_por_rango(v_elo_promedio)
        when p_mundo = 'quimia' then public.modo_quimia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'anatomia' then public.modo_anatomia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'melodia' then public.modo_melodia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'trigonometria' then public.modo_trigonometria_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'historia' then public.modo_historia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'calculia' then public.modo_calculia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'circuitia' then public.modo_circuitia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'estadistica' then public.modo_estadistica_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'naipia' then public.modo_naipia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'codia' then public.modo_codia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'dinamia' then public.modo_dinamia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'vitalia' then public.modo_vitalia_aleatorio_por_rango(v_elo_promedio)
        else null
      end,
      'simple',
      v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi, v_nivel_dina, v_nivel_vita,
      p_ranked
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;

    if v_es_bot then
      v_nivel_ronda := coalesce(
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi, v_nivel_dina, v_nivel_vita,
        greatest(1, least(10, round(3 + (v_elo_promedio - 1200) / 100)))::smallint
      );
      select * into v_sim from public.simular_resultado_bot(v_nivel_ronda, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot);
      insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
      values (v_duel_id, v_rival.user_id, v_sim.acierto, v_sim.tiempo_promedio, v_sim.puntaje, v_sim.respuestas);
    end if;
  end if;

  return query select v_duel_id, true, v_rango, v_segundos, v_mundo_encontrado;
end;
$$;


-- ---------- 4) Temporadas ----------
-- Temporada n: termina con la Gran Alineación número n (cada 28 días desde el
-- 24/10/2026 23:00 UTC). La 1 empezó 28 días antes.
create or replace function public.temporada_ranked_de(p_momento timestamptz)
returns integer
language sql
immutable
as $$
  select greatest(1, floor(extract(epoch from (p_momento - (timestamptz '2026-10-24 23:00:00+00' - interval '28 days'))) / (28 * 86400))::integer + 1);
$$;

create or replace function public.fin_temporada_ranked(p_temporada integer)
returns timestamptz
language sql
immutable
as $$
  select timestamptz '2026-10-24 23:00:00+00' + (p_temporada - 1) * interval '28 days';
$$;
grant execute on function public.temporada_ranked_de(timestamptz) to anon, authenticated;
grant execute on function public.fin_temporada_ranked(integer) to anon, authenticated;

create table if not exists public.ranked_temporadas_jugador (
  user_id uuid not null references public.profiles(id) on delete cascade,
  temporada integer not null,
  elo_max integer not null,
  elo_final integer not null,
  partidas integer not null default 0,
  rango text,
  reclamada_at timestamptz,
  primary key (user_id, temporada)
);
create index if not exists ranked_temporadas_jugador_temp_idx on public.ranked_temporadas_jugador (temporada, elo_max desc);
alter table public.ranked_temporadas_jugador enable row level security;
drop policy if exists "temporadas propias" on public.ranked_temporadas_jugador;
create policy "temporadas propias" on public.ranked_temporadas_jugador for select using (auth.uid() = user_id);

-- Cada cambio de ELO cuenta como una partida de la temporada y guarda el máximo.
create or replace function public._registrar_elo_temporada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t integer := public.temporada_ranked_de(now());
begin
  if new.elo_rating is distinct from old.elo_rating then
    insert into public.ranked_temporadas_jugador as r (user_id, temporada, elo_max, elo_final, partidas)
    values (new.id, v_t, greatest(new.elo_rating, old.elo_rating), new.elo_rating, 1)
    on conflict (user_id, temporada) do update
      set elo_max = greatest(r.elo_max, excluded.elo_max), elo_final = excluded.elo_final, partidas = r.partidas + 1;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_elo_temporada on public.profiles;
create trigger profiles_elo_temporada after update of elo_rating on public.profiles
  for each row execute function public._registrar_elo_temporada();

-- Rango alcanzado en una temporada: por el ELO máximo; Prodigio si además quedó
-- entre los 100 mejores máximos de esa temporada.
create or replace function public._rango_de_temporada(p_user uuid, p_temporada integer)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when r.elo_max >= 2000 and (select count(*) from public.ranked_temporadas_jugador o where o.temporada = p_temporada and o.elo_max > r.elo_max) < 100 then 'prodigio'
    else public._rango_por_umbral(r.elo_max)
  end
  from public.ranked_temporadas_jugador r
  where r.user_id = p_user and r.temporada = p_temporada;
$$;

create or replace function public._orden_rango(p_rango text)
returns integer
language sql
immutable
as $$
  select coalesce(array_position(array['hierro', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio'], p_rango), 0);
$$;

create or replace function public._capsulas_de_temporada(p_rango text)
returns text[]
language sql
immutable
as $$
  select case p_rango
    when 'prodigio' then array['supernova', 'supernova', 'prisma']
    when 'diamante' then array['liga_oro', 'supernova']
    when 'platino' then array['liga_oro', 'estelar']
    when 'oro' then array['liga_oro']
    when 'plata' then array['liga_plata']
    when 'bronce' then array['liga_bronce']
    else array['liga']
  end;
$$;

-- Título de temporada: desde Oro.
create or replace function public._titulo_de_temporada(p_rango text)
returns text
language sql
immutable
as $$
  select case when public._orden_rango(p_rango) >= 4 then initcap(p_rango) || ' de temporada' else null end;
$$;

-- La temporada terminada más vieja que tienes sin reclamar (para el anuncio).
create or replace function public.recompensa_temporada_pendiente()
returns table (temporada integer, rango text, veces integer, elo_max integer, partidas integer, capsulas text[], titulo text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_r public.ranked_temporadas_jugador%rowtype;
  v_rango text;
begin
  if v_user is null then
    return;
  end if;
  select * into v_r from public.ranked_temporadas_jugador r
  where r.user_id = v_user and r.reclamada_at is null and r.temporada < public.temporada_ranked_de(now())
  order by r.temporada
  limit 1;
  if not found then
    return;
  end if;
  v_rango := public._rango_de_temporada(v_user, v_r.temporada);
  return query select
    v_r.temporada,
    v_rango,
    1 + (select count(*)::integer from public.ranked_temporadas_jugador o where o.user_id = v_user and o.reclamada_at is not null and public._orden_rango(o.rango) >= public._orden_rango(v_rango)),
    v_r.elo_max,
    v_r.partidas,
    public._capsulas_de_temporada(v_rango),
    public._titulo_de_temporada(v_rango);
end;
$$;
revoke execute on function public.recompensa_temporada_pendiente() from public, anon;
grant execute on function public.recompensa_temporada_pendiente() to authenticated;

create or replace function public.reclamar_temporada_ranked(p_temporada integer)
returns table (rango text, veces integer, capsulas text[], titulo text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_r public.ranked_temporadas_jugador%rowtype;
  v_rango text;
  v_veces integer;
  v_caps text[];
  v_titulo text;
  i integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_r from public.ranked_temporadas_jugador r where r.user_id = v_user and r.temporada = p_temporada for update;
  if not found then
    raise exception 'no jugaste esa temporada';
  end if;
  if v_r.reclamada_at is not null then
    raise exception 'ya reclamaste esa temporada';
  end if;
  if p_temporada >= public.temporada_ranked_de(now()) then
    raise exception 'la temporada no ha terminado';
  end if;
  v_rango := public._rango_de_temporada(v_user, p_temporada);
  select 1 + count(*)::integer into v_veces from public.ranked_temporadas_jugador o
  where o.user_id = v_user and o.reclamada_at is not null and public._orden_rango(o.rango) >= public._orden_rango(v_rango);
  update public.ranked_temporadas_jugador as r set rango = v_rango, reclamada_at = now() where r.user_id = v_user and r.temporada = p_temporada;
  v_caps := public._capsulas_de_temporada(v_rango);
  for i in 1 .. array_length(v_caps, 1) loop
    insert into public.capsulas_usuario (user_id, tipo, origen, detalle)
    values (v_user, v_caps[i], 'temporada_ranked_' || p_temporada || '_' || i, jsonb_build_object('temporada', p_temporada, 'rango', v_rango))
    on conflict (user_id, origen) do nothing;
  end loop;
  v_titulo := public._titulo_de_temporada(v_rango);
  if v_titulo is not null then
    perform public.desbloquear_titulo(v_user, 'temporada_' || v_rango, v_titulo, 'temporada');
  end if;
  return query select v_rango, v_veces, v_caps, v_titulo;
end;
$$;
revoke execute on function public.reclamar_temporada_ranked(integer) from public, anon;
grant execute on function public.reclamar_temporada_ranked(integer) to authenticated;

-- Tu mejor temporada (para Rankeds y el perfil): el rango más alto reclamado y cuántas
-- temporadas llegaste a él o más arriba (Diamante v2).
create or replace function public.mejor_temporada_ranked(p_user uuid)
returns table (rango text, veces integer)
language sql
stable
security definer
set search_path = public
as $$
  with mejor as (
    select r.rango from public.ranked_temporadas_jugador r
    where r.user_id = p_user and r.reclamada_at is not null
    order by public._orden_rango(r.rango) desc
    limit 1
  )
  select m.rango, (select count(*)::integer from public.ranked_temporadas_jugador o where o.user_id = p_user and o.reclamada_at is not null and public._orden_rango(o.rango) >= public._orden_rango(m.rango))
  from mejor m;
$$;
grant execute on function public.mejor_temporada_ranked(uuid) to authenticated;

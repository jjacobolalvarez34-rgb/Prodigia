-- ====================================================================
-- Prodigia — Tienda: "fondo personalizado" del perfil, a pedido del
-- propietario ("que el fondo de perfil pueda ser personalizado, pero
-- valga chispas"). Sexto valor de fondo_perfil (0142 solo tenía los 5
-- degradés) — el usuario sube su propia imagen para la franja superior
-- de su tarjeta de perfil, pero SOLO después de comprarlo con Chispas.
--
-- Por qué esto necesita una función security definer y NO el mismo
-- truco de columna directa que usa avatar_url (grant update (avatar_url)
-- de 0039_avatares.sql, sin RPC): avatar_url es gratis, cualquiera la
-- puede pisar con solo tener sesión. fondo_perfil_url NO — tiene que
-- estar gateada por "¿ya compraste 'personalizado' en fondos_
-- desbloqueados?", y un grant de columna directo no puede expresar esa
-- condición (solo RLS por fila, no por valor de otra columna). Por eso
-- va con su propia función guardar_fondo_perfil_url, mismo criterio que
-- elegir_fuente_nombre/elegir_marco_perfil ya usan para gatear
-- cosméticos comprados.
-- ====================================================================

-- ---------- 1) columna nueva + CHECK ampliado ----------
alter table public.profiles add column if not exists fondo_perfil_url text;

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in ('ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque', 'personalizado'));

-- ---------- 2) guardar_fondo_perfil_url: gateado por fondos_desbloqueados ----------
create or replace function public.guardar_fondo_perfil_url(p_url text)
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
    select 1 from public.profiles where id = v_user and 'personalizado' = any(fondos_desbloqueados)
  ) then
    raise exception 'todavia no compraste el fondo personalizado';
  end if;
  if p_url is not null and length(p_url) > 500 then
    raise exception 'url invalida';
  end if;
  update public.profiles set fondo_perfil_url = p_url where id = v_user;
end;
$$;

grant execute on function public.guardar_fondo_perfil_url(text) to authenticated;

-- ---------- 3) comprar_item_tienda: 1 precio nuevo en el catálogo ----------
-- Mismo return shape que 0142 (no agrega columnas) — alcanza con
-- create or replace, sin drop. La rama `elsif p_item like 'fondo_%'`
-- que ya existe desde 0142 hace todo el trabajo de desbloqueo sola
-- (replace(p_item, 'fondo_', '') = 'personalizado'), no hace falta
-- tocarla.
create or replace function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  fuentes_desbloqueadas text[],
  marcos_desbloqueados text[],
  animaciones_desbloqueadas text[],
  fondos_desbloqueados text[]
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
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
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
    when 'marco_trigonometria' then 2400
    when 'marco_historia' then 2400
    when 'paquete_marcos_mundo' then 14500
    when 'animacion_ondulante' then 1200
    when 'animacion_brillo' then 1400
    when 'animacion_arcoiris' then 1800
    when 'animacion_neon' then 2200
    when 'fondo_oceano' then 1600
    when 'fondo_bosque' then 1600
    when 'fondo_aurora' then 1600
    when 'fondo_dorado' then 1800
    when 'fondo_nebulosa' then 2000
    -- Fase 10b: tope de prestigio de los fondos — tu propia imagen,
    -- no un degradé — mismo escalón que marco_diamante/fuente_futurista.
    when 'fondo_personalizado' then 4000
    else null
  end;

  if v_costo_base is null then
    raise exception 'item invalido';
  end if;
  if p_costo < ceil(v_costo_base * 0.5) then
    raise exception 'precio invalido';
  end if;

  if p_item in ('marco_numeria', 'marco_enigmia', 'marco_geografia', 'marco_quimia', 'marco_anatomia', 'marco_melodia', 'marco_trigonometria', 'marco_historia') then
    v_mundo := replace(p_item, 'marco_', '');
    select w.nivel_mundo into v_nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = v_mundo;
    if coalesce(v_nivel_mundo, 0) < 40 then
      raise exception 'todavia no alcanzaste suficiente nivel en % para desbloquear este marco', v_mundo;
    end if;
  elsif p_item = 'paquete_marcos_mundo' then
    if exists (
      select 1 from unnest(v_mundos) m
      where coalesce((select w.nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = m), 0) < 40
    ) then
      raise exception 'todavia no alcanzaste nivel 40 en los 8 mundos';
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
  elsif p_item = 'paquete_marcos_mundo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = (select array(select distinct u from unnest(pr.marcos_desbloqueados || v_mundos) as u))
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
  elsif p_item like 'animacion_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        animaciones_desbloqueadas = case
          when (replace(p_item, 'animacion_', '')) = any(pr.animaciones_desbloqueadas)
            then pr.animaciones_desbloqueadas
          else array_append(pr.animaciones_desbloqueadas, replace(p_item, 'animacion_', ''))
        end
    where pr.id = v_user;
  elsif p_item like 'fondo_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fondos_desbloqueados = case
          when (replace(p_item, 'fondo_', '')) = any(pr.fondos_desbloqueados)
            then pr.fondos_desbloqueados
          else array_append(pr.fondos_desbloqueados, replace(p_item, 'fondo_', ''))
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
      pr.boost_multiplicador_pendiente, pr.fuentes_desbloqueadas, pr.marcos_desbloqueados,
      pr.animaciones_desbloqueadas, pr.fondos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;

-- ---------- 4) obtener_perfil_publico: + fondo_perfil_url ----------
drop function if exists public.obtener_perfil_publico(uuid);

create function public.obtener_perfil_publico(p_user_id uuid)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  marco_perfil text,
  fuente_nombre text,
  titulo_activo text,
  nivel_cuenta integer,
  elo_rating integer,
  puntos_total integer,
  created_at timestamptz,
  titulo_nombre text,
  animacion_nombre text,
  fondo_perfil text,
  fondo_perfil_url text
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
      p.titulo_activo, p.nivel_cuenta,
      p.elo_rating, p.puntos_total, p.created_at, public.titulo_nombre_de(p.id),
      p.animacion_nombre, p.fondo_perfil, p.fondo_perfil_url
    from public.profiles p
    where p.id = p_user_id and not p.es_bot;
end;
$$;

grant execute on function public.obtener_perfil_publico(uuid) to authenticated;

-- ---------- 5) bucket de Storage "fondos-perfil" ----------
-- Mismo patrón que "avatares" (0039_avatares.sql): carpeta propia por
-- user_id, público de solo lectura, tope de tamaño un poco más alto
-- (3MB — es una imagen de banner, no un ícono chico).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fondos-perfil', 'fondos-perfil', true, 3145728, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "cada quien sube su propio fondo de perfil"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fondos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cada quien reemplaza su propio fondo de perfil"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fondos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cada quien borra su propio fondo de perfil"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fondos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cualquiera lee fondos de perfil (bucket publico)"
  on storage.objects for select
  using (bucket_id = 'fondos-perfil');

notify pgrst, 'reload schema';

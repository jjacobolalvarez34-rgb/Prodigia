-- 0127: Trastienda — la Ruleta del Trastiendista versión casa de apuestas.
--
-- Reemplaza la rueda de segmentos (0121/0123/0126) por una mesa estilo casino
-- sobre la tabla periódica COMPLETA (118 elementos). Server-authoritative:
-- el server elige el elemento ganador, valida la zona, cobra/debita Chispas y
-- paga con EV de casa controlado. Sin RLS directa de la tabla de apuestas.
--
-- Decisiones aprobadas por el PO (2026-09-09):
--   - Fichas con MÁS valor (se ganan muchas Chispas jugando): 100/250/500/1000.
--   - Los premios viejos de la rueda (boost, escudo, congelamiento, fuente,
--     marco, título) se CONSERVAN como ganancia rara: ~5% en cada apuesta
--     ganada, por encima de las Chispas (bono pequeño frente al multiplicador).
--   - Mesa COMPLETA (118 elementos), no la versión ligera.
--
-- Economía: el server elige un elemento entre los 118 (fair). Si cae dentro de
-- la zona apostada el jugador gana. Con n elementos en la zona:
--   payout_total = monto × (118/n) × 0.88   (EV de casa ≈ 0.92)
--   pago = round(payout_total); mínimo 1. Zonas grandes pagan poco, el
--   elemento individual paga alto (mult ≈ 104). Límite 20 apuestas/día.

-- ---------- 1) Catálogo completo de la tabla periódica ----------
-- Este catálogo es fuente de verdad del SERVER. El cliente espeja estos datos
-- en src/lib/trastienda/casino.ts (mismos 118 elementos, misma clasificación).
-- grupo NULL solo en el bloque f (Ce..Yb, Th..No); los casos La/Lu/Ac/Lr
-- pertenecen al grupo 3 junto a Sc/Y.
create table if not exists public.trastienda_casino_elementos (
  simbolo text primary key,
  numero integer not null unique check (numero between 1 and 118),
  nombre text not null,
  periodo integer not null check (periodo between 1 and 7),
  grupo integer check (grupo between 1 and 18),
  tipo text not null check (tipo in (
    'alcalino', 'alcalinoterreo', 'transicion', 'post_transicion',
    'metaloides', 'no_metal', 'halogeno', 'gas_noble',
    'lantanido', 'actinido'
  ))
);

insert into public.trastienda_casino_elementos (simbolo, numero, nombre, periodo, grupo, tipo) values
  ('H', 1, 'Hidrógeno', 1, 1, 'no_metal'),
  ('He', 2, 'Helio', 1, 18, 'gas_noble'),
  ('Li', 3, 'Litio', 2, 1, 'alcalino'),
  ('Be', 4, 'Berilio', 2, 2, 'alcalinoterreo'),
  ('B', 5, 'Boro', 2, 13, 'metaloides'),
  ('C', 6, 'Carbono', 2, 14, 'no_metal'),
  ('N', 7, 'Nitrógeno', 2, 15, 'no_metal'),
  ('O', 8, 'Oxígeno', 2, 16, 'no_metal'),
  ('F', 9, 'Flúor', 2, 17, 'halogeno'),
  ('Ne', 10, 'Neón', 2, 18, 'gas_noble'),
  ('Na', 11, 'Sodio', 3, 1, 'alcalino'),
  ('Mg', 12, 'Magnesio', 3, 2, 'alcalinoterreo'),
  ('Al', 13, 'Aluminio', 3, 13, 'post_transicion'),
  ('Si', 14, 'Silicio', 3, 14, 'metaloides'),
  ('P', 15, 'Fósforo', 3, 15, 'no_metal'),
  ('S', 16, 'Azufre', 3, 16, 'no_metal'),
  ('Cl', 17, 'Cloro', 3, 17, 'halogeno'),
  ('Ar', 18, 'Argón', 3, 18, 'gas_noble'),
  ('K', 19, 'Potasio', 4, 1, 'alcalino'),
  ('Ca', 20, 'Calcio', 4, 2, 'alcalinoterreo'),
  ('Sc', 21, 'Escandio', 4, 3, 'transicion'),
  ('Ti', 22, 'Titanio', 4, 4, 'transicion'),
  ('V', 23, 'Vanadio', 4, 5, 'transicion'),
  ('Cr', 24, 'Cromo', 4, 6, 'transicion'),
  ('Mn', 25, 'Manganeso', 4, 7, 'transicion'),
  ('Fe', 26, 'Hierro', 4, 8, 'transicion'),
  ('Co', 27, 'Cobalto', 4, 9, 'transicion'),
  ('Ni', 28, 'Níquel', 4, 10, 'transicion'),
  ('Cu', 29, 'Cobre', 4, 11, 'transicion'),
  ('Zn', 30, 'Zinc', 4, 12, 'transicion'),
  ('Ga', 31, 'Galio', 4, 13, 'post_transicion'),
  ('Ge', 32, 'Germanio', 4, 14, 'metaloides'),
  ('As', 33, 'Arsénico', 4, 15, 'metaloides'),
  ('Se', 34, 'Selenio', 4, 16, 'no_metal'),
  ('Br', 35, 'Bromo', 4, 17, 'halogeno'),
  ('Kr', 36, 'Criptón', 4, 18, 'gas_noble'),
  ('Rb', 37, 'Rubidio', 5, 1, 'alcalino'),
  ('Sr', 38, 'Estroncio', 5, 2, 'alcalinoterreo'),
  ('Y', 39, 'Itrio', 5, 3, 'transicion'),
  ('Zr', 40, 'Circonio', 5, 4, 'transicion'),
  ('Nb', 41, 'Niobio', 5, 5, 'transicion'),
  ('Mo', 42, 'Molibdeno', 5, 6, 'transicion'),
  ('Tc', 43, 'Tecnecio', 5, 7, 'transicion'),
  ('Ru', 44, 'Rutenio', 5, 8, 'transicion'),
  ('Rh', 45, 'Rodio', 5, 9, 'transicion'),
  ('Pd', 46, 'Paladio', 5, 10, 'transicion'),
  ('Ag', 47, 'Plata', 5, 11, 'transicion'),
  ('Cd', 48, 'Cadmio', 5, 12, 'transicion'),
  ('In', 49, 'Indio', 5, 13, 'post_transicion'),
  ('Sn', 50, 'Estaño', 5, 14, 'post_transicion'),
  ('Sb', 51, 'Antimonio', 5, 15, 'metaloides'),
  ('Te', 52, 'Teluro', 5, 16, 'metaloides'),
  ('I', 53, 'Yodo', 5, 17, 'halogeno'),
  ('Xe', 54, 'Xenón', 5, 18, 'gas_noble'),
  ('Cs', 55, 'Cesio', 6, 1, 'alcalino'),
  ('Ba', 56, 'Bario', 6, 2, 'alcalinoterreo'),
  ('La', 57, 'Lantano', 6, 3, 'lantanido'),
  ('Ce', 58, 'Cerio', 6, null, 'lantanido'),
  ('Pr', 59, 'Praseodimio', 6, null, 'lantanido'),
  ('Nd', 60, 'Neodimio', 6, null, 'lantanido'),
  ('Pm', 61, 'Prometio', 6, null, 'lantanido'),
  ('Sm', 62, 'Samario', 6, null, 'lantanido'),
  ('Eu', 63, 'Europio', 6, null, 'lantanido'),
  ('Gd', 64, 'Gadolinio', 6, null, 'lantanido'),
  ('Tb', 65, 'Terbio', 6, null, 'lantanido'),
  ('Dy', 66, 'Disprosio', 6, null, 'lantanido'),
  ('Ho', 67, 'Holmio', 6, null, 'lantanido'),
  ('Er', 68, 'Erbio', 6, null, 'lantanido'),
  ('Tm', 69, 'Tulio', 6, null, 'lantanido'),
  ('Yb', 70, 'Iterbio', 6, null, 'lantanido'),
  ('Lu', 71, 'Lutecio', 6, 3, 'lantanido'),
  ('Hf', 72, 'Hafnio', 6, 4, 'transicion'),
  ('Ta', 73, 'Tántalo', 6, 5, 'transicion'),
  ('W', 74, 'Wolframio', 6, 6, 'transicion'),
  ('Re', 75, 'Renio', 6, 7, 'transicion'),
  ('Os', 76, 'Osmio', 6, 8, 'transicion'),
  ('Ir', 77, 'Iridio', 6, 9, 'transicion'),
  ('Pt', 78, 'Platino', 6, 10, 'transicion'),
  ('Au', 79, 'Oro', 6, 11, 'transicion'),
  ('Hg', 80, 'Mercurio', 6, 12, 'transicion'),
  ('Tl', 81, 'Talio', 6, 13, 'post_transicion'),
  ('Pb', 82, 'Plomo', 6, 14, 'post_transicion'),
  ('Bi', 83, 'Bismuto', 6, 15, 'post_transicion'),
  ('Po', 84, 'Polonio', 6, 16, 'post_transicion'),
  ('At', 85, 'Ástato', 6, 17, 'halogeno'),
  ('Rn', 86, 'Radón', 6, 18, 'gas_noble'),
  ('Fr', 87, 'Francio', 7, 1, 'alcalino'),
  ('Ra', 88, 'Radio', 7, 2, 'alcalinoterreo'),
  ('Ac', 89, 'Actinio', 7, 3, 'actinido'),
  ('Th', 90, 'Torio', 7, null, 'actinido'),
  ('Pa', 91, 'Protactinio', 7, null, 'actinido'),
  ('U', 92, 'Uranio', 7, null, 'actinido'),
  ('Np', 93, 'Neptunio', 7, null, 'actinido'),
  ('Pu', 94, 'Plutonio', 7, null, 'actinido'),
  ('Am', 95, 'Americio', 7, null, 'actinido'),
  ('Cm', 96, 'Curio', 7, null, 'actinido'),
  ('Bk', 97, 'Berkelio', 7, null, 'actinido'),
  ('Cf', 98, 'Californio', 7, null, 'actinido'),
  ('Es', 99, 'Einstenio', 7, null, 'actinido'),
  ('Fm', 100, 'Fermio', 7, null, 'actinido'),
  ('Md', 101, 'Mendelevio', 7, null, 'actinido'),
  ('No', 102, 'Nobelio', 7, null, 'actinido'),
  ('Lr', 103, 'Laurencio', 7, 3, 'actinido'),
  ('Rf', 104, 'Rutherfordio', 7, 4, 'transicion'),
  ('Db', 105, 'Dubnio', 7, 5, 'transicion'),
  ('Sg', 106, 'Seaborgio', 7, 6, 'transicion'),
  ('Bh', 107, 'Bohrio', 7, 7, 'transicion'),
  ('Hs', 108, 'Hassio', 7, 8, 'transicion'),
  ('Mt', 109, 'Meitnerio', 7, 9, 'transicion'),
  ('Ds', 110, 'Darmstadtio', 7, 10, 'transicion'),
  ('Rg', 111, 'Roentgenio', 7, 11, 'transicion'),
  ('Cn', 112, 'Copernicio', 7, 12, 'transicion'),
  ('Nh', 113, 'Nihonio', 7, 13, 'post_transicion'),
  ('Fl', 114, 'Flerovio', 7, 14, 'post_transicion'),
  ('Mc', 115, 'Moscovio', 7, 15, 'post_transicion'),
  ('Lv', 116, 'Livermorio', 7, 16, 'post_transicion'),
  ('Ts', 117, 'Teneso', 7, 17, 'halogeno'),
  ('Og', 118, 'Oganesón', 7, 18, 'gas_noble');

-- ---------- 2) Tabla de apuestas (el log del casino) ----------
create table if not exists public.trastienda_casino (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  fecha date not null default current_date,
  zona text not null,
  apuesta_numero integer not null check (apuesta_numero between 1 and 20),
  monto integer not null,
  elegido text not null,             -- símbolo que el server eligió (fair sobre 118)
  ganaste boolean not null,
  pago integer not null default 0,   -- Chispas pagadas por la apuesta ganada
  premio_tipo text,
  premio_detalle jsonb,
  creado_at timestamptz not null default now(),
  constraint trastienda_casino_solo_propia check (user_id = auth.uid())
);

alter table public.trastienda_casino enable row level security;

create policy "trastienda_casino: lectura propia" on public.trastienda_casino
  for select using (auth.uid() = user_id);

-- ---------- 3) Miembros de una zona ----------
-- Devuelve los símbolos que pertenecen a la zona; valida la zona (raise si no).
-- NO se expone como RPC a clientes (el conteo en el cliente se espeja en TS).
-- Formas válidas: elemento:X | grupo:1..18 | grupo:transicion | periodo:1..7 |
-- tipo:<tipo> | paridad:par | paridad:impar.
create or replace function public.casino_elementos_en_zona(p_zona text)
returns table (simbolo text)
language plpgsql
stable
set search_path = public
as $$
declare
  v_valor text;
  v_num integer;
begin
  if p_zona is null then
    raise exception 'zona invalida';
  end if;

  v_valor := nullif(substring(p_zona from 'elemento:(.*)'), '');
  if v_valor is not null then
    return query select e.simbolo from public.trastienda_casino_elementos e
      where upper(e.simbolo) = upper(v_valor);
    return;
  end if;

  v_valor := nullif(substring(p_zona from 'grupo:([0-9]+)'), '');
  if v_valor is not null then
    v_num := v_valor::int;
    if v_num not between 1 and 18 then
      raise exception 'zona invalida';
    end if;
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.grupo = v_num;
    return;
  end if;

  if p_zona = 'grupo:transicion' then
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.tipo = 'transicion';
    return;
  end if;

  v_valor := nullif(substring(p_zona from 'periodo:([0-9]+)'), '');
  if v_valor is not null then
    v_num := v_valor::int;
    if v_num not between 1 and 7 then
      raise exception 'zona invalida';
    end if;
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.periodo = v_num;
    return;
  end if;

  v_valor := nullif(substring(p_zona from 'tipo:(.*)'), '');
  if v_valor is not null then
    if v_valor not in (
      'alcalino', 'alcalinoterreo', 'transicion', 'post_transicion',
      'metaloides', 'no_metal', 'halogeno', 'gas_noble',
      'lantanido', 'actinido'
    ) then
      raise exception 'zona invalida';
    end if;
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.tipo = v_valor;
    return;
  end if;

  if p_zona = 'paridad:par' then
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.numero % 2 = 0;
    return;
  end if;
  if p_zona = 'paridad:impar' then
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.numero % 2 = 1;
    return;
  end if;

  raise exception 'zona invalida';
end;
$$;

-- ---------- 4) La apuesta ----------
create or replace function public.apostar_casino_elementos(p_zona text, p_monto integer)
returns table (
  zona text,
  monto integer,
  elegido text,
  elegido_nombre text,
  ganaste boolean,
  multiplier numeric,
  chispas_ganadas integer,
  premio_tipo text,
  premio_detalle jsonb,
  apuestas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuestas_hoy integer;
  v_n integer;
  v_elegido text;
  v_elegido_nombre text;
  v_ganaste boolean := false;
  v_mult numeric := 0;
  v_pago integer := 0;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_premio_idx integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido_item text;
  v_titulo_slug text;
  v_titulo_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto not in (100, 250, 500, 1000) then
    raise exception 'monto de ficha invalido';
  end if;

  select count(*) into v_apuestas_hoy
  from public.trastienda_casino
  where user_id = v_user and fecha = current_date;

  if v_apuestas_hoy >= 20 then
    raise exception 'ya apostaste las 20 veces de hoy — vuelve mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa ficha';
  end if;

  select count(*) into v_n from public.casino_elementos_en_zona(p_zona);
  if v_n is null or v_n = 0 then
    raise exception 'zona invalida';
  end if;

  -- El croupier elige un elemento al azar entre los 118 (fair).
  select e.simbolo, e.nombre into v_elegido, v_elegido_nombre
  from public.trastienda_casino_elementos e
  order by random()
  limit 1;

  select exists (
    select 1 from public.casino_elementos_en_zona(p_zona) m where m.simbolo = v_elegido
  ) into v_ganaste;

  -- Se descuenta la ficha siempre.
  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

  if v_ganaste then
    -- payout_total = monto × (118/n) × 0.88 → EV de casa ≈ 0.92.
    v_mult := round((118.0 / v_n) * 0.88, 2);
    v_pago := greatest(round(p_monto * v_mult::numeric), 1);
    update public.profiles set puntos_total = puntos_total + v_pago where id = v_user;

    -- Ganancia rara (~5%): un premio de la rueda vieja, por ENCIMA de las Chispas.
    if random() < 0.05 then
      v_premio_idx := 1 + floor(random() * 6)::int;
      if v_premio_idx = 1 then
        update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'boost');
      elsif v_premio_idx = 2 then
        update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'escudo');
      elsif v_premio_idx = 3 then
        update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'congelamiento');
      elsif v_premio_idx = 4 then
        select coalesce(array_agg(f), array[]::text[]) into v_disponibles
        from unnest(v_fuentes) t(f)
        where not (f = any (coalesce(
          (select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user),
          array[]::text[]
        )));
        if cardinality(v_disponibles) = 0 then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 200, 'fallback', true);
          update public.profiles set puntos_total = puntos_total + 200 where id = v_user;
          v_pago := v_pago + 200;
        else
          v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
          update public.profiles
          set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido_item]
          where id = v_user;
          v_premio_tipo := 'fuente';
          v_premio_detalle := jsonb_build_object('fuente', v_elegido_item);
        end if;
      elsif v_premio_idx = 5 then
        select coalesce(array_agg(m), array[]::text[]) into v_disponibles
        from unnest(v_marcos) t(m)
        where not (m = any (coalesce(
          (select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user),
          array[]::text[]
        )));
        if cardinality(v_disponibles) = 0 then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 300, 'fallback', true);
          update public.profiles set puntos_total = puntos_total + 300 where id = v_user;
          v_pago := v_pago + 300;
        else
          v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
          update public.profiles
          set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido_item]
          where id = v_user;
          v_premio_tipo := 'marco';
          v_premio_detalle := jsonb_build_object('marco', v_elegido_item);
        end if;
      else
        -- título: de la base de Trastienda que el usuario todavía no tenga.
        select t.slug into v_titulo_slug
        from public.titulos_trastienda_base() t
        where t.slug not in (
          select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
        )
        order by random()
        limit 1;
        if v_titulo_slug is null then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 200, 'fallback', true);
          update public.profiles set puntos_total = puntos_total + 200 where id = v_user;
          v_pago := v_pago + 200;
        else
          v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
          perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
          v_premio_tipo := 'titulo';
          v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
        end if;
      end if;
    end if;
  end if;

  insert into public.trastienda_casino
    (user_id, zona, apuesta_numero, monto, elegido, ganaste, pago, premio_tipo, premio_detalle)
  values
    (v_user, p_zona, v_apuestas_hoy + 1, p_monto, v_elegido, v_ganaste, v_pago, v_premio_tipo, v_premio_detalle);

  return query select
    p_zona,
    p_monto,
    v_elegido,
    v_elegido_nombre,
    v_ganaste,
    v_mult,
    v_pago,
    v_premio_tipo,
    v_premio_detalle,
    v_apuestas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

-- ---------- 5) Historial reciente incluye el casino ----------
create or replace function public.fetch_trastienda_historial()
returns table (
  tipo text,
  titulo text,
  detalle jsonb,
  monto integer,
  creado_at timestamptz
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
    with r as (
      select 'ruleta'::text as tipo, r.segmento as titulo, r.premio_detalle as detalle,
        coalesce((r.premio_detalle->>'chispas')::integer, 0) as monto, r.creado_at
      from public.trastienda_ruleta r
      where r.user_id = v_user
    ),
    c as (
      select 'casino'::text as tipo, c.zona as titulo,
        jsonb_build_object('elegido', c.elegido, 'ganaste', c.ganaste) as detalle,
        c.pago as monto, c.creado_at
      from public.trastienda_casino c
      where c.user_id = v_user
    ),
    m as (
      select 'minijuego'::text as tipo, m.juego as titulo, m.resultado as detalle,
        m.salida as monto, m.creado_at
      from public.trastienda_minijuegos m
      where m.user_id = v_user
    ),
    p as (
      select 'pizarra'::text as tipo, 'la_pizarra'::text as titulo,
        jsonb_build_object('estado', p.estado, 'intentos', p.intentos) as detalle,
        case when p.estado = 'ganado'
          then case when p.intentos <= 3 then 170 when p.intentos <= 5 then 100 else 50 end
          else 0 end as monto,
        p.creado_at
      from public.trastienda_pizarra p
      where p.user_id = v_user
    )
    select * from r
    union all select * from c
    union all select * from m
    union all select * from p
    order by creado_at desc
    limit 8;
end;
$$;

-- ---------- 6) Grants ----------
grant execute on function public.apostar_casino_elementos(text, integer) to authenticated;
grant execute on function public.fetch_trastienda_historial() to authenticated;
grant select on public.trastienda_casino to authenticated;
-- public.trastienda_casino_elementos y casino_elementos_en_zona: sin grants
-- (el cliente espeja el catálogo en TS; el conteo se calcula allá).

notify pgrst, 'reload schema';
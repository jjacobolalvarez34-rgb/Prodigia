-- ====================================================================
-- Prodigia — Página de venta a colegios (/docentes), pedido en vivo
-- (2026-09-15): "en base a [las estadísticas], también diseñar el tema
-- de docentes, de venta a colegios". No existe todavía infraestructura
-- de facturación B2B real (marcado como fuera de alcance en el plan de
-- pagos aprobado), así que esto es una página de venta + formulario de
-- contacto que deja un lead para que el dueño haga seguimiento a mano
-- — no una compra real ni un dashboard multi-alumno (eso no existe
-- todavía, la página es honesta al respecto: dice "piloto").
--
-- Tabla de solo-escritura desde el público: cualquiera (incluso sin
-- sesión) puede INSERTAR un lead, nadie puede LEER los de otros —ni
-- siquiera el propio remitente— desde el cliente. El dueño los revisa
-- desde el dashboard de Supabase (o un script con service_role), no
-- hace falta una RPC ni una UI de administración para esto todavía.
-- ====================================================================

create table public.leads_colegios (
  id bigint generated always as identity primary key,
  nombre_colegio text not null,
  nombre_contacto text not null,
  email text not null,
  telefono text,
  num_estudiantes_aprox integer,
  mensaje text,
  created_at timestamptz not null default now()
);

alter table public.leads_colegios enable row level security;

-- Cualquiera puede dejar un lead (visitante sin sesión incluido) —
-- nada de auth.uid() acá porque no hay usuario, es un formulario público.
create policy "insertar_lead_colegio"
  on public.leads_colegios for insert
  to anon, authenticated
  with check (true);

-- A propósito, sin policy de select para anon/authenticated: nadie
-- puede leer estos leads desde el cliente, ni siquiera los propios.

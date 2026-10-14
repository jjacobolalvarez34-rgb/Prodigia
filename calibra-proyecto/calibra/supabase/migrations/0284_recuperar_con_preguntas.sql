-- ============================================================
-- Prodigia — Recuperar la contraseña con preguntas (0284).
--
-- Pedido del 2026-10-14: sin proveedor de correo, «olvidé mi contraseña» se hace con
-- 3 preguntas (¿Google?, tus dos primeros mundos, tu correo entre opciones). Al tercer
-- intento fallido la recuperación de ese nombre de usuario queda bloqueada y hay que
-- escribir a soporte. Si acierta, se guarda un permiso de un solo uso (solo su hash)
-- que vence a los 10 minutos para cambiar la contraseña.
--
-- Endurecido tras la revisión del 2026-10-14:
--   - Los intentos se cuentan por nombre de usuario (su hash), exista o no la cuenta:
--     la respuesta es idéntica y no se puede averiguar qué nombres existen.
--   - Límite por conexión (hash de la IP): 20 intentos por hora.
-- Solo la usan las rutas /api/recuperar/* con la clave de servicio: RLS encendido y
-- sin políticas, así ningún cliente puede leerlas ni escribirlas. Idempotente.
-- ============================================================

-- Permiso de cambio de contraseña (por cuenta).
create table if not exists public.recuperacion_cuentas (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  permiso_hash text,
  permiso_vence_at timestamptz,
  actualizado_at timestamptz not null default now()
);

-- Intentos por nombre de usuario (hash), existan o no.
create table if not exists public.recuperacion_intentos (
  clave text primary key,
  intentos smallint not null default 0,
  bloqueada_at timestamptz,
  actualizado_at timestamptz not null default now()
);

-- Intentos por conexión (hash de la IP), en ventanas de una hora.
create table if not exists public.recuperacion_ips (
  ip_hash text primary key,
  intentos integer not null default 0,
  ventana_desde timestamptz not null default now()
);

alter table public.recuperacion_cuentas enable row level security;
alter table public.recuperacion_intentos enable row level security;
alter table public.recuperacion_ips enable row level security;
revoke all on public.recuperacion_cuentas from anon, authenticated;
revoke all on public.recuperacion_intentos from anon, authenticated;
revoke all on public.recuperacion_ips from anon, authenticated;

notify pgrst, 'reload schema';

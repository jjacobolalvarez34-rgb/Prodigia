-- ============================================================
-- Prodigia — Recuperar la contraseña con preguntas (0284).
--
-- Pedido del 2026-10-14: sin proveedor de correo, «olvidé mi contraseña» se hace con
-- 3 preguntas (¿Google?, tus dos primeros mundos, tu correo entre opciones). Esta
-- tabla lleva los intentos: al tercero fallido la recuperación queda bloqueada y hay
-- que escribir a soporte. Si acierta, se guarda un permiso de un solo uso (solo su
-- hash) que vence a los 10 minutos para cambiar la contraseña.
-- Solo la usan las rutas /api/recuperar/* con la clave de servicio: RLS encendido y
-- sin políticas, así ningún cliente la puede leer ni escribir. Idempotente.
-- ============================================================

create table if not exists public.recuperacion_cuentas (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  intentos smallint not null default 0,
  bloqueada_at timestamptz,
  permiso_hash text,
  permiso_vence_at timestamptz,
  actualizado_at timestamptz not null default now()
);

alter table public.recuperacion_cuentas enable row level security;
revoke all on public.recuperacion_cuentas from anon, authenticated;

notify pgrst, 'reload schema';

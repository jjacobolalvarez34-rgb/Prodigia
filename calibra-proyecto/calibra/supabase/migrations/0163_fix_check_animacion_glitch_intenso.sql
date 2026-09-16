-- Bug real (2026-09-15): "compré glitch intenso, lo puse, después puse
-- otro, y al querer volver a glitch intenso me aparece 'algo salió
-- mal'" — al agregar la animación 'glitch_intenso' (0161) se actualizó
-- comprar_item_tienda (para que la compra funcionara) pero se olvidó
-- actualizar profiles_animacion_nombre_check, el CHECK que valida qué
-- puede guardarse en profiles.animacion_nombre — 'glitch_intenso' NO
-- estaba en la lista, así que elegir_animacion_nombre() (0142) podía
-- comprarla y agregarla a animaciones_desbloqueadas (un array, sin
-- CHECK) pero el UPDATE final a animacion_nombre siempre rompía contra
-- el constraint. Se agrega acá, junto a las demás.
alter table public.profiles drop constraint if exists profiles_animacion_nombre_check;
alter table public.profiles add constraint profiles_animacion_nombre_check
  check (animacion_nombre in ('ninguna', 'arcoiris', 'brillo', 'ondulante', 'neon', 'prisma', 'glitch', 'glitch_intenso', 'deconstruccion', 'shuffle', 'decrypted'));

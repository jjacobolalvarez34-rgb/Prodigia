-- ============================================================
-- Prodigia — Anuncio de la tienda ampliada y las recompensas (0248, 0249),
-- web y app (docs/economy/PROPUESTA_TIENDA_Y_RECOMPENSAS.md). Mismo sistema de
-- anuncios que los mundos nuevos (0065). Aplicar después de 0248 y 0249.
-- ============================================================

insert into public.anuncios (tipo, titulo, descripcion) values
(
  'actualizacion',
  'Llegaron las Recompensas: cápsulas, misiones y calendario',
  'Cada día tienes 3 misiones nuevas, un calendario de 7 días y una cápsula gratis por jugar. También ganas cápsulas al subir de nivel, con tu racha, en la liga y al avanzar en cada ciudad. Antes de abrir una puedes ver qué puede salir y con qué probabilidad. Las cápsulas no se compran: solo se ganan jugando. Búscalas en Recompensas.'
),
(
  'actualizacion',
  'Bazar ampliado: estelas, efectos, sonidos, emotes y más',
  'Ahora puedes cambiar la llama de tu racha, lo que estalla al acertar y el sonido de tus aciertos. También hay emotes para tus duelos, tu ciudad en la Placa, títulos, un marco nuevo cada mes, paquetes con descuento, la Pista y la Segunda oportunidad. Completa las 6 piezas de una ciudad y ganas su marco animado. Puedes regalarle a un amigo 1 hielo o 1 escudo por día.'
);

# PERFIL-PERSONALIZACION — Guía de publicidad de la personalización del perfil

> Versión 2026-09-25. Guía para quien diseña las piezas (incluido el agente de captura y diseño de `opencode`): qué se puede personalizar de verdad, cuánto cuesta, dónde se ve, qué capturar y qué NO prometer.
> Fuentes: `src/lib/tienda/costos.ts` (precios), `src/types/database.ts` (catálogo y reglas), `src/app/[locale]/tienda/TiendaClient.tsx` (vidriera), `src/app/[locale]/perfil/**` (edición), `messages/es.json` (copy real de la app).
> Etiquetas de la Regla de oro (`README.md`): todo lo de este documento es `VERIFICADO EN CÓDIGO` salvo donde diga `HIPÓTESIS`.

## 1. La idea en una frase

**Tu perfil es tu tarjeta de presentación en Prodigia, y se decora con lo que ganas jugando.** Marcos, fuentes, animaciones y fondos se compran con Chispas (la moneda que se gana practicando) y no cambian nada de las partidas: son puro estilo.

Frase gancho alternativa: *"Juega, gana Chispas y diseña tu tarjeta"*.

## 2. Qué se puede personalizar (inventario verificado)

Todos los precios están en **Chispas** (la moneda del juego, se gana practicando). Una partida típica da unas 100-130 Chispas (`costos.ts`, comentario de cabecera), así que el catálogo funciona como una meta de mediano plazo, no de un día.

| Qué | Cuántos | Precio (Chispas) | Notas |
|---|---|---|---|
| **Foto de perfil** | tu imagen | sin costo | PNG, JPG, WEBP o GIF, hasta 2 MB (`Perfil.subirAvatar`) |
| **Nombre** | editable | cuesta Chispas cambiarlo | el costo lo muestra la propia app (`Perfil.nombreEditable.costoCambiar`) |
| **Marcos de rango** | 6 | bronce 1000 · plata 1300 · oro 1700 · platino 2200 · diamante 3200 · prodigio 5000 | el de Prodigio es el tope de prestigio |
| **Marcos neón** | 3 (violeta, cian, magenta) | 6000 cada uno | un escalón sobre Prodigio; efecto de luz neón |
| **Marcos de ciudad** | 13 (uno por ciudad) | 2400 cada uno | además de las Chispas hay que tener **nivel 40 en esa ciudad**: en la vidriera aparecen bloqueados hasta entonces |
| **Colección de Mundos** | 1 paquete | 23400 | los 13 marcos de ciudad juntos (unos 25 % menos que sueltos); exige nivel 40 en las 13 ciudades |
| **Fuentes del nombre** | 8 | mono 1000 · impacto 1200 · urbana 1200 · serif 1400 · script 1800 · elegante 1800 · futurista 2500 · manuscrita 5000 | cambian cómo se ve tu nombre en tu perfil, el ranking y las tarjetas |
| **Animaciones del nombre** | 9 + 1 Pro | ondulante 1200 · brillo 1400 · arcoíris 1800 · glitch 2000 · neón 2200 · deconstrucción 2400 · glitch intenso 2600 · shuffle 2800 · decrypted 2800 · prisma 3000 (solo Pro) | shuffle y decrypted usan animación real por instancia: solo se ven en el perfil (propio o público), no en listados |
| **Color del nombre** | 1 desbloqueo, color libre | 1800 | se elige y se puede quitar (`Perfil.colorNombre`) |
| **Fondos de la tarjeta de perfil** | 6 + 1 Pro | océano 1600 · bosque 1600 · aurora 1600 · dorado 1800 · nebulosa 2000 · personalizado 4000 · prodigio 3000 (solo Pro) | el personalizado es **tu propia imagen** (hasta 3 MB); comprarlo no muestra nada hasta que subes la imagen |
| **Títulos** | los que ganes | se ganan subiendo de rango en Rankeds | eliges cuál se muestra junto a tu nombre; activar uno no borra los demás |
| **Ciudades favoritas** | las que elijas | sin costo | banner con tu nivel REAL en cada ciudad, no uno inventado (`Perfil.banner`) |

Además, el perfil muestra sin personalizar (datos reales que también sirven de contenido): **nivel de cuenta**, **rango de duelos** (Bronce → Prodigio, por ELO), **racha**, **logros**, **récords personales**, **clan con su estandarte** y el **puesto en el ranking histórico de experiencia**.

### Tarjeta Prodigia (Social)
Cada amigo se muestra como una tarjeta vertical con su avatar, nombre, rango, título, nivel y Chispas, en una cuadrícula de 2 columnas (`PlacaAmigo`, variante `tarjeta`). Toda la personalización de arriba se ve ahí. Es el mejor formato para "mira cómo se ve mi perfil frente al de mis amigos".

## 3. Dónde se ve la personalización (para elegir la captura)

| Lugar | Ruta | Qué luce |
|---|---|---|
| Perfil propio | `/perfil` | marco, fuente, animación, color, fondo, títulos, banner de ciudades |
| Perfil público de otra persona | `/perfil/[userId]` | lo mismo, visto desde afuera (incluye shuffle y decrypted) |
| Vidriera de la Tienda | `/tienda` | catálogo con vista previa de cada estilo, bloqueos por nivel de ciudad |
| Ranking semanal | `/leaderboard` | nombre con fuente/animación/color, marco |
| Amigos | `/amigos` | tarjetas Prodigia en 2 columnas |
| Duelos y Rankeds | pantalla VS y resultados | nombre + título + rango |

Para capturas oscuras y claras existen los directorios `assets/pantallas-reales/` y `assets/pantallas-oscuras/`; los scripts de captura están en `scripts/marketing-capturas-*.mjs`. Una cuenta de prueba con todo comprado sirve para fotografiar cada estilo (compras solo con Chispas del juego).

## 4. Mensajes que SÍ se pueden decir (verificados)

- "Tu perfil es tuyo: marco, fuente, animación y fondo."
- "Gana Chispas jugando y estréname un estilo." (las Chispas se ganan practicando)
- "13 marcos, uno por ciudad: se desbloquean al llegar a nivel 40 en esa ciudad." *(el bloqueo por nivel de ciudad es real, no solo el precio)*
- "Sube una imagen tuya de fondo." (fondo personalizado)
- "Tu nombre en glitch, en neón o en arcoíris."
- "Muestra tus ciudades favoritas con tu nivel real."
- "Un cosmético no cambia la partida: ganas por lo que sabes, no por lo que compras."

## 5. Lo que NO se debe decir o mostrar

- **No prometer nada que se pague con dinero real.** Lo que hoy es verificable: los cosméticos se compran con Chispas ganadas jugando. La infraestructura de pagos existe en el código, pero no se ha validado un lanzamiento de venta: cualquier mención a comprar Chispas es `HIPÓTESIS` (ver `VOZ-TONO.md`, anti-glosario).
- **Pro:** dos cosméticos son exclusivos de Pro (animación *prisma* y fondo *prodigio*). Solo mencionarlos si el equipo ya decidió comunicar Pro como beneficio; si no, no aparecen en piezas públicas.
- **Trastienda / apuestas:** no usar la Trastienda ni el lenguaje de apuestas para hablar de "ganar Chispas para el perfil". Las Chispas se ganan **practicando**.
- **Feed social:** está desactivado en la app; no mostrar capturas del feed.
- **Nada de "el mejor perfil gana".** No hay ranking de estilo ni votación; tampoco se afirma que un cosmético dé ventaja.
- Voseo, peninsular y modismos de un solo país: fuera (`VOZ-TONO.md`). Tuteo neutro: "tienes", "elige", "mira", "haz".

## 5b. Reglas de diseño para las piezas

- Colores y logos: los de cada ciudad (`LOGO-CIUDADES.md`; hex en `src/lib/mundos.ts:19-33`). En piezas sobre un marco de ciudad, usar el color de esa ciudad.
- Botones y CTA: el diseño de pastilla con placa de ícono de la app (`Boton`), color violeta `#6C4CF1` por defecto o el de la ciudad.
- Capturar siempre estados reales (nada retocado a mano en Figma): la regla de oro es no inventar. Si se necesita un perfil "vistoso", usar la cuenta QA con las compras hechas.
- Números en fuente mono y en texto claro: "2400 Chispas", "nivel 40", "13 ciudades".
- Ejes de tema: hacer cada pieza en clara y en oscura (`pieza-oscura-*` ya existe como plantilla).

## 6. Ideas de piezas (para el archivo `assets/piezas/`, mismo estilo de nombres `cNN-…-square/story`)

| Pieza | Formato | Guion | Captura necesaria |
|---|---|---|---|
| **"Antes y después"** | Reel / story | perfil por defecto → perfil con marco + fuente + fondo | `/perfil` en dos estados |
| **"Tu nombre, en 9 animaciones"** | Reel corto | el mismo nombre en glitch, neón, arcoíris, ondulante, deconstrucción… | 9 capturas o una grabación del nombre en `/perfil` |
| **"13 marcos, 13 ciudades"** | Carrusel | un marco por diapositiva, con la condición "nivel 40 en Numeria", etc. | vidriera `/tienda`, marcos de ciudad |
| **"Sube tu propia imagen de fondo"** | Story con encuesta | "¿qué pondrías de fondo?" | perfil con `fondo_personalizado` |
| **"Tu tarjeta Prodigia"** | Post | tarjeta vertical de amigo con nivel, Chispas y rango | `/amigos` (2 columnas) |
| **"Ciudades favoritas"** | Post | banner con niveles reales de tus ciudades | `/perfil`, banner |
| **"La Colección de Mundos"** | Carrusel aspiracional | los 13 marcos juntos, "juega las 13 ciudades" | vidriera con el paquete |

Hooks (tuteo neutro, máx. 3 palabras en el CTA):
1. "Tu perfil, a tu estilo." → CTA: *Diséñalo ya*
2. "Gana Chispas. Estrena estilo." → CTA: *Juega hoy*
3. "¿Marco de qué ciudad llevas?" → CTA: *Elige tu ciudad*
4. "Tu nombre puede hacer glitch." → CTA: *Míralo aquí*
5. "13 ciudades, 13 marcos." → CTA: *Desbloquéalos*

## 7. Checklist antes de publicar

- [ ] Cada estilo mostrado existe en `costos.ts` / vidriera (y el precio, si se cita, coincide).
- [ ] Ningún cosmético se presenta como ventaja de juego.
- [ ] Sin dinero real, sin apuestas, sin Pro salvo decisión expresa.
- [ ] Tuteo neutro y ortografía revisados (`VOZ-TONO.md`, checklist de normalización).
- [ ] Pieza en tema claro y oscuro; textos legibles a 360 px de ancho en la versión story.
- [ ] Capturas con cuenta real de prueba, no maquetadas.

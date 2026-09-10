# TERMINOLOGY — Español neutro latinoamericano (Prodigia)

> Última actualización: 2026-09-09 (mega-sprint F3).
> Decisión de producto: el texto visible de Prodigia usa **español neutro latinoamericano**
> (tuteo), sin rioplatense/voseo. El código fuente y los comentarios internos NO son
> obligatorios de esta regla — solo lo que un usuario lee.

## Pronombres y conjugaciones

| Rioplatense / voseo (NO usar) | Neutro latinoamericano (USAR) |
|---|---|
| vos | tú (implícito) |
| tenés | tienes |
| podés | puedes |
| querés | quieres |
| sabés | sabes |
| necesitás | necesitas |
| sos | eres |
| andá | anda |
| mirá | mira |
| elegí | elige |
| probá | prueba |
| intentá | intenta |
| completá | completa |
| empezá | empieza |
| seguí | sigue |
| vení | ven |
| decí | di |
| poné | pon |
| hacé | haz |
| salí | sal |
| llegá | llega |
| sumate | súmate |
| confirmalo | confírmalo |
| probalo | pruébalo |
| buscalos | búscalos |
| retalos | rétalos |
| (a) vos mismo | (a) ti mismo |
| apretés | aprietes |
| perdés | pierdes |
| jugás | juegas |
| dominás | dominas |
| conocés | conoces |
| comparás | comparas |
| identificás | identificas |
| practicás | practicas |
| subí | sube |
| saltá | salta |
| aceptá | acepta |
| creá | crea |
| gastá | gasta |
| esperá | espera |
| contá | cuenta |

## Formas que NO son voseo (no tocar)

- **estás / está** — idénticas en voseo y tuteo.
- **más** — adverbio, no voseo.
- **elegiste / jugaste / ganaste / perdiste** — pretérito, idéntico en ambas.
- **vas / puedes / tienes** como presente indicativo neutro.

## Criterios

- **Solo texto visible**: `messages/{es,en}.json`, strings de componentes/páginas, mensajes de
  API (`NextResponse.json error`) y mensajes de negocio del backend (`raise exception`).
- **No sustitución automática absurda**: cada token se mapea por palabra completa con límites
  Unicode-aware (lookarounds `(?<![\p{L}\p{N}_])…(?![…])`), nunca substrings.
- **Contenido didáctico (tips/hints/lecciones seed)** en migraciones ya aplicadas está
  documentado como PENDIENTE de pase de contenido (no se editan con UPDATEs a ciegas sin DB).
- **en.json** traduce todo a inglés natural; no debe heredar un solo token del español.

## Herramientas

- `scripts/normalizar-espanol.mjs` — aplica el mapeo curando a `messages/es.json` (solo valores).
- `scripts/detectar-voseo.mjs` — reporta voseo residual en `es.json`.
- `scripts/analizar-voseo-funciones.mjs` + `scripts/generar-migracion-neutro.mjs` +
  `scripts/verificar-0128.mjs` — detectan voseo en RPC y generan/verifican la migración de
  mensajes neutros (`supabase/migrations/0128_espanol_neutro.sql`).
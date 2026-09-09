# EXTERNAL-RESOURCES — Recursos externos y dependencias

> Registro de servicios/librerías externas que usa el proyecto y de por qué están. Para agregar una nueva librería: anotar acá + justificar (AGENTS.md). No instalar libs sin esto.

## Servicios externos

| Recurso | Uso | Dónde configurado | Estado |
|---|---|---|---|
| Supabase (proyecto real) | Postgres + Auth + RLS + Edge Functions | `.env.local` (`SUPABASE_URL`, keys), `supabase/config.toml` (functions) | VERIFICADO POR CÓDIGO (config); dashboard sin acceso en esta sesión |
| Vercel | Hosting recomendado | README (sin config concreta verificada) | PENDIENTE |

## Librerías de runtime (verificadas en `package.json`)

| Librería | Uso | Nota |
|---|---|---|
| @supabase/ssr + @supabase/supabase-js | Clientes Supabase server/client | — |
| next-intl | i18n (segmento `[locale]`) | `next.config.ts` plugin; `src/i18n/request.ts` |
| gsap | Animaciones | usa .0.x? — ver `src/components` (reactbits/duelos) |
| framer-motion | Animaciones React | en componentes de UI/landing |
| three + ogl | 3D (OpenGL/WebGL) | — |
| react-simple-maps + world-atlas | Mapas de geografía | — |
| @capacitor/android + @capacitor/push-notifications | Android + push | `0114` |
| typescript, tailwindcss v4, eslint | Tooling | — |
| vitest + playwright | Tests (dev) | `npm test` (vitest); e2e sin browser confirmado |

## Edge Functions (Supabase)

| Function | Push/topic | Estado |
|---|---|---|
| notify-duelo | Notificar reto de duelo | VERIFICADO POR CÓDIGO (definición) |
| notify-clan-mensaje | Notificar chat de clan | VERIFICADO POR CÓDIGO |
| racha-en-riesgo | Avisar racha en riesgo | VERIFICADO POR CÓDIGO |
| _shared | Utilidades compartidas | VERIFICADO POR CÓDIGO |

## Convenciones de URL/redirect (email)

- `docs/EMAIL-PENDIENTE.md`: SMTP + magic-link genérico pendiente. Plantillas HTML en `docs/`.
- Redirects de auth a validar contra allowlist (auth-security).

## Notas de instalación

- No instalar deps sin: (1) justificación en `docs/DECISIONS.md` o TECH-DEBT, (2) entrada en esta tabla, (3) revisión de `package.json` actual (evitar duplicados).

## Recursos de diseño (campaña 2026-09-09)

> Recursos externos citados/usados para la dirección artística de la campaña (`docs/marketing/DIRECCION-ARTISTICA.md`) y recursos descargables si el generador de assets los necesita. Regla de marca: el símbolo (aro+chispa), los íconos de mundo y la tipografía salen SIEMPRE del código real de Prodigia; los recursos externos acá son solo **referencia** o micro-animaciones neutras (partículas/confeti), nunca el símbolo de marca.
> "Solo referencia" = no se descarga nada; se cita la idea/principio.

| Recurso | URL | Tipo | Licencia / atribución | Uso comercial | ¿Solo referencia? |
|---|---|---|---|---|---|
| Duolingo Handbook (principios de diseño) | https://handbook.duolingo.com/ | Documento editorial | Contenido editorial público; se cita la idea, no se copia diseño | — | Sí (referencia de principios; NO descargar) |
| Duolingo "Shape language: Duolingo's art style" | https://blog.duolingo.com/shape-language-duolingos-art-style/ | Artículo editorial | Contenido editorial público | — | Sí (referencia de principio de shape-language/escalabilidad) |
| Riot /dev: "The Visual Design of League Leveling" | https://nexus.leagueoflegends.com/en-us/2017/12/dev-the-visual-design-of-league-leveling/ | Artículo editorial | Contenido editorial público | — | Sí (referencia de progresión por color de tier) |
| SocialPeta — top mobile game ad creatives 2026 (jun/jul 2026) | https://socialpeta.com/en/blog/ | Datos de tendencias UA | Datos públicos de tendencia; no se copian piezas | — | Sí (referencia de datos de formato/volumen) |
| AdMapix — Mobile Game Ads Guide + MONOPOLY GO! / Smash Fest! teardown | https://www.admapix.com/blog/ad-intelligence/ | Datos de tendencias UA | Datos públicos de tendencia | — | Sí (referencia de playbooks de formato) |
| Segwise — Screwdom 3D ad strategy (hooks/formatos) | https://segwise.ai/blog/screwdom-ad-strategy-creative-patterns | Datos de tendencias UA | Datos públicos de tendencia | — | Sí (referencia de near-fail / hooks) |
| Figma Community — Untitled UI color styles template | https://www.untitledui.com/components/color-styles | Plantilla de paleta/variables (Figma) | CC BY 4.0 (atribución) — free | Sí (con atribución) | No (se puede descargar; sirve de referencia de estructura de paleta) |
| Figma Community — LottieFiles plug-in ("Discover, Create & Export Lottie animations") | https://www.figma.com/community/plugin/809860933081065308 | Plugin/animaciones Lottie | Plugins free: Community Free Resource License; Lottie Simple License para público | Sí (Lottie Simple permite comercial; plugin se usa, no se redistribuye) | Parcial (se usa el plugin/animaciones; NO para el símbolo de marca) |
| LottieFiles — Free animations (Lottie Simple License) | https://lottiefiles.com/page/license | Biblioteca de animaciones | Lottie Simple License (comercial sí; atribución opcional) | Sí | Parcial (micro-animaciones neutras si se descargan; ver nota) |
| LottieFiles — Commercial Use Guide | https://help.lottiefiles.com/commercial-use-guide | Documento de licencia | Editorial/informativo | — | Sí (para verificar licencia antes de usar) |
| Figma — Community copyright & licensing | https://help.figma.com/hc/en-us/articles/360042296374 | Documento de licencia | Editorial/informativo | — | Sí (para verificar licencia de recursos de Figma) |
| Figma Community — "League of Legends Division emblems" (referencia conceptual de emblemas) | https://www.figma.com/community/file/1183114524072043336 | Plantilla de emblemas | Figma Community license (CC BY 4.0 si free; verificar en archivo) — NO copiar la identidad de LoL | Verificar licencia por archivo | Sí (solo referencia conceptual de escalera; no copiar emblemas Riot) |

**Notas de licencia (2026-09-09):**
- **Figma Community free files** se publican bajo **CC BY 4.0** (uso comercial sí, con atribución al autor). Verificar siempre el screenshot de licencia de cada archivo/plugin en Figma antes de descargar.
- **LottieFiles public/free animations** se publican bajo **Lottie Simple License** (comercial sí, sin atribución requerida aunque recomendada; y cualquier modificación debe redistribuirse bajo la misma licencia).
- **Plugins free de Figma** (incluido LottieFiles) se rigen por la **Community Free Resource License** (se pueden ejecutar en archivos de cualquier propósito, no se pueden revender/redistribuir el plugin en sí).
- **LottieFiles Free/Individual plan** de la plataforma: uso no comercial; para actividades comerciales (anuncios/marketing) se requiere plan Team/Enterprise. La excepción son las **animaciones públicas** de la biblioteca bajo Lottie Simple License.
- Estos recursos descargables (si se usan) deben limitarse a micro-animaciones neutras (partículas/confeti) o plantillas de estructura; el símbolo de marca (aro+chispa), íconos de mundo y tipografía provienen del código (ver `DIRECCION-ARTISTICA.md`).
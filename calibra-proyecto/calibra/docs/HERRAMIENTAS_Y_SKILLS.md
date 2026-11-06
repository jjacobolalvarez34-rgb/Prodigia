# Herramientas, skills y servicios de Prodigia

Inventario de todo lo que se usa para construir, probar, publicar y promocionar Prodigia
(armado el 2026-11-06). Sirve para dos cosas: que cualquier agente sepa qué tiene a mano,
y para copiarlo a un inventario general de todos los proyectos. Ningún secreto va acá:
las claves viven en `calibra/.env.local` y en las variables de Vercel.

## 1. Agentes de Claude Code del proyecto

| Agente | Archivo | Para qué |
|---|---|---|
| `agente-publicidad` | `.claude/agents/agente-publicidad.md` | Marketing y redes: estrategia, piezas que no parecen de IA, textos, perfil de Instagram, calendario y medición. Antes de producir entrega una propuesta de arranque (estética, colores, críticas, mejoras) para aprobar. |

Agentes que trae Claude Code: `general-purpose` (tareas largas de varios pasos), `Explore` (búsquedas amplias en el código, solo lectura), `Plan` (planes de implementación), `claude-code-guide` (dudas sobre Claude Code y la API).

## 2. Skills

| Skill | De dónde | Para qué |
|---|---|---|
| `graphify` | `~/.claude/skills/graphify` + pip `graphifyy` | Mapa consultable del repo para gastar menos tokens. Regla: consultarlo antes de explorar (`graphify query "…" --budget 3000`, `graphify explain`, `graphify path`, `graphify update .`). No indexa SQL. |
| `ui-ux-pro-max` | `~/.claude/skills/ui-ux-pro-max` | Estilos, paletas, tipografías, guías de UX y de componentes para web y móvil. |
| `instagram-agent:*` (`ig-plan`, `ig-reel`, `ig-carousel`, `ig-caption`, `ig-story`, `ig-profile`, `ig-viral`, `ig-audit`, `ig-comment`, `ig-reply`, `ig-dm`, `ig-repurpose`, `ig-human`) | plugin `instagram-agent` | Instagram: planear la semana, guiones de reels, carruseles, captions, historias, perfil, buscar lo que funciona, auditar resultados, comentarios, DMs, reciclar contenido largo y quitar el tono de IA a un texto. |
| `hyperframes:*` (`hyperframes`, `general-video`, `motion-graphics`, `product-launch-video`, `faceless-explainer`, `slideshow`, `music-to-video`, `talking-head-recut`, `embedded-captions`, `pr-to-video`, `figma`, `media-use`, `hyperframes-animation`, `hyperframes-audio`, `hyperframes-cli`, `hyperframes-core`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-registry`, `hyperframes-studio`, `remotion-to-hyperframes`) | plugin `hyperframes` | Videos y animaciones hechos en HTML (así se hicieron los videos de eventos). Música, voz, subtítulos y render a MP4. |
| `apple-design-skill` | plugin `apple-design-skill` | Guías de diseño de Apple (por si llega la versión de iOS). |
| `dataviz` | incluida | Gráficos y tableros con buena paleta y legibilidad. |
| `artifact-design`, `artifact-diagramming`, `artifact-capabilities` | incluidas | Páginas para compartir (Artifacts de claude.ai), diagramas y páginas con datos. |
| `anthropic-skills:*` (`docx`, `pptx`, `xlsx`, `pdf`, `docs`, `google-workspace`, `deep-research`, `skill-creator`, …) | incluidas | Documentos de Office y PDF, Google Docs/Sheets, investigación profunda, crear skills nuevas. |
| `code-review`, `simplify`, `security-review` | incluidas | Revisar cambios: errores, simplificación y seguridad. |
| `loop`, `schedule` | incluidas | Repetir una tarea cada cierto tiempo o programar agentes en la nube. |
| `update-config`, `fewer-permission-prompts`, `keybindings-help` | incluidas | Ajustes de Claude Code (permisos, hooks, atajos). |

## 3. Plugins y conectores

| Nombre | Tipo | Estado |
|---|---|---|
| `instagram-agent` | plugin | Instalado |
| `hyperframes` | plugin | Instalado |
| `apple-design-skill` | plugin | Instalado |
| `gitkraken-hooks` | plugin | Instalado |
| Claude Artifacts | conector (MCP) | Publicar páginas privadas en claude.ai |
| Claude Docs | conector (MCP) | Documentos vivos en claude.ai |
| Google Drive y Google Sheets | conectores de claude.ai | Leer y escribir archivos del Drive |
| HyperFrames by HeyGen | conector | Proyectos de video en la nube de HeyGen (desde Claude Code solo lectura; para crear se usan las skills locales) |
| Vivideo.ai | conector | Escribe prompts para generadores de video (no genera video) |
| Canva | conector de claude.ai | Requiere autorizarlo en la configuración de conectores de claude.ai |
| VS Code (diagnósticos) | integración del editor | Errores del editor |

## 4. Programas y comandos en el PC

| Herramienta | Uso en Prodigia |
|---|---|
| Node.js + npm/npx | Web (Next.js) y app (Expo). |
| Git + GitHub (`jjacobolalvarez34-rgb/Prodigia`) | Repo. Firmar commits con `jjacobolalvarez34@gmail.com` o Vercel no publica. `gh` está instalado pero sin sesión. |
| Supabase CLI (`npx supabase`) | Desplegar funciones: `npx supabase functions deploy <nombres> --project-ref yawsxywljqebtthfyafz`. Las migraciones se corren a mano en el SQL Editor. |
| Python 3.12 (`graphifyy`, `pglast`, `Pillow`, `numpy`) | Graphify; validar migraciones SQL (pglast); exportar marcos a WebP (Pillow). |
| Playwright + Chromium | Capturas de la web y render de piezas. Navegadores en `D:\Repositorios\Prodigia\compilacion\ms-playwright` (`PLAYWRIGHT_BROWSERS_PATH`). |
| ffmpeg (winget) | Video y audio de los eventos. Para WebP animado es muy lento: usar Pillow. |
| JDK 17, Android SDK, Gradle | Compilar el APK: `D:\Repositorios\Prodigia\compilacion\android` (script `compilar-limpio.ps1`, compila desde la copia limpia `D:\Repositorios\Prodigia\copia`). |
| PowerShell | Lanzar la compilación sin depender del chat (`Start-Process … -WindowStyle Hidden`). |

## 5. Librerías principales

**Web (`calibra/`):** Next.js 16, React, next-intl (español e inglés), Tailwind 4, framer-motion, GSAP, three y ogl (efectos), KaTeX (fórmulas), react-simple-maps + world-atlas (mapas), Supabase (`@supabase/ssr`, `supabase-js`), Paddle (`@paddle/paddle-js`), qrcode, gifenc/gifuct-js. Pruebas con Vitest; lint con ESLint.

**App (`mobile/`):** Expo SDK 57 con expo-router, React Native, Reanimated + worklets, Skia, react-native-svg, expo-image, expo-video, expo-audio, expo-notifications, expo-file-system, Google Mobile Ads (AdMob), d3-geo + topojson (mapas), MathJax, fuentes de Google (`@expo-google-fonts/*`) y las de `mobile/assets/fonts`, módulo propio `widgets-prodigia` (widgets de Android).

## 6. Servicios externos

| Servicio | Para qué | Dónde se configura |
|---|---|---|
| Vercel | Publica la web (`prodigia-sandy.vercel.app`) con cada push a `main` | Panel de Vercel (variables de entorno) |
| Supabase (`yawsxywljqebtthfyafz`) | Base de datos, sesiones, tiempo real, funciones (avisos) y cron | Panel de Supabase |
| Paddle | Cobros (hoy en sandbox) | vendors.paddle.com; guía en `PENDIENTES_GENERAL.md` 2b |
| Google Cloud (proyecto `prodigia-367ac`) | Entrar con Google (Google Auth Platform) | console.cloud.google.com |
| Google Search Console | Verificación de la web (propiedades http y https) | search.google.com/search-console |
| Firebase Cloud Messaging | Notificaciones push de la app | Secret `FIREBASE_SERVICE_ACCOUNT` en Supabase |
| GitHub Releases | Descarga del APK (`/api/app/descargar` lleva al último release) | Releases del repo |
| AdMob y AdSense | Publicidad (lo configura el usuario) | — |

## 7. Scripts propios del repo

| Script | Para qué |
|---|---|
| `calibra/scripts/marcos/` (`marcos.js`, `render.mjs`, `codificar.py`, `vista.html`, `final.html`) | Dibujar y exportar los marcos animados a WebP |
| `calibra/scripts/marketing-capturas-*.mjs`, `piezas-reales.mjs` | Capturas reales de la app y la web para marketing |
| `calibra/scripts/verificar-claves-i18n.mjs`, `merge-i18n-fragments.mjs` | Revisar y unir los textos es/en |
| `calibra/scripts/normalizar-espanol*.mjs`, `detectar-voseo.mjs` | Español neutro en los textos |
| `calibra/scripts/generar-iconos-temporada.ts`, `mobile/scripts/generar-iconos.mjs`, `mobile/scripts/generar-sonidos.py`, `mobile/scripts/generar-sonidos-marca.py` | Íconos y sonidos generados |
| `calibra/scripts/crear-usuario-qa.mjs`, `login-qa.mjs` | Cuenta de pruebas |
| `D:\Repositorios\Prodigia\compilacion\android\compilar-limpio.ps1` | Compilar el APK |

## 8. Carpetas importantes

Ver el `README.md` de la raíz (`D:\Repositorios\Prodigia`): código, `marketing`, `apk`, `documentos`, `compilacion`, `copia` y `temporales`.

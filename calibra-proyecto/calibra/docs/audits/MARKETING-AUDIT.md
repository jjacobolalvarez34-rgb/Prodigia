# MARKETING-AUDIT — Auditoría de la línea de marketing (F4 del mega-sprint)

> Fecha: 2026-09-09 · Agente: marketing/orchestrator · Método: lectura de código fuente + docs (sin navegador ni DB en este entorno, modo AUTÓNOMO).
> Estados usados: VERIFICADO EN CÓDIGO · VERIFICADO EN BROWSER (2026-09-08) · VERIFICADO CON TEST · HIPÓTESIS · NO PUEDO VERIFICAR · BLOQUEADO · PENDIENTE.

## 1. Inventario

### Reino de `docs/marketing/` (20 archivos .md)

| Archivo | Estado (en auditoría 2026-09-09) | Nota |
|---|---|---|
| `README.md` | Verificado / actualizado | Índice + regla de oro. |
| `BRAND.md` | Verificado (sin lectura exhaustiva) | Identidad de marca. |
| `PRODUCT-MESSAGING.md` | **DIFERENTE** en 1 claim (fórmula nivel de mundo) | Ver Hallazgo H1. |
| `AUDIENCE.md` | **DIFERENTE** en 1 claim (feed social) | Ver H3. |
| `COMPETITIVE-RESEARCH.md` | HIPÓTESIS | Live research PENDIENTE. |
| `CONTENT-STRATEGY.md` | Verificado (sin lectura exhaustiva) | |
| `AD-CONCEPTS.md` | **DIFERENTE** en 1 claim (50% dominio) | Ver H1. |
| `SOCIAL-CONTENT.md` | Verificado (sin lectura exhaustiva) | |
| `VIDEO-CONCEPTS.md` | Verificado (sin lectura exhaustiva) | |
| `VISUAL-ASSETS.md` | Verificado | Ejes claro/oscuro, tokens, anti-patrones. |
| `SCREENSHOTS.md` | Verificado | Mapa prioridad→ruta→estado (con 30 captures). |
| `PROMPTS-IMAGES.md` | Verificado (sin lectura exhaustiva) | |
| `PROMPTS-VIDEO.md` | Verificado (sin lectura exhaustiva) | |
| `CAMPAIGNS.md` | Verificado (sin lectura exhaustiva) | |
| `COPY-LIBRARY.md` | Verificado (sin lectura exhaustiva) | |
| `FUNNEL.md` | Verificado (sin lectura exhaustiva) | |
| `REAL-APP-2026-09-08.md` | VERIFICADO EN BROWSER | Estudio real con Playwright, 30 captures. |
| `DIRECCION-ARTISTICA.md` | Verificado | Reglas dark ya definidas en el doc. |
| `ANUNCIOS-VIDEO-2026-09-09.md` | Verificado | Requiere assets dark (H5). |
| `STORYBOARD-TRAILER-PRINCIPAL.md` | Verificado (sin lectura exhaustiva) | |
| `agent-work/ACTIVE.md` | Verificado | Sistema CLAIM/CIERRE de la línea. |

Docs con "sin lectura exhaustiva": existen y están indexados; su claims específicos no fueron re-verificados uno a uno en esta pasada (ver Paso 5 del checklist).

### Assets reales

| Recurso | Cantidad / estado |
|---|---|
| `assets/pantallas-reales/` | **30 capturas reales** (Playwright, sesión anónima, 2026-09-08). |
| `assets/piezas/` | **4 piezas eje claro** (HTML+PNG) + **4 piezas eje oscuro** (HTML+PNG provisional, pasada de hoy) + `README.md`. |
| `assets/pantallas-oscuras/` | Destino de las capturas dark (vacío hoy; plan en §4). |
| `scripts/piezas-reales.mjs` | Pipeline Playwright: abre cada `*.html` de `assets/piezas/`, detecta formato por nombre (`square` 1080×1080 · `story` 1080×1920 · `banner` 1200×630), guarda el PNG al lado. Re-render: `node scripts/piezas-reales.mjs`. |

## 2. Hallazgos principales (docs de marketing vs código real)

### H1 — Fórmula de nivel de mundo mal citada (docs desactualizadas tras T4 2026-09-08)
- Docs dicen **“50% dominio + 30% volumen + 20% lecciones”**: `PRODUCT-MESSAGING.md:52,55` y `AD-CONCEPTS.md:90`, citando `0080_nivel_mundo_dominio_real.sql` (0.3 volumen / 0.5 dominio / 0.2 lecciones, techo 50000 — migrate 0080:18-27; texto de 0117:8).
- Código y migración vigentes: **volumen 34% (techo 25.000) + dominio 45% + lecciones 21%** — `src/lib/practica/worldLevel.ts:46-49` (PESO_VOLUMEN=0.34, PESO_DOMINIO=0.45, PESO_LECCIONES=0.21, VOLUMEN_TECHO=25000), `supabase/migrations/0117_curva_nivel_mundo.sql` (dominio ahora despega desde nivel 4, `clamp((n-4)/6)`), `0125_recalcular_niveles_mundo_y_saneo.sql:6-7,184` (re-cálculo de la misma curva).
- **Estado: DIFERENTE — las dos citas de marketing citan la fórmula vieja. Impacto:** claims de “el nivel refleja tu dominio real” siguen siendo ciertos en espíritu, pero el % citado es falso. **Acción: corregir `PRODUCT-MESSAGING.md:52,55` y `AD-CONCEPTS.md:90`** (ver Checklist).

### H2 — Número de mundos: “8 mundos” verificado; `docs/MARKETING.MD` quedó atrás
- Código: 8 mundos reales — `src/lib/mundos.ts:19-28`, `worldLevel.ts:3-12` (TOTAL_SUBTEMAS), migración `0110_ocho_mundos.sql`, `src/lib/mundos/precios.ts:13` (MUNDOS_PAGOS = 8).
- `docs/MARKETING.MD:8-9` (doc raíz de contexto de marca, NO es el README de `docs/marketing/`) lista solo 6 mundos (Numeria, Enigmia, Geografía, Quimia, Anatomía, Melodía) y recomienda “nunca mencionar un número fijo de mundos”.
- **Estado: VERIFICADO EN CÓDIGO (8 mundos) / DIFERENTE (MARKETING.MD desactualizado vs campaña actual que sí dice “8 mundos”).** El marketing operativo (`docs/marketing/**` + piezas “8 mundos”) ya usa la realidad; `docs/MARKETING.MD` es un doc de contexto interno que conviene actualizar o marcar obsoleto.

### H3 — Feed social: la doc lo vende, el código lo tiene desactivado
- `AUDIENCE.md:31` menciona el “feed social” como diferencial. El código deja el Feed **desactivado** en la Fase 8 (“no navegable, sin selector”): `src/app/[locale]/social/SocialClient.tsx:16-19`; la página aún consulta `feed_posts` (`social/page.tsx:27-33`) pero sin API/UI de navegación.
- **Estado: DIFERENTE / PARCIAL.** No publicitar “feed social” como feature viva hasta su relanzamiento.

### H4 — Tour guiado: desactivado en el Header, existe un tip de primera vez
- `src/components/Header.tsx:27-31`: tour guiado (Fase W) desactivado; la prop `mostrarTour` queda sin efecto.
- Existe `src/components/PrimeraVezTip.tsx` con `TOUR_KEY = "prodigia-tour-onboarding-visto"` y cola de tips en home (`src/app/[locale]/page.tsx:164`) — un “tour” ligero sí llega a existir.
- **Estado: PARCIAL.** No prometer “tour guiado interactivo” como está; sí hay tips de primera vez.

### H5 — Pro: coherente (no publicitar suscripción)
- `src/app/[locale]/pro/page.tsx:12-16` es solo pantalla informativa, sin flujo de pago.
- **Estado: VERIFICADO EN CÓDIGO — coincide con la decisión de marketing de no publicitar Pro.**

### H6 — Demos sin cuenta: verificado (base de los micro-videos)
- 8 demos jugables sin cuenta: `src/app/[locale]/demo/` con `{anatomia, enigmia, geografia, historia, melodia, numeria, quimia, trigonometria}`.
- **Estado: VERIFICADO EN CÓDIGO.**

### H7 — Retos y reglas de partida: claims verificados
- Reto diario “5 preguntas”: `src/app/[locale]/reto-diario/page.tsx:11`.
- Reto semanal “45 preguntas”: `src/app/[locale]/reto-semanal/page.tsx:11`.
- “10 preguntas en 60 segundos” (practicar): `messages/es.json:500`.
- Onboarding “2 mundos gratis + resto con Chispas”: `src/lib/mundos/precios.ts:1-6` + RPC `elegir_mundos_iniciales`; precio mostrado `PRECIO_MUNDO_CHISPAS=3000` (`precios.ts:11`) → el claim “mundo bloqueado a 3.000 Chispas” coincide (captura `17-mundo-bloqueado-3000-chispas.png`).
- Frase de valor “Entrená tu cabeza como si fuera un músculo”: `messages/es.json:485`.
- **Estado: VERIFICADO EN CÓDIGO.**

### H8 — Rankeds bloqueado por nivel de cuenta
- `src/app/[locale]/rankeds/page.tsx:21-22` usa `bloquearInvitado` + `requireNivelCuentaRankeds` (`src/lib/auth/guard.ts`). El umbral numérico exacto no se leyó en esta pasada.
- **Estado: VERIFICADO EN CÓDIGO (existe el gate) / NO PUEDO VERIFICAR (valor exacto del umbral — leer `guard.ts`).** La doc dice “nivel 5” (`SCREENSHOTS.md:37`, captura `18-rankeds-bloqueado-nivel5.png`).

### H9 — Dark mode: implementación real
- Tokens dark en `src/app/globals.css:47-56` (`:root:not([data-theme="light"])`): `--background #090c14` · `--surface #12172a` · `--surface-2 #171d34` · `--border #232b47` · `--primario #7c5cff` · `--foreground #f4f6fb` · `--texto-secundario #8892b0`; modo explícito `:root[data-theme="dark"]` en globals.css:79.
- Toggle: `src/components/ThemeToggle.tsx:26-30` (alterna `data-theme` + `localStorage "prodigia-theme"`); también en `ProfileMenu.tsx:62`.
- Anti-flash del tema entre pintadas: script inline en `src/app/layout.tsx:120-130` (arranca con `prodigia-theme` guardado o `prefers-color-scheme`); `themeColor` meta en layout.tsx:112-115.
- **Estado: VERIFICADO EN CÓDIGO.** Render visual real sin capturar (requiere browser/tunnel) → las capturas dark firmadas dependen del usuario.

### H10 — Piezas de video ya demandan el eje oscuro
- `ANUNCIOS-VIDEO-2026-09-09.md:51` (sprint Numeria sobre nocturno `#090c14` + texto dorado) y `:93` (pentagrama de Melodía sobre oscuro). `DIRECCION-ARTISTICA.md` sección 9 ya define la regla dark (captura clara como foco de luz si convive sobre fondo oscuro; glow + borde por color de mundo).
- **Estado: PLANIFICADO en docs — ahora respaldado por plantillas (H11).**

### H11 — Eje oscuro de piezas: producido en código (lo que se puede sin browser)
- 4 plantillas HTML nuevas con tokens dark reales y swap automático de captura: `assets/piezas/pieza-oscura-{8-mundos-square, numeria-sprint-story, reto-diario-square, melodia-banner}.html` (+ PNG de preview renderizados hoy).
- El `<img>` apunta primero a `../pantallas-oscuras/<bg>.png` (captura dark final, del tunnel) y cae automáticamente a la captura clara real hasta que exista.
- **Estado: VERIFICADO EN CÓDIGO (render OK: square 1080×1080 · story 1080×1920 · banner 1200×630). Captura dark real: BLOQUEADO (tunnel del usuario).** No pude inspeccionar visualmente los PNG generados (modelo sin entrada de imágenes) — revisión visual la hace el usuario.

## 3. Tabla claim→estado resumen

| Claim de marketing | ¿Existe en la app? | Estado |
|---|---|---|
| 8 mundos / 8 colores | Sí | VERIFICADO EN CÓDIGO |
| 2 mundos gratis + resto con Chispas (3.000) | Sí | VERIFICADO EN CÓDIGO |
| 5 preguntas reto diario / 45 semanal | Sí | VERIFICADO EN CÓDIGO |
| 10 preguntas en 60 segundos | Sí | VERIFICADO EN CÓDIGO (`es.json:500`) |
| Demos sin cuenta (8 micro-videos) | Sí | VERIFICADO EN CÓDIGO |
| Pro a la venta | No | NO publicitar (coincide con docs) |
| Feed social activo | No (desactivado Fase 8) | DIFERENTE / PARCIAL |
| Tour guiado interactivo | Parcial (tips de primera vez) | PARCIAL |
| Nivel de mundo = dominio 50/30/20 | No (vigente 45/34/21) | DIFERENTE — corregir docs |
| Ranking semanal visible | Sí (visto en browser 2026-09-08) | VERIFICADO EN BROWSER |
| Rankeds piden nivel de cuenta | Sí (umbral a confirmar) | VERIFICADO / NO PUEDO VERIFICAR (número) |
| Duelos/fantasma | Sí, requiere 2 cuentas | BLOQUEADO en captura (browser) |
| Dark mode real de la app | Sí (tokens+toggle+init) | VERIFICADO EN CÓDIGO / captura BLOQUEADA |
| Piezas eje oscuro | Plantillas + plan listos | BLOQUEADO solo en captura real |

## 4. Plan del eje oscuro (BLOQUEADO-con-plan)

Estado: **BLOQUEADO** solo por la captura real del dark mode — todo lo producible en código ya está hecho.

1. **El usuario levanta la app con su tunnel** (dev server + Supabase) y activa el dark mode real (toggle en el header o `ProfileMenu`, `data-theme="dark"` / `localStorage "prodigia-theme"`, o el navegador en `prefers-color-scheme: dark`).
2. Capturar (mismo estilo de nomenclatura y curación de `pantallas-reales/`) y guardar en **`docs/marketing/assets/pantallas-oscuras/`**:
   - `10-home-principal.png` — home con grid de los 8 mundos en dark (`/es`).
   - `23-demo-numeria-sprint.png` — sprint real de Numeria en dark (`/es/demo/numeria`).
   - `12-reto-diario.png` — reto diario en dark (`/es/reto-diario`).
   - `20-melodia-detalle-musical.png` — Melodía/pentagrama en dark (necesita cuenta calibrada; si no, variante con la demo de Melodía).
3. Re-renderizar: `node scripts/piezas-reales.mjs`. El script detecta `square/story/banner` y produce los 8 PNG (4 claros + 4 oscuros). Las plantillas oscuras ya apuntan a `../pantallas-oscuras/*` (swap automático; no hace falta editar HTML).
4. Cantidades/tamaños esperados: `8-mundos-square` 1080×1080 · `numeria-sprint-story` 1080×1920 · `reto-diario-square` 1080×1080 · `melodia-banner` 1200×630.
5. Si algún mundo oscuro no es capturable (p. ej. Melodía calibrada), aplicar la regla de `DIRECCION-ARTISTICA.md` sección 9: la captura clara conviviendo sobre fondo oscuro se trata como **foco de luz** (glow + borde del color del mundo), que es exactamente lo que la plantilla renderiza hoy.

### Piezas claras (no tocar)
Las 4 `pieza-luz-*` quedan intactas con su captura clara; re-render útil cuando haya fuentes instaladas con Space Grotesk/JetBrains Mono para el render definitivo.

## 5. Checklist / siguiente paso

- [ ] **Corregir docs** `PRODUCT-MESSAGING.md:52,55` y `AD-CONCEPTS.md:90`: nivel de mundo = 34% volumen (techo 25.000) + 45% dominio + 21% lecciones (vigente desde `0117`, 2026-09-08), NO “50% dominio”.
- [ ] `docs/MARKETING.MD:8-9`: actualizar a 8 mundos (o marcar obsoleto frente a `docs/marketing/`).
- [ ] `AUDIENCE.md:31`: aclarar que el feed social está desactivado (Fase 8) hasta su relanzamiento.
- [ ] Confirmar umbral exacto de `requireNivelCuentaRankeds` en `src/lib/auth/guard.ts` (docs dicen “nivel 5”).
- [ ] Lectura claim-por-claim de BRAND/CAMPAIGNS/FUNNEL/COPY-LIBRARY/CONTENT-STRATEGY/COMPETITIVE-RESEARCH/PROMPTS-* (solo indexados hoy).
- [ ] Usuario: tunnel + capturas dark en `assets/pantallas-oscuras/` → re-render → revisar visualmente los 8 PNG (yo no puedo interpretar imágenes).
- [ ] (Backlog ya marcado) Priorización P0-P3 final de conceptos y live research de competencia.
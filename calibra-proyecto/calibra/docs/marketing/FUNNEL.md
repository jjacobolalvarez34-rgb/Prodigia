# FUNNEL — Embudo AD → LANDING → REGISTRO → ONBOARDING → RETENCIÓN

> Basado en fricciones REALES en código (no para arreglarlas, para escribir mensajes en el lugar correcto). Estado: VERIFICADO EN CÓDIGO.

## Etapa 1 · AD / Impresión
Objetivo: click al demo o registro. La propuesta honesta es el demo gratis sin cuenta.
- Mensaje: AD-01/02/03 (fantasma, pentagrama, ranking). CTA: "Jugá la demo" o "Creá tu cuenta".
- Fricción del producto que debe compensar el AD: la landing pregunta "¿Ya conocés Prodigia?" ANTES del hero (`VisitanteLanding.tsx:96-115`) → el anuncio debe decir directo QUÉ es ("app de práctica mental con 8 mundos").

## Etapa 2 · Landing (visitante)
Real hoy: pregunta 2-botones → (si responde que no conoce) → hero "Entrená tu cabeza como si fuera un músculo" + grid "Elegí una ciudad" + demo anónima (`signInAnonymously`, `VisitanteLanding.tsx:85-92`).
- Mensaje óptimo a favorecer: el hero + "jugá una partida real de 30 s sin cuenta".
- Fricción: el paso "¿Ya conocés?" no vende nada; es un chequeo. El AD debe preparar al usuario para ese paso ("sí, la conocés — la viste hace 2 segundos").

## Etapa 3 · Registro (login)
Real: `login/page.tsx` — card chica "Entrá a Prodigia / Con tu email y contraseña", sin mensaje de valor, con "¿No tenés cuenta? Creá una".
- Mensaje necesario (no existe aún): "Tu progreso se guarda, tu ranking es tuyo, gratis." / "No perdés nada de lo que ya practicaste" (copy real de invitado-bloqueado).
- El AD y la demo ya construyeron un progreso anónimo → el alta debe prometer "lo seguís desde acá".

## Etapa 4 · Onboarding
Real: 2 pasos. (1) nombre; (2) elegir exactamente 2 mundos ("gratis para siempre" + candados en los otros, `OnboardingForm.tsx`). Signo: el botón recién habilita con exactamente 2 (`FlujoElegirMundos.tsx`).
- Mensaje vigente bueno: "Los 2 que elijas acá son gratis para siempre." (copy real).
- Fricción a conocer: usuario nuevo ve 2 pantallas y luego diagnóstico por mundo (`guard.ts`) antes de la primera práctica → el onboard no debe acumular más fricción; los mensajes de cada pantalla deben ser cortos y con CTA claro.

## Etapa 5 · Primera práctica / Retención
Real:
- Diagnóstico por mundo opcional ("Prefiero arrancar en nivel 1", `DiagnosticoQuimiaClient.tsx:117-127`).
- Meta diaria (400 XP), racha diaria con push nocturno "🔥 Tu racha está en riesgo" (`supabase/functions/racha-en-riesgo`), reto diario/semanal, duelos, clan.
- Fricción de retención: mundo-bloqueado (3.000 Chispas por ciudad, `MundoBloqueadoClient`), rankeds bloqueado hasta nivel 5, invitado-bloqueado.
- Mensaje correcto en el momento: "Seguí jugando para ganar más Chispas, o mirá la tienda" (ya existe en `MundoBloqueadoClient`). En ads de retención: "¿Tu racha llegó a 7? La app te lo avisa."

## Métricas que conviene definir (HIPÓTESIS, no hay telemetría visible)
- CTR por AD; conversión demo→registro; completado de onboarding en 1 sesión; D1/D7 (racha 7 = primer logro); retención por reto diario (semilla diaria = hábito).

## Mensajes de funnel por momento > a colocar en futuro (no hoy)
1. AD: prometer demo gratis y ranking (no "te va a gustar").
2. Login: "sin costo, sin tarjeta, sin compromiso" — pero VERDAD: freemium real (2 mundos gratis, resto por Chispas jugando).
3. Onboarding: "2 ciudades tuyas" (copy ya real).
4. Post-demo: "Te quedaron 3 de 5 en el primer intento. Mañana la lista es nueva." (reto diario).
5. Retención: push de racha (ya existe) + "esta semana 45 preguntas, ¿top 100?"
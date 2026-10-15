// Versiones de la app de Android (aviso «hay una nueva versión», 2026-10-14). La última
// publicada es el tag del último release de GitHub (p. ej. «v0.5.0»); la instalada es
// la de app.json. El tag del release tiene que ser la versión del APK.

// "v0.5.0" → [0, 5, 0]; null si no es una versión.
export function partesVersion(texto: string | null | undefined): number[] | null {
  const m = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec((texto ?? "").trim());
  if (!m) return null;
  return [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)];
}

// < 0 si a es más vieja que b, 0 si son iguales, > 0 si a es más nueva.
export function compararVersiones(a: string, b: string): number {
  const pa = partesVersion(a);
  const pb = partesVersion(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

export function hayVersionNueva(instalada: string | null | undefined, ultima: string | null | undefined): boolean {
  if (!instalada || !ultima || !partesVersion(instalada) || !partesVersion(ultima)) return false;
  return compararVersiones(ultima, instalada) > 0;
}

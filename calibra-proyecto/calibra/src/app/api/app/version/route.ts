import { NextResponse } from "next/server";
import { REPO_APK, RUTA_DESCARGA_APK } from "@/lib/appAndroid";
import { partesVersion } from "@/lib/app/versiones";

// Última versión publicada de la app de Android (el último release de GitHub, el mismo
// que baja /api/app/descargar). La app la consulta al abrirse para avisar que hay una
// nueva. Se guarda 10 minutos para no pedirle a GitHub en cada apertura.
export const revalidate = 600;

export async function GET() {
  if (!REPO_APK) return NextResponse.json({ version: null });
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_APK}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 600 },
    });
    if (!res.ok) return NextResponse.json({ version: null });
    const r = (await res.json()) as { tag_name?: string; body?: string | null; published_at?: string };
    const p = partesVersion(r.tag_name);
    return NextResponse.json({
      version: p ? p.join(".") : null,
      notas: (r.body ?? "").trim().slice(0, 600) || null,
      publicada: r.published_at ?? null,
      descarga: RUTA_DESCARGA_APK,
    });
  } catch {
    return NextResponse.json({ version: null });
  }
}

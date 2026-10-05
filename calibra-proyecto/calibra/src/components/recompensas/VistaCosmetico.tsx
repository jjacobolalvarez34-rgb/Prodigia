"use client";

import { ARCOIRIS, ciudadDe, efectoDe, EMOTES, estelaDe, particulasDe } from "@/lib/recompensas/catalogo";
import { FONDO_PERFIL_ESTILO, ESTILO_MARCO_PERFIL, type FondoPerfil } from "@/types/database";
import AvatarConMarco from "@/components/AvatarConMarco";
import CiudadSkyline from "./CiudadSkyline";

// Muestra chica de un cosmético de las categorías nuevas (tienda, cápsulas y
// colecciones). Mismo criterio que VistaCosmetico de la app.
export default function VistaCosmetico({ categoria, valor, tam = 56 }: { categoria: string; valor: string; tam?: number }) {
  switch (categoria) {
    case "estela": {
      const e = estelaDe(valor);
      const colores = e.arcoiris ? ARCOIRIS : [e.base, e.punta];
      const id = `vc-estela-${valor}`;
      return (
        <svg viewBox="0 0 24 24" width={tam * 0.8} height={tam * 0.8} aria-hidden="true">
          <defs>
            <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
              {colores.map((c, i) => (
                <stop key={c} offset={i / (colores.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <path fill={`url(#${id})`} d="M12 2c1 3-2 4-2 7a2 2 0 0 0 4 0c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-5 3-8 0-1.5.8-3 2-4z" />
        </svg>
      );
    }
    case "efecto": {
      const efecto = efectoDe(valor);
      return (
        <span className="relative inline-block" style={{ width: tam, height: tam }} aria-hidden="true">
          {particulasDe(efecto, 8, tam * 0.36).map((p, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 font-black"
              style={{
                transform: `translate(-50%, -50%) translate(${p.dx}px, ${p.dy}px) rotate(${p.giro}deg)`,
                color: p.color,
                fontSize: 13,
                ...(p.texto
                  ? {}
                  : {
                      width: efecto.forma === "burbujas" ? p.tam * 1.6 : p.tam,
                      height: efecto.forma === "confeti" || efecto.forma === "burbujas" ? p.tam * 1.6 : p.tam,
                      borderRadius: efecto.forma === "pixeles" || efecto.forma === "confeti" ? 1 : 999,
                      border: efecto.forma === "burbujas" ? `1.5px solid ${p.color}` : undefined,
                      background: efecto.forma === "burbujas" ? "transparent" : p.color,
                    }),
              }}
            >
              {p.texto}
            </span>
          ))}
        </span>
      );
    }
    case "sonido":
      return <span style={{ fontSize: tam * 0.55 }}>🎵</span>;
    case "emote":
      return <span style={{ fontSize: tam * 0.6 }}>{EMOTES[valor]?.emoji ?? "💬"}</span>;
    case "titulo":
      return <span className="rounded-md border border-logro px-2 py-1 text-[10px] font-bold tracking-wide text-logro">TÍTULO</span>;
    case "marco":
      return (
        <span className={`inline-flex rounded-full border-2 p-0.5 ${ESTILO_MARCO_PERFIL[valor] ?? ""}`}>
          <AvatarConMarco url={null} nombre="?" marco={valor} size={Math.round(tam * 0.6)} />
        </span>
      );
    case "fondo":
      return <span className="inline-block rounded-lg" style={{ width: tam * 1.3, height: tam, background: FONDO_PERFIL_ESTILO[valor as FondoPerfil] || "var(--surface-2)" }} />;
    case "ciudad_placa": {
      const c = ciudadDe(valor);
      return c ? <CiudadSkyline ciudad={c.slug} alto={tam} ancho={tam * 1.4} redondeado /> : null;
    }
    default:
      return null;
  }
}

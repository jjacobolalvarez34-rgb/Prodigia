import type { ReactNode } from "react";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { ARCOIRIS, ESTELAS, type Estela } from "@/lib/recompensas/catalogo";
import { color } from "~/tema";

// Set propio de íconos (02-SISTEMA-VISUAL.md §5), dibujados con el mismo trazo de 2
// que maquetas-android.html. Emoji solo en texto de usuarios.

interface Props {
  tam?: number;
  c?: string;
}

// La chispa de 4 puntas del logo, con el degradé de la marca.
export function IconoChispa({ tam = 18 }: Props) {
  return (
    <Svg width={tam} height={tam} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="gChispa" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#A794FF" />
          <Stop offset="0.5" stopColor="#E4CBA0" />
          <Stop offset="1" stopColor="#FFC53D" />
        </LinearGradient>
      </Defs>
      <Path d="M12 1.5c.6 5 2.4 7.6 9.5 10.5-7.1 2.9-8.9 5.5-9.5 10.5-.6-5-2.4-7.6-9.5-10.5C9.6 9.1 11.4 6.5 12 1.5z" fill="url(#gChispa)" />
    </Svg>
  );
}

// Llama de la racha: apagada (gris), encendida, o "en llamas" (≥ 7 días, más brillo).
export function IconoLlama({ tam = 18, estado = "encendida", estela }: Props & { estado?: "apagada" | "encendida" | "llamas"; estela?: Estela }) {
  // Estela de racha de la tienda (0248): cambia los colores de la llama encendida.
  const conEstela = estela && estado !== "apagada" && estela.base !== ESTELAS.clasica.base;
  const exterior = estado === "apagada" ? "#4A5270" : conEstela ? estela.base : estado === "llamas" ? "#FF6A2B" : color.racha;
  const interior = estado === "apagada" ? "#6B7391" : conEstela ? estela.punta : "#FFD36B";
  const arcoiris = conEstela && estela.arcoiris;
  return (
    <Svg width={tam} height={tam} viewBox="0 0 24 24">
      {arcoiris && (
        <Defs>
          <LinearGradient id="llamaArcoiris" x1="0" y1="1" x2="0" y2="0">
            {ARCOIRIS.map((c, i) => (
              <Stop key={c} offset={i / (ARCOIRIS.length - 1)} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
      )}
      <Path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.4 1.1-3.9 2.3-5 .2 1.8 1 2.9 2.2 3.3C11 8.6 10.6 5 12 2z" fill={arcoiris ? "url(#llamaArcoiris)" : exterior} />
      <Path d="M12 12.5c.5 1.6 2.3 2.2 2.3 4.3a2.3 2.3 0 0 1-4.6 0c0-1.2.9-2 1.4-2.6.1.6.4 1 .9 1.1-.2-1-.3-1.9 0-2.8z" fill={arcoiris ? "#FFFFFF" : interior} />
    </Svg>
  );
}

export const IconoRegalo = (p: Props) => <Trazo {...p} d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7C10 3 6.5 4 7.5 6.5 8.2 7.5 12 7 12 7zM12 7c2-4 5.5-3 4.5-.5-.7 1-4.5.5-4.5.5z" />;
export const IconoCapsulaMini = (p: Props) => <Trazo {...p} d="M6 12V9a6 6 0 0 1 12 0v3M6 12v3a6 6 0 0 0 12 0v-3M4 12h16" />;

function Trazo({ tam = 22, c = "currentColor", d, children }: Props & { d?: string; children?: ReactNode }) {
  return (
    <Svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {d ? <Path d={d} /> : null}
      {children}
    </Svg>
  );
}

export const IconoHoy = (p: Props) => <Trazo {...p} d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />;
export const IconoMundos = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
  </Trazo>
);
export const IconoCompetir = (p: Props) => <Trazo {...p} d="M4 20l7-7M4 4l9 9 3-3-9-9H4zM20 20l-7-7M20 4v3l-6 6" />;
export const IconoSocial = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="9" cy="8" r="3.5" />
    <Path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.8.8 3 2.6 3.5 5.2" />
  </Trazo>
);
export const IconoPerfil = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="8" r="4" />
    <Path d="M4 21c1-4.2 4.2-6.5 8-6.5s7 2.3 8 6.5" />
  </Trazo>
);
export const IconoCampana = (p: Props) => <Trazo {...p} d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" />;
export const IconoCandado = (p: Props) => (
  <Trazo {...p}>
    <Rect x="5" y="10" width="14" height="11" rx="2.5" />
    <Path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Trazo>
);
export const IconoEngranaje = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Trazo>
);
export const IconoTienda = (p: Props) => <Trazo {...p} d="M4 9h16l-1.2 10.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8zM8 9V7a4 4 0 0 1 8 0v2" />;
export const IconoTrofeo = (p: Props) => <Trazo {...p} d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />;
export const IconoFlecha = (p: Props) => <Trazo {...p} d="M15 18l-6-6 6-6" />;
export const IconoDerecha = (p: Props) => <Trazo {...p} d="M9 18l6-6-6-6" />;
export const IconoLapiz = (p: Props) => <Trazo {...p} d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />;
export const IconoCompartir = (p: Props) => <Trazo {...p} d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />;
export const IconoMas = (p: Props) => <Trazo {...p} d="M12 5v14M5 12h14" />;
export const IconoCheck = (p: Props) => <Trazo {...p} d="M5 12.5l4.5 4.5L19 7.5" />;
export const IconoCerrar = (p: Props) => <Trazo {...p} d="M6 6l12 12M18 6L6 18" />;
export const IconoMensaje = (p: Props) => <Trazo {...p} d="M4 5h16v11H9l-5 4z" />;
export const IconoBuscar = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="11" cy="11" r="6.5" />
    <Path d="M16 16l4.5 4.5" />
  </Trazo>
);
export const IconoEnviar = (p: Props) => <Trazo {...p} d="M4 12l16-8-6 16-2.5-6.5z" />;
export const IconoMapa = (p: Props) => <Trazo {...p} d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" />;
export const IconoReloj = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="13" r="8" />
    <Path d="M12 9v4l2.5 2.5M9 2h6" />
  </Trazo>
);
export const IconoSalir = (p: Props) => <Trazo {...p} d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" />;
export const IconoCorona = (p: Props) => <Trazo {...p} d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />;
export const IconoRayo = (p: Props) => <Trazo {...p} d="M13 2L4 14h7l-1 8 9-12h-7z" />;
export const IconoCopo = (p: Props) => <Trazo {...p} d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9 4l3 2 3-2M9 20l3-2 3 2" />;
export const IconoEscudo = ({ tam = 18, c = color.primarioClaro }: Props) => (
  <Svg width={tam} height={tam} viewBox="0 0 24 24">
    <Path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" fill={c} opacity={0.9} />
    <Path d="M12 5l5 2v4c0 3.4-2.1 6.3-5 7.6z" fill="#fff" opacity={0.25} />
  </Svg>
);
export const IconoFantasma = (p: Props) => <Trazo {...p} d="M6 20V10a6 6 0 0 1 12 0v10l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5zM10 10h.01M14 10h.01" />;

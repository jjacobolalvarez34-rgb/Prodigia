import type { ReactNode } from "react";
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { COMETA } from "@/lib/recompensas/iconoCometa";
import { TRAZOS, type NombreTrazo } from "@/lib/iconosTrazo";
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

// El Cometa (moneda premium, 0279): dibujo propio, misma geometría que la web.
export function IconoCometa({ tam = 18 }: Props) {
  return (
    <Svg width={tam} height={tam} viewBox="0 0 32 32">
      <Defs>
        <LinearGradient id="gCometaCola" x1="26" y1="8" x2="4" y2="29" gradientUnits="userSpaceOnUse">
          {COMETA.cola.map((p) => (
            <Stop key={p.offset} offset={p.offset} stopColor={p.color} stopOpacity={p.opacidad} />
          ))}
        </LinearGradient>
        <RadialGradient id="gCometaNucleo" cx="40%" cy="40%" r="65%">
          {COMETA.nucleo.map((p) => (
            <Stop key={p.offset} offset={p.offset} stopColor={p.color} />
          ))}
        </RadialGradient>
      </Defs>
      <Path d={COMETA.colaGrande} fill="url(#gCometaCola)" />
      <Path d={COMETA.colaChica} fill="url(#gCometaCola)" opacity={0.7} />
      <Circle cx={COMETA.halo.cx} cy={COMETA.halo.cy} r={COMETA.halo.r} fill="#5DE4FF" opacity={0.28} />
      <Circle cx={COMETA.cabeza.cx} cy={COMETA.cabeza.cy} r={COMETA.cabeza.r} fill="url(#gCometaNucleo)" />
      <Circle cx={COMETA.reflejo.cx} cy={COMETA.reflejo.cy} r={COMETA.reflejo.r} fill="#FFFFFF" opacity={0.9} />
      <Path d={COMETA.destello} fill="#FFFFFF" opacity={0.85} />
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

// Íconos que reemplazan a los emojis que quedaban en la interfaz (2026-10-14).
export const IconoBombilla = (p: Props) => <Trazo {...p} d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />;
export const IconoRepetir = (p: Props) => <Trazo {...p} d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />;
export const IconoMochila = (p: Props) => <Trazo {...p} d="M6 9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6M6 13h12M10 13v3h4v-3" />;
export const IconoDestello = (p: Props) => <Trazo {...p} d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" />;
export const IconoGrafico = (p: Props) => <Trazo {...p} d="M4 4v16h16M8 16v-4M12 16V8M16 16v-6" />;
export const IconoLuna = (p: Props) => <Trazo {...p} d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />;
export const IconoZen = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9" />
    <Circle cx="12" cy="7.5" r="0.8" />
    <Circle cx="12" cy="16.5" r="0.8" />
  </Trazo>
);
export const IconoParacaidas = (p: Props) => <Trazo {...p} d="M3 11a9 9 0 0 1 18 0zM3 11l7 7M21 11l-7 7M12 11v7M10 18h4v3h-4z" />;
export const IconoRobot = (p: Props) => (
  <Trazo {...p}>
    <Rect x="5" y="8" width="14" height="11" rx="3" />
    <Path d="M12 4v4M9.5 12.5h.01M14.5 12.5h.01M9.5 16h5M3 12v3M21 12v3" />
  </Trazo>
);
export const IconoPieza = (p: Props) => <Trazo {...p} d="M5 8h3.5a2 2 0 1 1 4 0H16v3.5a2 2 0 1 1 0 4V19H5v-3.5a2 2 0 1 0 0-4z" />;
export const IconoEstrellaFugaz = (p: Props) => <Trazo {...p} d="M15 3l1.5 3.2 3.5.5-2.5 2.4.6 3.5L15 11l-3.1 1.6.6-3.5L10 6.7l3.5-.5zM3 21l7-7M3 15l4-4M9 21l3-3" />;
export const IconoNota = (p: Props) => (
  <Trazo {...p}>
    <Path d="M9 18V5l11-2v13" />
    <Circle cx="6" cy="18" r="3" />
    <Circle cx="17" cy="16" r="3" />
  </Trazo>
);
export const IconoTambor = (p: Props) => <Trazo {...p} d="M4 9c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 9v8c0 1.7 3.6 3 8 3s8-1.3 8-3V9M8 11.7v7.8M16 11.7v7.8M15 2l-3 5M9 2l3 5" />;
export const IconoPlaneta = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="12" r="5.5" />
    <Path d="M6.5 14.5C3 17 2 19 3 19.6c1.6.9 7-1.4 12-5.2s8-7.8 6.4-8.6c-.8-.4-2.7.3-4.9 1.6" />
  </Trazo>
);
export const IconoLibro = (p: Props) => <Trazo {...p} d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13v-2" />;
export const IconoDiana = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Circle cx="12" cy="12" r="5" />
    <Circle cx="12" cy="12" r="1.2" />
  </Trazo>
);
export const IconoMovil = (p: Props) => (
  <Trazo {...p}>
    <Rect x="7" y="2" width="10" height="20" rx="2.5" />
    <Path d="M11 18h2" />
  </Trazo>
);
export const IconoCastillo = (p: Props) => <Trazo {...p} d="M4 21V8h3v3h2.5V8h5v3H17V8h3v13zM10 21v-4a2 2 0 0 1 4 0v4M4 21h16" />;
export const IconoLlave = (p: Props) => (
  <Trazo
    {...p}
    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"
  />
);
export const IconoProhibido = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M5.6 5.6l12.8 12.8" />
  </Trazo>
);
export const IconoEtiqueta = (p: Props) => <Trazo {...p} d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9zM7.5 7.5h.01" />;
export const IconoFiesta = (p: Props) => <Trazo {...p} d="M4 20l4.5-11 6.5 6.5zM13 3c0 2 1.5 3 3 3M18 9h3M15 9l5-5M20 14c-1.5 0-3 .8-3 2.5" />;
export const IconoIgual = (p: Props) => <Trazo {...p} d="M5 9h14M5 15h14" />;
export const IconoAlarma = (p: Props) => (
  <Trazo {...p}>
    <Circle cx="12" cy="13" r="8" />
    <Path d="M12 9v4l2.5 2.5M3 5l3-2.5M21 5l-3-2.5" />
  </Trazo>
);

// Íconos de trazo compartidos con la web (src/lib/iconosTrazo.ts): beneficios Pro, ayudas.
export function IconoTrazo({ nombre, tam = 22, c = "currentColor", ancho = 2 }: Props & { nombre: NombreTrazo; ancho?: number }) {
  const t = TRAZOS[nombre] as { d?: string; circulos?: [number, number, number][] };
  return (
    <Svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round">
      {t.d ? <Path d={t.d} /> : null}
      {t.circulos?.map(([cx, cy, r]) => <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
    </Svg>
  );
}

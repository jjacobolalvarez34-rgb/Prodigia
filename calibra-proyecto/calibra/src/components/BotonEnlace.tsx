"use client";

import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import Boton from "@/components/Boton";

type PropsBoton = Omit<ComponentProps<typeof Boton>, "renderComo" | "onClick" | "type">;

interface Props extends PropsBoton {
  href: string;
}

// El botón de siempre (pastilla + placa de ícono, mismo color de mundo y
// mismos estados) dibujado como enlace de navegación (next-intl, con el
// idioma). Para los "volver" de páginas de servidor, que antes eran un <Link>
// suelto sin el diseño (barrido pedido 2026-09-24). Ej.:
//   <BotonEnlace href="/perfil" variante="secundario" atras tamano="sm">Volver</BotonEnlace>
export default function BotonEnlace({ href, ...props }: Props) {
  return (
    <Boton
      {...props}
      renderComo={({ className, style, children }) => (
        <Link href={href} className={className} style={style}>
          {children}
        </Link>
      )}
    />
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { efectosHabilitados } from "@/lib/efectos";

interface Props {
  children: ReactNode;
}

// Fase H3: adaptación de FadeContent de react-bits — el original dispara
// con IntersectionObserver/ScrollTrigger (revelado al hacer scroll), pero
// acá el caso de uso es "cambio de ruta", no scroll: el contenido
// principal siempre está arriba de todo al montar, así que se dispara
// directo al montar en vez de esperar a que entre en viewport. Se
// mantiene el mismo lenguaje visual (opacidad + blur, sin GSAP
// ScrollTrigger de por medio).
export default function PageFade({ children }: Props) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!efectosHabilitados()) {
      gsap.set(el, { autoAlpha: 1, filter: "blur(0px)" });
      return;
    }

    gsap.set(el, { autoAlpha: 0, filter: "blur(10px)" });
    const tween = gsap.to(el, { autoAlpha: 1, filter: "blur(0px)", duration: 0.35, ease: "power2.out" });

    return () => {
      tween.kill();
    };
  }, [pathname]);

  return (
    <div key={pathname} ref={ref} className="flex min-h-full flex-1 flex-col">
      {children}
    </div>
  );
}

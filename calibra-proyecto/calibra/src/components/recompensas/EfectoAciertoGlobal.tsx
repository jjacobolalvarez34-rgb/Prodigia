"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { efectoDe, particulasDe, type Efecto } from "@/lib/recompensas/catalogo";
import { leerCosmeticosWeb, useCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { efectosHabilitados } from "@/lib/efectos";
import { alReproducirTono } from "@/lib/sonido";

// Efecto de acierto de la tienda (0248): cada vez que una partida marca un
// acierto (todas llaman a reproducirTono("correcto")), estalla el efecto equipado
// donde tocaste la respuesta. Con el efecto por defecto ("chispas") no hace nada:
// ya están las chispas de siempre. Mismas partículas que la app (particulasDe).

interface Estallido {
  id: number;
  x: number;
  y: number;
  efecto: Efecto;
}

function Pieza({ p, forma }: { p: ReturnType<typeof particulasDe>[number]; forma: Efecto["forma"] }) {
  const estilo: React.CSSProperties = p.texto
    ? { color: p.color, fontSize: forma === "glifo" ? 16 : 18, fontWeight: 800 }
    : forma === "burbujas"
      ? { width: p.tam * 2, height: p.tam * 2, borderRadius: 999, border: `1.5px solid ${p.color}`, background: "rgba(255,255,255,0.12)" }
      : forma === "confeti"
        ? { width: p.tam, height: p.tam * 1.8, borderRadius: 1.5, background: p.color }
        : forma === "pixeles"
          ? { width: p.tam, height: p.tam, background: p.color }
          : { width: p.tam, height: p.tam, borderRadius: 999, background: p.color, boxShadow: `0 0 6px ${p.color}` };
  return (
    <motion.span
      className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
      style={estilo}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
      animate={{ x: p.dx, y: p.dy + (forma === "confeti" ? 14 : 0), opacity: 0, scale: 1.1, rotate: p.giro }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      {p.texto}
    </motion.span>
  );
}

export default function EfectoAciertoGlobal() {
  // Suscribirse carga lo equipado apenas se abre la web.
  useCosmeticosWeb();
  const [estallidos, setEstallidos] = useState<Estallido[]>([]);
  const ultimoToque = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const alTocar = (e: PointerEvent) => {
      ultimoToque.current = { x: e.clientX, y: e.clientY };
    };
    const alTecla = () => {
      ultimoToque.current = null;
    };
    window.addEventListener("pointerdown", alTocar, { passive: true });
    window.addEventListener("keydown", alTecla);
    const quitar = alReproducirTono((tipo) => {
      if (tipo !== "correcto") return;
      const valor = leerCosmeticosWeb().efecto;
      if (valor === "chispas" || !efectosHabilitados()) return;
      try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      } catch {
        // sin matchMedia: se muestra igual
      }
      const pos = ultimoToque.current ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const id = Date.now() + Math.random();
      setEstallidos((l) => [...l.slice(-3), { id, x: pos.x, y: pos.y, efecto: efectoDe(valor) }]);
      setTimeout(() => setEstallidos((l) => l.filter((x) => x.id !== id)), 900);
    });
    return () => {
      window.removeEventListener("pointerdown", alTocar);
      window.removeEventListener("keydown", alTecla);
      quitar();
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <AnimatePresence>
        {estallidos.map((e) => (
          <div key={e.id} className="absolute" style={{ left: e.x, top: e.y }}>
            {particulasDe(e.efecto, 12, 70).map((p, i) => (
              <Pieza key={i} p={p} forma={e.efecto.forma} />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

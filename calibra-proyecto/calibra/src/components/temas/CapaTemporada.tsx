"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { capaVisible, type TemaActivo } from "@/lib/temas/temas";
import { PARTICULAS, PASANTES } from "@/lib/temas/dibujos";
import { decoracionHabilitada, decoracionHabilitadaServerSnapshot, subscribeDecoracion } from "@/lib/decoracion";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";
import { svgDeDibujo } from "./DibujoTema";
import { useTemaHoy } from "./useTemaHoy";

// Ambiente de la festividad (docs/eventos/PLAN_FESTIVIDADES.md, capas 1 y 3): copos,
// hojas, corazones… que caen o suben suaves por encima de todo, y cada tanto algo que
// cruza arriba (el trineo, la bruja, el dragón). Un canvas fijo que no recibe toques;
// los dibujos se convierten una vez en imágenes y después solo se estampan. Nunca
// dentro de una partida, y se apaga con «Decoración de temporada» o «Efectos visuales».

// Pantallas de juego: ahí no se dibuja nada encima.
const RUTAS_DE_JUEGO = /\/(practica|duelo|duelos\/|reto-|reto\/|zen|serie|diagnostico|partida|calibracion)/;

function imagen(svg: string): Promise<HTMLImageElement> {
  return new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = mal;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

interface Particula {
  x: number;
  y: number;
  v: number;
  tam: number;
  giro: number;
  vGiro: number;
  fase: number;
  op: number;
  img: HTMLImageElement;
}

export default function CapaTemporada() {
  const tema = useTemaHoy();
  const ruta = usePathname() ?? "";
  const decoracion = useSyncExternalStore(subscribeDecoracion, decoracionHabilitada, decoracionHabilitadaServerSnapshot);
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);
  const activa = !!tema && decoracion && efectos && !RUTAS_DE_JUEGO.test(ruta) && capaVisible(tema, "ambiente") && !!tema.tema.particulas;
  if (!activa || !tema) return null;
  return <Lienzo tema={tema} />;
}

function Lienzo({ tema }: { tema: TemaActivo }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const spec = tema.tema.particulas!;
    const conPasante = capaVisible(tema, "pasante") && tema.tema.pasante;
    let vivo = true;
    let particulas: Particula[] = [];
    let pasanteImg: HTMLImageElement | null = null;
    let pasante: { x: number; y: number; v: number; dir: 1 | -1; ancho: number; alto: number } | null = null;
    let proximoPasante = performance.now() + 6000 + Math.random() * 8000;
    let ultimo = performance.now();

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    ajustar();
    window.addEventListener("resize", ajustar);

    const nueva = (imgs: HTMLImageElement[], arriba: boolean): Particula => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const tam = 12 + Math.random() * 14;
      return {
        x: Math.random() * w,
        y: arriba ? (spec.movimiento === "sube" ? h + tam : -tam) : Math.random() * h,
        v: (spec.movimiento === "flota" ? 8 : 26) + Math.random() * 30,
        tam,
        giro: Math.random() * Math.PI * 2,
        vGiro: (Math.random() - 0.5) * 1.2,
        fase: Math.random() * Math.PI * 2,
        op: 0.45 + Math.random() * 0.4,
        img: imgs[Math.floor(Math.random() * imgs.length)],
      };
    };

    // Menos partículas en pantallas chicas.
    const cantidad = Math.round(spec.cantidad * Math.min(1, Math.max(0.5, window.innerWidth / 1200)));

    Promise.all([
      Promise.all(spec.colores.map((c) => imagen(svgDeDibujo(PARTICULAS[spec.tipo], c, 2)))),
      conPasante ? imagen(svgDeDibujo(PASANTES[tema.tema.pasante!], undefined, 3)) : Promise.resolve(null),
    ]).then(([imgs, imgPasante]) => {
      if (!vivo) return;
      pasanteImg = imgPasante;
      particulas = Array.from({ length: cantidad }, () => nueva(imgs, false));
      const cuadro = (ahora: number) => {
        if (!vivo) return;
        const dt = Math.min(0.05, (ahora - ultimo) / 1000);
        ultimo = ahora;
        const w = window.innerWidth;
        const h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);
        if (document.hidden) {
          requestAnimationFrame(cuadro);
          return;
        }
        for (let i = 0; i < particulas.length; i++) {
          const p = particulas[i];
          p.fase += dt;
          p.giro += p.vGiro * dt;
          if (spec.movimiento === "cae") {
            p.y += p.v * dt;
            p.x += Math.sin(p.fase * 0.9) * 14 * dt;
          } else if (spec.movimiento === "sube") {
            p.y -= p.v * dt;
            p.x += Math.sin(p.fase * 0.7) * 10 * dt;
          } else {
            p.x += Math.cos(p.fase * 0.3) * p.v * dt;
            p.y += Math.sin(p.fase * 0.4) * p.v * 0.6 * dt;
          }
          if (p.y > h + 40 || p.y < -40 || p.x < -40 || p.x > w + 40) particulas[i] = nueva(imgs, true);
          ctx.save();
          ctx.globalAlpha = p.op;
          ctx.translate(p.x, p.y);
          if (spec.tipo !== "farol" && spec.tipo !== "linterna") ctx.rotate(p.giro);
          ctx.drawImage(p.img, -p.tam / 2, -p.tam / 2, p.tam, p.tam);
          ctx.restore();
        }
        // Lo que cruza el cielo, cada ~40 s, en la franja de arriba.
        if (pasanteImg) {
          if (!pasante && ahora > proximoPasante) {
            const dir = Math.random() < 0.5 ? 1 : -1;
            const ancho = Math.min(260, w * 0.32);
            const alto = (ancho * pasanteImg.height) / pasanteImg.width;
            pasante = { dir, x: dir === 1 ? -ancho : w + ancho, y: h * (0.08 + Math.random() * 0.12), v: (w + ancho * 2) / 9, ancho, alto };
          }
          if (pasante) {
            pasante.x += pasante.v * pasante.dir * dt;
            const bamboleo = Math.sin(ahora / 600) * 6;
            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.translate(pasante.x, pasante.y + bamboleo);
            if (pasante.dir === -1) ctx.scale(-1, 1);
            ctx.drawImage(pasanteImg, -pasante.ancho / 2, -pasante.alto / 2, pasante.ancho, pasante.alto);
            ctx.restore();
            if ((pasante.dir === 1 && pasante.x > w + pasante.ancho) || (pasante.dir === -1 && pasante.x < -pasante.ancho)) {
              pasante = null;
              proximoPasante = ahora + 32000 + Math.random() * 20000;
            }
          }
        }
        requestAnimationFrame(cuadro);
      };
      requestAnimationFrame(cuadro);
    });

    return () => {
      vivo = false;
      window.removeEventListener("resize", ajustar);
    };
  }, [tema]);

  return <canvas ref={ref} className="particula-tema pointer-events-none fixed inset-0 z-[45] h-full w-full" aria-hidden="true" />;
}

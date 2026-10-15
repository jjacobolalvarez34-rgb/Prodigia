// Motor de efectos en un <canvas> 2D para la web (equivale a mobile/src/ui/fx con
// Skia): partículas, ondas, rayos, halo y destello. Un solo bucle de
// requestAnimationFrame; lo usan la apertura de cápsulas y la constelación completa.
//
// Rendimiento (2026-10-15, «se traba un poco»), como en los juegos: el brillo de
// cada color se dibuja UNA vez en un lienzo aparte y después solo se estampa
// (drawImage, lo más barato que hay) sumando luz ("lighter"); los degradés de rayos y
// halo se arman cuando cambian, no en cada cuadro; y el bucle se duerme cuando no hay
// nada que dibujar.

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  max: number;
  tam: number;
  color: string;
  gravedad: number;
  forma: "punto" | "chispa" | "confeti";
  giro: number;
}

interface Onda {
  x: number;
  y: number;
  r: number;
  vr: number;
  alfa: number;
  color: string;
  grosor: number;
}

export interface LienzoFx {
  explosion(x: number, y: number, colores: string[], nivel: number): void;
  polvo(x: number, y: number): void;
  fuga(x: number, y: number, color: string, cantidad?: number): void;
  onda(x: number, y: number, color: string, velocidad?: number, grosor?: number): void;
  lluvia(colores: string[], cantidad?: number): void;
  destello(intensidad?: number): void;
  rayos(color: string | null, x?: number, y?: number): void;
  halo(color: string | null, x?: number, y?: number, radio?: number): void;
  // Golpe de luz del halo (cuando la rareza sube un escalón).
  pulso(fuerza?: number): void;
  detener(): void;
}

const TAM_SPRITE = 64;

// Brillo redondo de un color, dibujado una vez y reusado (se escala al estamparlo).
function crearSprite(color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TAM_SPRITE;
  c.height = TAM_SPRITE;
  const g = c.getContext("2d")!;
  const r = TAM_SPRITE / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.18, `${color}EE`);
  grad.addColorStop(0.45, `${color}55`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  g.fillRect(0, 0, TAM_SPRITE, TAM_SPRITE);
  return c;
}

export function crearLienzoFx(canvas: HTMLCanvasElement): LienzoFx {
  const ctx = canvas.getContext("2d")!;
  const particulas: Particula[] = [];
  const ondas: Onda[] = [];
  const sprites = new Map<string, HTMLCanvasElement>();
  const sprite = (color: string) => {
    const c = color.slice(0, 7);
    let s = sprites.get(c);
    if (!s) {
      s = crearSprite(c);
      sprites.set(c, s);
    }
    return s;
  };
  let flash = 0;
  let rayosColor: string | null = null;
  let rayosAlfa = 0;
  let rayosX = 0;
  let rayosY = 0;
  let rayosGrad: CanvasGradient | null = null;
  let rayosLargo = 0;
  let haloColor: string | null = null;
  let haloAlfa = 0;
  let haloX = 0;
  let haloY = 0;
  let haloR = 140;
  let haloGolpe = 0;
  let angulo = 0;
  let ultimo = performance.now();
  let vivo = true;
  let corriendo = false;

  function ajustar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rayosGrad = null;
  }
  ajustar();
  window.addEventListener("resize", ajustar);

  function despertar() {
    if (corriendo || !vivo) return;
    corriendo = true;
    ultimo = performance.now();
    requestAnimationFrame(cuadro);
  }

  function agregar(p: Partial<Particula> & Pick<Particula, "x" | "y" | "vx" | "vy" | "color">) {
    particulas.push({ vida: 0, max: 1, tam: 3, gravedad: 0, forma: "punto", giro: Math.random() * Math.PI, ...p });
    sprite(p.color);
    despertar();
  }

  function cuadro(ahora: number) {
    if (!vivo) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    angulo += dt * 0.6;

    // Halo de fondo (sprite estirado: sin degradé nuevo por cuadro).
    const objetivoHalo = haloColor ? 1 : 0;
    haloAlfa += (objetivoHalo - haloAlfa) * Math.min(1, dt * 4);
    haloGolpe = Math.max(0, haloGolpe - dt * 2.4);
    if (haloAlfa > 0.01 && haloColor) {
      const r = haloR * (1 + haloGolpe * 0.45);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = haloAlfa * (0.55 + haloGolpe * 0.45);
      ctx.drawImage(sprite(haloColor), haloX - r, haloY - r, r * 2, r * 2);
      ctx.globalCompositeOperation = "source-over";
    }

    // Rayos que giran detrás del centro: un solo degradé, reusado mientras no cambie el color.
    const objetivoRayos = rayosColor ? 1 : 0;
    rayosAlfa += (objetivoRayos - rayosAlfa) * Math.min(1, dt * 3);
    if (rayosAlfa > 0.01 && rayosColor) {
      const largo = Math.max(w, h) * 0.6;
      if (!rayosGrad || rayosLargo !== largo) {
        rayosGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, largo);
        rayosGrad.addColorStop(0, `${rayosColor}66`);
        rayosGrad.addColorStop(0.5, `${rayosColor}22`);
        rayosGrad.addColorStop(1, `${rayosColor}00`);
        rayosLargo = largo;
      }
      ctx.save();
      ctx.translate(rayosX, rayosY);
      ctx.rotate(angulo);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = rayosAlfa * 0.9;
      ctx.fillStyle = rayosGrad;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a - 0.09) * largo, Math.sin(a - 0.09) * largo);
        ctx.lineTo(Math.cos(a + 0.09) * largo, Math.sin(a + 0.09) * largo);
        ctx.closePath();
      }
      ctx.fill();
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
    }

    // Ondas expansivas.
    for (let i = ondas.length - 1; i >= 0; i--) {
      const o = ondas[i];
      o.r += o.vr * dt;
      o.alfa -= dt * 1.4;
      if (o.alfa <= 0) {
        ondas.splice(i, 1);
        continue;
      }
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = o.color;
      ctx.globalAlpha = o.alfa * 0.25;
      ctx.lineWidth = o.grosor * 4;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = o.alfa;
      ctx.lineWidth = o.grosor;
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }

    // Partículas: núcleo + brillo estampado.
    for (let i = particulas.length - 1; i >= 0; i--) {
      const p = particulas[i];
      p.vida += dt;
      if (p.vida >= p.max) {
        particulas.splice(i, 1);
        continue;
      }
      p.vy += p.gravedad * dt;
      p.vx *= 1 - dt * 0.8;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.giro += dt * 6;
      const t = 1 - p.vida / p.max;
      const alfa = Math.min(1, t * 1.6);
      if (p.forma !== "confeti") {
        const r = p.tam * 3.2 + 4;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alfa * 0.85;
        ctx.drawImage(sprite(p.color), p.x - r, p.y - r, r * 2, r * 2);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = alfa;
      ctx.fillStyle = p.color;
      if (p.forma === "confeti") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro);
        ctx.scale(1, Math.cos(p.giro * 1.5));
        ctx.fillRect(-p.tam, -p.tam / 2, p.tam * 2, p.tam);
        ctx.restore();
      } else if (p.forma === "chispa") {
        const s = p.tam * (0.6 + t * 0.6);
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - s * 2);
        ctx.lineTo(p.x + s * 0.4, p.y - s * 0.4);
        ctx.lineTo(p.x + s * 2, p.y);
        ctx.lineTo(p.x + s * 0.4, p.y + s * 0.4);
        ctx.lineTo(p.x, p.y + s * 2);
        ctx.lineTo(p.x - s * 0.4, p.y + s * 0.4);
        ctx.lineTo(p.x - s * 2, p.y);
        ctx.lineTo(p.x - s * 0.4, p.y - s * 0.4);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.tam * (0.3 + t * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Destello a pantalla completa.
    if (flash > 0.01) {
      ctx.globalAlpha = flash;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);
      flash -= dt * 2.6;
    }
    ctx.globalAlpha = 1;

    // Si no queda nada que mover, el bucle se duerme hasta el próximo efecto.
    const quieto = particulas.length === 0 && ondas.length === 0 && flash <= 0.01 && !rayosColor && rayosAlfa <= 0.01 && !haloColor && haloAlfa <= 0.01;
    if (quieto) {
      corriendo = false;
      return;
    }
    requestAnimationFrame(cuadro);
  }

  return {
    explosion(x, y, colores, nivel) {
      const n = 30 + nivel * 28;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 180 + Math.random() * (220 + nivel * 120);
        agregar({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          color: colores[i % colores.length],
          max: 0.8 + Math.random() * (0.6 + nivel * 0.2),
          tam: 2 + Math.random() * (2 + nivel),
          gravedad: 260,
          forma: i % 3 === 0 ? "chispa" : "punto",
        });
      }
    },
    polvo(x, y) {
      for (let i = 0; i < 26; i++) {
        const lado = i % 2 ? 1 : -1;
        agregar({ x: x + lado * Math.random() * 30, y, vx: lado * (60 + Math.random() * 180), vy: -40 - Math.random() * 90, color: "#C9CEE6", max: 0.5 + Math.random() * 0.4, tam: 2 + Math.random() * 3, gravedad: 220 });
      }
    },
    fuga(x, y, color, cantidad = 4) {
      for (let i = 0; i < cantidad; i++) {
        const lado = Math.random() < 0.5 ? -1 : 1;
        agregar({ x: x + (Math.random() - 0.5) * 50, y, vx: lado * (40 + Math.random() * 120), vy: (Math.random() - 0.5) * 60, color, max: 0.4 + Math.random() * 0.4, tam: 1.5 + Math.random() * 2.5, forma: "chispa" });
      }
    },
    onda(x, y, color, velocidad = 520, grosor = 4) {
      ondas.push({ x, y, r: 10, vr: velocidad, alfa: 1, color, grosor });
      despertar();
    },
    lluvia(colores, cantidad = 90) {
      const w = canvas.clientWidth;
      for (let i = 0; i < cantidad; i++) {
        agregar({ x: Math.random() * w, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 60, vy: 80 + Math.random() * 160, color: colores[i % colores.length], max: 2.4 + Math.random() * 1.5, tam: 3 + Math.random() * 3, gravedad: 60, forma: "confeti" });
      }
    },
    destello(intensidad = 0.85) {
      flash = Math.max(flash, intensidad);
      despertar();
    },
    rayos(color, x, y) {
      const c = color ? color.slice(0, 7) : null;
      if (c !== rayosColor) rayosGrad = null;
      rayosColor = c;
      if (x != null) rayosX = x;
      if (y != null) rayosY = y;
      despertar();
    },
    halo(color, x, y, radio) {
      haloColor = color ? color.slice(0, 7) : null;
      if (haloColor) sprite(haloColor);
      if (x != null) haloX = x;
      if (y != null) haloY = y;
      if (radio != null) haloR = radio;
      despertar();
    },
    pulso(fuerza = 1) {
      haloGolpe = Math.min(1.5, haloGolpe + fuerza);
      despertar();
    },
    detener() {
      vivo = false;
      window.removeEventListener("resize", ajustar);
    },
  };
}

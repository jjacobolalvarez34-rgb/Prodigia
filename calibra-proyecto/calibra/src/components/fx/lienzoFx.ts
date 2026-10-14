// Motor de efectos en un <canvas> 2D para la web (equivale a mobile/src/ui/fx con
// Skia): partículas, ondas, rayos, halo y destello. Un solo bucle de
// requestAnimationFrame; lo usan la apertura de cápsulas y la constelación completa.

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
  detener(): void;
}

export function crearLienzoFx(canvas: HTMLCanvasElement): LienzoFx {
  const ctx = canvas.getContext("2d")!;
  const particulas: Particula[] = [];
  const ondas: Onda[] = [];
  let flash = 0;
  let rayosColor: string | null = null;
  let rayosAlfa = 0;
  let rayosX = 0;
  let rayosY = 0;
  let haloColor: string | null = null;
  let haloAlfa = 0;
  let haloX = 0;
  let haloY = 0;
  let haloR = 140;
  let angulo = 0;
  let ultimo = performance.now();
  let vivo = true;

  function ajustar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  ajustar();
  window.addEventListener("resize", ajustar);

  function agregar(p: Partial<Particula> & Pick<Particula, "x" | "y" | "vx" | "vy" | "color">) {
    particulas.push({ vida: 0, max: 1, tam: 3, gravedad: 0, forma: "punto", giro: Math.random() * Math.PI, ...p });
  }

  function cuadro(ahora: number) {
    if (!vivo) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    angulo += dt * 0.6;

    // Halo de fondo.
    const objetivoHalo = haloColor ? 1 : 0;
    haloAlfa += (objetivoHalo - haloAlfa) * Math.min(1, dt * 4);
    if (haloAlfa > 0.01 && haloColor) {
      const g = ctx.createRadialGradient(haloX, haloY, 0, haloX, haloY, haloR);
      g.addColorStop(0, `${haloColor}88`);
      g.addColorStop(1, `${haloColor}00`);
      ctx.globalAlpha = haloAlfa;
      ctx.fillStyle = g;
      ctx.fillRect(haloX - haloR, haloY - haloR, haloR * 2, haloR * 2);
    }

    // Rayos que giran detrás del centro.
    const objetivoRayos = rayosColor ? 1 : 0;
    rayosAlfa += (objetivoRayos - rayosAlfa) * Math.min(1, dt * 3);
    if (rayosAlfa > 0.01 && rayosColor) {
      const largo = Math.max(w, h);
      ctx.save();
      ctx.translate(rayosX, rayosY);
      ctx.rotate(angulo);
      for (let i = 0; i < 12; i++) {
        ctx.rotate((Math.PI * 2) / 12);
        const g = ctx.createLinearGradient(0, 0, largo * 0.6, 0);
        g.addColorStop(0, `${rayosColor}55`);
        g.addColorStop(1, `${rayosColor}00`);
        ctx.globalAlpha = rayosAlfa * 0.8;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(largo * 0.6, -largo * 0.06);
        ctx.lineTo(largo * 0.6, largo * 0.06);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
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
      ctx.globalAlpha = o.alfa;
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.grosor;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Partículas.
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
      ctx.globalAlpha = Math.min(1, t * 1.6);
      ctx.fillStyle = p.color;
      if (p.forma === "confeti") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro);
        ctx.fillRect(-p.tam, -p.tam / 2, p.tam * 2, p.tam);
        ctx.restore();
      } else if (p.forma === "chispa") {
        const s = p.tam * (0.6 + t * 0.6);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - s * 2);
        ctx.lineTo(p.x + s * 0.5, p.y - s * 0.5);
        ctx.lineTo(p.x + s * 2, p.y);
        ctx.lineTo(p.x + s * 0.5, p.y + s * 0.5);
        ctx.lineTo(p.x, p.y + s * 2);
        ctx.lineTo(p.x - s * 0.5, p.y + s * 0.5);
        ctx.lineTo(p.x - s * 2, p.y);
        ctx.lineTo(p.x - s * 0.5, p.y - s * 0.5);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.tam * (0.4 + t * 0.6), 0, Math.PI * 2);
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
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);

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
    },
    lluvia(colores, cantidad = 90) {
      const w = canvas.clientWidth;
      for (let i = 0; i < cantidad; i++) {
        agregar({ x: Math.random() * w, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 60, vy: 80 + Math.random() * 160, color: colores[i % colores.length], max: 2.4 + Math.random() * 1.5, tam: 3 + Math.random() * 3, gravedad: 60, forma: "confeti" });
      }
    },
    destello(intensidad = 0.85) {
      flash = Math.max(flash, intensidad);
    },
    rayos(color, x, y) {
      rayosColor = color;
      if (x != null) rayosX = x;
      if (y != null) rayosY = y;
    },
    halo(color, x, y, radio) {
      haloColor = color;
      if (x != null) haloX = x;
      if (y != null) haloY = y;
      if (radio != null) haloR = radio;
    },
    detener() {
      vivo = false;
      window.removeEventListener("resize", ajustar);
    },
  };
}

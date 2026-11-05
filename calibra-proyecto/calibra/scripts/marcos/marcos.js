// Marcos animados de Prodigia (aprobados el 2026-11-05, docs/rediseno/marcos-animados.html).
// Cada marco se dibuja en un lienzo de 512 × 512 alrededor de un avatar de radio A, y es
// una función pura del tiempo: dibujar(g, t) con t en [0, T). Todo lo que se mueve usa
// frecuencias enteras del ciclo, así el WebP repite sin salto. Lo que va «detrás» del
// avatar se recorta con su círculo (el avatar real queda debajo de la imagen).
// render.mjs graba los cuadros y los pasa a WebP; vista.html los muestra en vivo.
(function () {
  const S = 512, C = S / 2, A = 160; // avatar de 320 px: el marco ocupa 1,6 veces el avatar
  const TAU = Math.PI * 2;

  function azar(semilla) {
    let a = semilla >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const entre = (r, a, b) => a + r() * (b - a);
  const mezcla = (a, b, k) => a + (b - a) * k;
  const fase = (t, T, n = 1, ph = 0) => Math.sin((TAU * n * t) / T + ph);
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a))})`;
  function rampa(paradas, u) {
    for (let i = 1; i < paradas.length; i++) {
      if (u <= paradas[i][0]) {
        const [u0, c0] = paradas[i - 1], [u1, c1] = paradas[i];
        const k = (u - u0) / (u1 - u0);
        return [mezcla(c0[0], c1[0], k), mezcla(c0[1], c1[1], k), mezcla(c0[2], c1[2], k), mezcla(c0[3], c1[3], k)];
      }
    }
    return paradas[paradas.length - 1][1];
  }
  // Recorta el disco del avatar: lo que se dibuja dentro de fn queda «detrás».
  function fueraDelAvatar(g, fn, margen = 0) {
    g.save();
    g.beginPath();
    g.rect(0, 0, S, S);
    g.arc(C, C, A - margen, 0, TAU, true);
    g.clip();
    fn();
    g.restore();
  }
  const polar = (ang, r) => [C + Math.cos(ang) * r, C + Math.sin(ang) * r];

  // ---------------------------------------------------------------- Fénix vivo
  // Solo fuego, sin aro (pedido 2026-11-05): cientos de lenguas que nacen en el borde del
  // avatar y suben, más brasas. Brillo aditivo con colores saturados para no quemar a blanco.
  const fenix = (() => {
    const T = 2;
    const r = azar(11);
    const llamas = Array.from({ length: 1300 }, () => {
      const ang = entre(r, 0, TAU);
      return { ang, r0: A + entre(r, -6, 8), nace: entre(r, 0, T), vida: entre(r, 0.42, 0.85), vy: entre(r, 120, 200), vx: entre(r, -18, 18) + Math.cos(ang) * 26, tam: entre(r, 11, 22), ph: entre(r, 0, TAU) };
    });
    const brasas = Array.from({ length: 70 }, () => {
      const ang = entre(r, Math.PI * 1.05, Math.PI * 1.95);
      return { ang, nace: entre(r, 0, T), vida: entre(r, 0.9, 1.6), vy: entre(r, 150, 230), vx: entre(r, -30, 30), ph: entre(r, 0, TAU), tam: entre(r, 1.6, 3.2) };
    });
    const RAMPA = [
      [0, [255, 236, 170, 0.5]],
      [0.14, [255, 196, 70, 0.46]],
      [0.42, [255, 112, 22, 0.32]],
      [0.72, [196, 40, 10, 0.18]],
      [1, [90, 16, 6, 0]],
    ];
    return {
      T,
      dibujar(g, t) {
        fueraDelAvatar(g, () => {
          g.globalCompositeOperation = "lighter";
          // Resplandor de base que respira con el fuego.
          const resp = 0.8 + 0.2 * fase(t, T, 3);
          const halo = g.createRadialGradient(C, C, A - 4, C, C, A + 46);
          halo.addColorStop(0, `rgba(255,120,30,${0.32 * resp})`);
          halo.addColorStop(1, "rgba(200,50,0,0)");
          g.fillStyle = halo;
          g.beginPath(); g.arc(C, C, A + 46, 0, TAU); g.fill();
          for (const q of llamas) {
            const edad = ((t - q.nace) % T + T) % T;
            if (edad > q.vida) continue;
            const u = edad / q.vida;
            const [x0, y0] = polar(q.ang, q.r0);
            const x = x0 + q.vx * edad + Math.sin(TAU * 2 * (t / T) + q.ph) * 7 * u;
            const y = y0 - q.vy * edad * (0.7 + 0.3 * u);
            const c = rampa(RAMPA, u);
            const rad = q.tam * (1 - 0.55 * u);
            g.save();
            g.translate(x, y);
            g.scale(0.62, 1.4);
            const gr = g.createRadialGradient(0, 0, 0, 0, 0, rad);
            gr.addColorStop(0, rgba(c, c[3]));
            gr.addColorStop(0.55, rgba(c, c[3] * 0.4));
            gr.addColorStop(1, rgba(c, 0));
            g.fillStyle = gr;
            g.beginPath(); g.arc(0, 0, rad, 0, TAU); g.fill();
            g.restore();
          }
          for (const b of brasas) {
            const edad = ((t - b.nace) % T + T) % T;
            if (edad > b.vida) continue;
            const u = edad / b.vida;
            const [x0, y0] = polar(b.ang, A + 6);
            const x = x0 + b.vx * edad + Math.sin(TAU * 3 * (t / T) + b.ph) * 10 * u;
            const y = y0 - b.vy * edad;
            const a = (u < 0.15 ? u / 0.15 : 1) * (1 - u);
            g.strokeStyle = `rgba(255,${180 - 80 * u},70,${a * 0.5})`;
            g.lineWidth = b.tam * 0.8;
            g.beginPath(); g.moveTo(x, y); g.lineTo(x - b.vx * 0.03, y + b.vy * 0.035); g.stroke();
            g.fillStyle = `rgba(255,${220 - 90 * u},120,${a})`;
            g.beginPath(); g.arc(x, y, b.tam, 0, TAU); g.fill();
          }
          g.globalCompositeOperation = "source-over";
        }, 7);
      },
    };
  })();

  // ---------------------------------------------------------------- Escarcha
  const escarcha = (() => {
    const T = 3;
    const r = azar(23);
    const cristales = Array.from({ length: 150 }, () => ({ ang: entre(r, 0, TAU), rr: A + entre(r, -2, 13), tam: entre(r, 3, 8), giro: entre(r, 0, TAU), luz: entre(r, 0.55, 1) }));
    const picos = [];
    for (let i = 0; i < 11; i++) picos.push({ ang: (i / 11) * TAU + entre(r, -0.08, 0.08), largo: entre(r, 46, 82), ancho: entre(r, 11, 15), tilt: entre(r, -0.12, 0.12) });
    for (let i = 0; i < 11; i++) picos.push({ ang: ((i + 0.5) / 11) * TAU + entre(r, -0.1, 0.1), largo: entre(r, 22, 40), ancho: entre(r, 7, 10), tilt: entre(r, -0.2, 0.2) });
    const copos = Array.from({ length: 10 }, () => ({ x: entre(r, C - 230, C + 230), nace: entre(r, 0, T), tam: entre(r, 5, 10), giro: entre(r, 0, TAU), deriva: entre(r, 8, 20), ph: entre(r, 0, TAU) }));
    function copo(g, x, y, tam, giro, a) {
      g.save(); g.translate(x, y); g.rotate(giro);
      g.strokeStyle = `rgba(170,220,250,${a})`; g.lineWidth = 1.8; g.lineCap = "round";
      for (let k = 0; k < 6; k++) {
        g.rotate(TAU / 6);
        g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -tam);
        g.moveTo(0, -tam * 0.55); g.lineTo(tam * 0.28, -tam * 0.78);
        g.moveTo(0, -tam * 0.55); g.lineTo(-tam * 0.28, -tam * 0.78);
        g.stroke();
      }
      g.restore();
    }
    return {
      T,
      dibujar(g, t) {
        const brilloAng = (t / T) * TAU - Math.PI / 2; // el brillo da una vuelta por ciclo
        const cercania = (ang) => {
          const d = Math.atan2(Math.sin(ang - brilloAng), Math.cos(ang - brilloAng));
          return Math.exp(-(d * d) / 0.12);
        };
        fueraDelAvatar(g, () => {
          const niebla = g.createRadialGradient(C, C, A - 4, C, C, A + 50);
          niebla.addColorStop(0, "rgba(150,220,255,0.26)");
          niebla.addColorStop(1, "rgba(80,160,255,0)");
          g.fillStyle = niebla;
          g.beginPath(); g.arc(C, C, A + 50, 0, TAU); g.fill();
          // Picos: dos caras (luz y sombra) y el brillo que recorre el aro.
          for (const p of picos) {
            const ang = p.ang + p.tilt * 0.3;
            const [bx, by] = polar(ang, A - 4);
            const [tx, ty] = polar(ang + p.tilt * 0.15, A + p.largo);
            const nx = -Math.sin(ang) * p.ancho, ny = Math.cos(ang) * p.ancho;
            const [mx, my] = polar(ang, A + p.largo * 0.35);
            const b = cercania(ang);
            g.fillStyle = `rgb(${mezcla(214, 255, b)},${mezcla(243, 255, b)},255)`;
            g.beginPath(); g.moveTo(bx + nx * 0.6, by + ny * 0.6); g.lineTo(mx + nx, my + ny); g.lineTo(tx, ty); g.lineTo(bx, by); g.closePath(); g.fill();
            g.fillStyle = `rgb(${mezcla(92, 170, b)},${mezcla(170, 220, b)},${mezcla(222, 250, b)})`;
            g.beginPath(); g.moveTo(bx - nx * 0.6, by - ny * 0.6); g.lineTo(mx - nx, my - ny); g.lineTo(tx, ty); g.lineTo(bx, by); g.closePath(); g.fill();
            g.strokeStyle = "rgba(40,110,170,0.55)"; g.lineWidth = 1.2;
            g.beginPath(); g.moveTo(bx + nx * 0.6, by + ny * 0.6); g.lineTo(mx + nx, my + ny); g.lineTo(tx, ty); g.lineTo(mx - nx, my - ny); g.lineTo(bx - nx * 0.6, by - ny * 0.6); g.stroke();
            g.strokeStyle = `rgba(255,255,255,${0.55 + 0.45 * b})`; g.lineWidth = 1.1;
            g.beginPath(); g.moveTo(mx + nx * 0.85, my + ny * 0.85); g.lineTo(tx, ty); g.stroke();
            g.strokeStyle = `rgba(255,255,255,${0.3 + 0.5 * b})`; g.lineWidth = 1;
            g.beginPath(); g.moveTo(bx, by); g.lineTo(tx, ty); g.stroke();
          }
          for (const c of copos) {
            const edad = ((t - c.nace) % T + T) % T, u = edad / T;
            const y = C - 250 + u * 500, x = c.x + Math.sin(TAU * (t / T) + c.ph) * c.deriva;
            const a = Math.sin(Math.PI * u) * 0.9;
            copo(g, x, y, c.tam, c.giro + TAU * (t / T), a);
          }
        }, 4);
        // Aro de escarcha: cristales chicos encima del borde del avatar.
        for (const k of cristales) {
          const [x, y] = polar(k.ang, k.rr);
          const b = cercania(k.ang);
          g.save(); g.translate(x, y); g.rotate(k.giro);
          g.fillStyle = `rgba(${mezcla(190, 255, b)},${mezcla(232, 255, b)},255,${0.55 * k.luz + 0.4 * b})`;
          g.beginPath();
          for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; g.lineTo(Math.cos(a) * k.tam, Math.sin(a) * k.tam * 0.6); }
          g.closePath(); g.fill();
          g.restore();
        }
        g.strokeStyle = "rgba(235,250,255,0.9)"; g.lineWidth = 3;
        g.beginPath(); g.arc(C, C, A + 1, 0, TAU); g.stroke();
      },
    };
  })();

  // ---------------------------------------------------------------- Tormenta
  const tormenta = (() => {
    const T = 2.4, CUADROS = 60;
    function rayo(rr, x0, y0, x1, y1, desv, nivel, segs) {
      if (nivel === 0) { segs.push([x0, y0, x1, y1]); return; }
      const mx = (x0 + x1) / 2 + (rr() - 0.5) * desv, my = (y0 + y1) / 2 + (rr() - 0.5) * desv;
      rayo(rr, x0, y0, mx, my, desv / 2, nivel - 1, segs);
      rayo(rr, mx, my, x1, y1, desv / 2, nivel - 1, segs);
    }
    const r = azar(37);
    const descargas = Array.from({ length: 5 }, (_, i) => ({ en: (i / 5) * T + entre(r, 0, 0.25), ang: entre(r, 0, TAU), largo: entre(r, 70, 95), semilla: 100 + i * 17 }));
    const reptantes = Array.from({ length: 5 }, (_, i) => ({ ang: (i / 7) * TAU + entre(r, 0, 0.5), arco: entre(r, 0.5, 0.95), sem: 500 + i * 31, vel: [1, -1, 2, -1, 1, -2, 1][i] }));
    function trazo(g, segs, ancho, color) {
      g.strokeStyle = color; g.lineWidth = ancho; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath();
      for (const [a, b, c, d] of segs) { g.moveTo(a, b); g.lineTo(c, d); }
      g.stroke();
    }
    function brillante(g, segs, escala) {
      trazo(g, segs, 16 * escala, "rgba(40,90,255,0.16)");
      trazo(g, segs, 8 * escala, "rgba(90,170,255,0.4)");
      trazo(g, segs, 3 * escala, "rgba(200,240,255,0.85)");
      trazo(g, segs, 1.3 * escala, "rgba(255,255,255,1)");
    }
    return {
      T,
      dibujar(g, t) {
        const cuadro = Math.floor((t / T) * CUADROS);
        let fogonazo = 0;
        for (const d of descargas) { const e = ((t - d.en) % T + T) % T; if (e < 0.16) fogonazo = Math.max(fogonazo, 1 - e / 0.16); }
        g.globalCompositeOperation = "lighter";
        // Aro de plasma: brillo que corre en dos sentidos.
        for (let i = 0; i < 180; i++) {
          const a0 = (i / 180) * TAU, a1 = ((i + 1.2) / 180) * TAU;
          const k = 0.5 + 0.25 * Math.sin(a0 * 3 - (TAU * 2 * t) / T) + 0.25 * Math.sin(a0 * 5 + (TAU * 3 * t) / T);
          for (const [ancho, alfa, col] of [[26, 0.07, "40,90,255"], [15, 0.2, "60,130,255"], [7, 0.45, "110,190,255"], [2.8, 0.9, "225,245,255"]]) {
            g.strokeStyle = `rgba(${col},${Math.min(1, alfa * (0.6 + 0.8 * k) + 0.2 * fogonazo)})`; g.lineWidth = ancho;
            g.beginPath(); g.arc(C, C, A + 3, a0, a1); g.stroke();
          }
        }
        // Chispas que reptan por el borde (nuevas formas cada pocos cuadros).
        for (const p of reptantes) {
          const sem = p.sem + Math.floor(cuadro / 3) * 7;
          const rr = azar(sem);
          const ini = p.ang + (TAU * p.vel * t) / T;
          const pts = [];
          const n = 14;
          for (let i = 0; i <= n; i++) {
            const a = ini + (p.arco * i) / n;
            const rad = A + 2 + Math.sin((Math.PI * i) / n) * entre(rr, 6, 18) + (rr() - 0.5) * 9;
            pts.push(polar(a, rad));
          }
          const segs = [];
          for (let i = 0; i < n; i++) segs.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]]);
          brillante(g, segs, 0.75);
        }
        // Descargas grandes hacia afuera, con ramas; parpadean dos veces.
        for (const d of descargas) {
          const e = ((t - d.en) % T + T) % T;
          if (e > 0.16 || (e > 0.05 && e < 0.08)) continue;
          const rr = azar(d.semilla + (e > 0.08 ? 1 : 0));
          const [x0, y0] = polar(d.ang, A + 2);
          const [x1, y1] = polar(d.ang + (rr() - 0.5) * 0.4, A + d.largo);
          const segs = [];
          rayo(rr, x0, y0, x1, y1, 46, 5, segs);
          for (let b = 0; b < 2; b++) {
            const s0 = segs[2 + Math.floor(rr() * (segs.length - 6))];
            const ang = Math.atan2(s0[3] - C, s0[2] - C) + (rr() - 0.5) * 0.9;
            rayo(rr, s0[2], s0[3], s0[2] + Math.cos(ang) * 36, s0[3] + Math.sin(ang) * 36, 20, 3, segs);
          }
          brillante(g, segs, 1);
        }
        if (fogonazo > 0) {
          const h = g.createRadialGradient(C, C, A, C, C, A + 110);
          h.addColorStop(0, `rgba(140,200,255,${0.35 * fogonazo})`); h.addColorStop(1, "rgba(80,120,255,0)");
          fueraDelAvatar(g, () => { g.fillStyle = h; g.beginPath(); g.arc(C, C, A + 110, 0, TAU); g.fill(); });
        }
        g.globalCompositeOperation = "source-over";
      },
    };
  })();

  // ---------------------------------------------------------------- Órbita
  // Dos órbitas inclinadas con profundidad: los planetas pasan por detrás del avatar y
  // vuelven por delante, crecen al acercarse, con polvo en la órbita, luna y nebulosa.
  const orbita = (() => {
    const T = 3; // 4 s pesaba 1,2 MB
    const r = azar(53);
    const orbitas = [
      { rx: 1.42, ry: 0.3, incl: -0.34, vueltas: 1, fase: 0.3, tipo: "oceano", tam: 30 },
      { rx: 1.27, ry: 0.36, incl: 0.44, vueltas: -1, fase: 2.9, tipo: "anillado", tam: 26 },
    ];
    const polvo = Array.from({ length: 260 }, () => ({ o: r() < 0.6 ? 0 : 1, ang: entre(r, 0, TAU), d: entre(r, -6, 6), tam: entre(r, 0.6, 1.6) }));
    const estrellas = Array.from({ length: 30 }, () => ({ ang: entre(r, 0, TAU), rr: entre(r, A + 40, A + 92), tam: entre(r, 0.8, 2), ph: entre(r, 0, TAU), n: 1 + Math.floor(r() * 3) }));
    const punto = (o, ang, extra = 0) => {
      const x = Math.cos(ang) * (A * o.rx + extra), y = Math.sin(ang) * (A * o.ry + extra * 0.3);
      return { x: C + x * Math.cos(o.incl) - y * Math.sin(o.incl), y: C + x * Math.sin(o.incl) + y * Math.cos(o.incl), z: Math.sin(ang) };
    };
    function esfera(g, x, y, tam, colores, luz) {
      const gr = g.createRadialGradient(x - tam * 0.42, y - tam * 0.48, tam * 0.08, x - tam * 0.1, y - tam * 0.1, tam * 1.05);
      colores.forEach(([k, c]) => gr.addColorStop(k, rgba(c, luz)));
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, tam, 0, TAU); g.fill();
      // Lado de noche: sombra suave hacia abajo a la derecha.
      const s = g.createRadialGradient(x + tam * 0.55, y + tam * 0.6, tam * 0.1, x + tam * 0.3, y + tam * 0.3, tam * 1.2);
      s.addColorStop(0, "rgba(4,6,20,0.55)"); s.addColorStop(1, "rgba(4,6,20,0)");
      g.fillStyle = s; g.beginPath(); g.arc(x, y, tam, 0, TAU); g.fill();
    }
    function planeta(g, o, t) {
      const ang = o.fase + (TAU * o.vueltas * t) / T;
      const p = punto(o, ang), prof = (p.z + 1) / 2;
      const tam = o.tam * (0.7 + 0.42 * prof), luz = 0.5 + 0.5 * prof;
      // Estela de polvo que deja atrás.
      for (let k = 1; k <= 16; k++) {
        const q = punto(o, ang - o.vueltas * k * 0.035);
        g.fillStyle = `rgba(200,215,255,${(1 - k / 16) * 0.22 * luz})`;
        g.beginPath(); g.arc(q.x, q.y, tam * 0.5 * (1 - k / 18), 0, TAU); g.fill();
      }
      if (o.tipo === "anillado") {
        const anillo = (desde, hasta, alfa) => {
          g.save(); g.translate(p.x, p.y); g.rotate(-0.38); g.scale(1, 0.3);
          for (const [rad, ancho, c] of [[tam * 1.75, 3.2, [255, 222, 168]], [tam * 2.05, 2.2, [222, 180, 120]], [tam * 1.5, 1.4, [255, 236, 200]]]) {
            g.strokeStyle = rgba(c, alfa * luz); g.lineWidth = ancho / 0.3 * 0.42;
            g.beginPath(); g.arc(0, 0, rad, desde, hasta); g.stroke();
          }
          g.restore();
        };
        anillo(Math.PI, TAU, 0.75);
        esfera(g, p.x, p.y, tam, [[0, [255, 246, 214]], [0.35, [244, 190, 104]], [0.7, [196, 112, 46]], [1, [96, 44, 20]]], luz);
        // Bandas del gigante gaseoso.
        g.save(); g.beginPath(); g.arc(p.x, p.y, tam, 0, TAU); g.clip();
        for (let b = -3; b <= 3; b++) { g.fillStyle = `rgba(${b % 2 ? "150,80,30" : "255,225,170"},${0.16 * luz})`; g.fillRect(p.x - tam, p.y + b * tam * 0.28 - tam * 0.06, tam * 2, tam * 0.12); }
        g.restore();
        anillo(0, Math.PI, 0.95);
      } else {
        g.fillStyle = `rgba(120,210,255,${0.22 * luz})`; g.beginPath(); g.arc(p.x, p.y, tam * 1.18, 0, TAU); g.fill();
        esfera(g, p.x, p.y, tam, [[0, [214, 252, 255]], [0.35, [64, 186, 232]], [0.75, [24, 96, 180]], [1, [8, 30, 90]]], luz);
        // Continentes sutiles.
        g.save(); g.beginPath(); g.arc(p.x, p.y, tam, 0, TAU); g.clip();
        g.fillStyle = `rgba(90,190,120,${0.55 * luz})`;
        const giro = (TAU * 2 * t) / T;
        for (const [dx, dy, rx, ry] of [[-0.3, -0.15, 0.32, 0.2], [0.35, 0.25, 0.26, 0.16], [0.05, 0.55, 0.2, 0.1]]) {
          const xx = p.x + Math.cos(giro) * dx * tam - Math.sin(giro) * dy * tam * 0.2, yy = p.y + dy * tam;
          g.beginPath(); g.ellipse(xx, yy, rx * tam, ry * tam, 0.3, 0, TAU); g.fill();
        }
        g.restore();
        const la = (TAU * 3 * t) / T, lz = Math.sin(la);
        const lx = p.x + Math.cos(la) * tam * 1.9, ly = p.y + Math.sin(la) * tam * 0.55;
        if (lz > -0.2 || Math.hypot(lx - p.x, ly - p.y) > tam) esfera(g, lx, ly, tam * 0.26, [[0, [240, 242, 250]], [1, [120, 126, 150]]], luz);
      }
    }
    function camino(g, o, delante) {
      for (let i = 0; i < 120; i++) {
        const a0 = (i / 120) * TAU, a1 = ((i + 1) / 120) * TAU;
        const p0 = punto(o, a0), p1 = punto(o, a1);
        if ((p0.z > 0) !== delante) continue;
        const k = (p0.z + 1) / 2;
        g.strokeStyle = `rgba(150,160,240,${delante ? 0.12 + 0.18 * k : 0.3 + 0.45 * k})`; g.lineWidth = 2.6 + 2 * k;
        g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
      }
      for (const d of polvo) {
        if (orbitas[d.o] !== o) continue;
        const p = punto(o, d.ang + (TAU * o.vueltas * 0.25 * 0) , d.d);
        if ((p.z > 0) !== delante) continue;
        g.fillStyle = `rgba(160,170,245,${0.22 + 0.5 * (p.z + 1) / 2})`;
        g.beginPath(); g.arc(p.x, p.y, d.tam * 1.8, 0, TAU); g.fill();
      }
    }
    return {
      T,
      dibujar(g, t) {
        fueraDelAvatar(g, () => {
          const resp = 0.85 + 0.15 * fase(t, T, 1);
          const neb = g.createRadialGradient(C, C, A - 4, C, C, A + 60);
          neb.addColorStop(0, `rgba(130,96,240,${0.3 * resp})`); neb.addColorStop(1, "rgba(60,140,220,0)");
          g.fillStyle = neb; g.beginPath(); g.arc(C, C, A + 60, 0, TAU); g.fill();
          for (const e of estrellas) {
            const [x, y] = polar(e.ang, e.rr);
            const b = 0.25 + 0.75 * Math.pow(Math.abs(Math.sin((TAU * e.n * t) / T + e.ph)), 4);
            g.fillStyle = `rgba(232,238,255,${b})`; g.beginPath(); g.arc(x, y, e.tam, 0, TAU); g.fill();
          }
          for (const o of orbitas) camino(g, o, false);
          for (const o of orbitas) if (Math.sin(o.fase + (TAU * o.vueltas * t) / T) <= 0) planeta(g, o, t);
        });
        // Borde fino del avatar, de luz de la nebulosa.
        g.strokeStyle = "rgba(196,182,255,0.85)"; g.lineWidth = 3.5;
        g.beginPath(); g.arc(C, C, A + 1, 0, TAU); g.stroke();
        for (const o of orbitas) camino(g, o, true);
        for (const o of orbitas) if (Math.sin(o.fase + (TAU * o.vueltas * t) / T) > 0) planeta(g, o, t);
      },
    };
  })();

  // ---------------------------------------------------------------- Enredadera
  const enredadera = (() => {
    const T = 3;
    const r = azar(71);
    const R0 = A + 6;
    const tallo = (ang) => R0 + Math.sin(ang * 7) * 3.5;
    const hojas = Array.from({ length: 26 }, (_, i) => ({ ang: (i / 26) * TAU + entre(r, -0.05, 0.05), largo: entre(r, 24, 38), lado: i % 2 ? 1 : -1, ph: entre(r, 0, TAU), tono: entre(r, 0, 1) }));
    const flores = [0.3, 1.5, 2.6, 3.9, 5.2].map((ang, i) => ({ ang, tam: entre(r, 9, 12), ph: i * 1.3, color: i % 2 ? [255, 182, 206] : [255, 240, 246] }));
    const petalos = Array.from({ length: 10 }, (_, i) => ({ desde: flores[i % 5], nace: (i / 10) * T, ph: entre(r, 0, TAU), deriva: entre(r, -30, 30) }));
    function hoja(g, largo, tono, brillo) {
      const base = [mezcla(36, 52, tono), mezcla(104, 126, tono), mezcla(40, 48, tono)];
      const punta = [mezcla(118, 150, tono), mezcla(196, 214, tono), mezcla(86, 98, tono)];
      const gr = g.createLinearGradient(0, 0, 0, -largo);
      gr.addColorStop(0, rgba(base, 1)); gr.addColorStop(1, rgba(punta.map((c) => c + brillo * 30), 1));
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 0);
      g.bezierCurveTo(largo * 0.42, -largo * 0.25, largo * 0.34, -largo * 0.8, 0, -largo);
      g.bezierCurveTo(-largo * 0.34, -largo * 0.8, -largo * 0.42, -largo * 0.25, 0, 0);
      g.fill();
      g.strokeStyle = "rgba(30,80,34,0.7)"; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(largo * 0.05, -largo * 0.5, 0, -largo * 0.95); g.stroke();
      g.strokeStyle = "rgba(220,255,200,0.25)"; g.lineWidth = 0.9;
      for (let k = 1; k <= 3; k++) {
        const y = -largo * (0.22 * k);
        g.beginPath(); g.moveTo(0, y); g.lineTo(largo * 0.18, y - largo * 0.12); g.moveTo(0, y); g.lineTo(-largo * 0.18, y - largo * 0.12); g.stroke();
      }
    }
    function flor(g, x, y, tam, color, abierta) {
      g.save(); g.translate(x, y);
      for (let k = 0; k < 5; k++) {
        g.rotate(TAU / 5);
        const gr = g.createLinearGradient(0, 0, 0, -tam);
        gr.addColorStop(0, rgba(color.map((c) => c - 40), 1)); gr.addColorStop(1, rgba(color, 1));
        g.fillStyle = gr;
        g.beginPath(); g.ellipse(0, -tam * 0.55 * abierta, tam * 0.36, tam * 0.55 * abierta, 0, 0, TAU); g.fill();
      }
      g.fillStyle = "#FFC94A"; g.beginPath(); g.arc(0, 0, tam * 0.28, 0, TAU); g.fill();
      g.fillStyle = "#E89B1E"; g.beginPath(); g.arc(tam * 0.06, tam * 0.06, tam * 0.13, 0, TAU); g.fill();
      g.restore();
    }
    return {
      T,
      dibujar(g, t) {
        fueraDelAvatar(g, () => {
          for (const h of hojas) {
            const ang = h.ang;
            const [x, y] = polar(ang, tallo(ang));
            const vaiven = Math.sin((TAU * t) / T + h.ph) * 0.12;
            g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2 + h.lado * 0.55 + vaiven);
            hoja(g, h.largo, h.tono, 0.5 + 0.5 * Math.sin((TAU * t) / T + h.ph));
            g.restore();
          }
          for (const p of petalos) {
            const edad = ((t - p.nace) % T + T) % T, u = edad / T;
            const [x0, y0] = polar(p.desde.ang, tallo(p.desde.ang));
            const x = x0 + p.deriva * u + Math.sin(TAU * 2 * u + p.ph) * 10, y = y0 + 120 * u;
            g.save(); g.translate(x, y); g.rotate(TAU * u * 1.5 + p.ph);
            g.fillStyle = `rgba(255,190,214,${Math.sin(Math.PI * u) * 0.95})`;
            g.beginPath(); g.ellipse(0, 0, 5, 3, 0, 0, TAU); g.fill();
            g.restore();
          }
        }, 4);
        // Tallo con volumen: sombra, cuerpo y brillo.
        const pasada = (ancho, color, dy) => {
          g.strokeStyle = color; g.lineWidth = ancho; g.lineCap = "round";
          g.beginPath();
          for (let i = 0; i <= 240; i++) { const a = (i / 240) * TAU, [x, y] = polar(a, tallo(a)); i ? g.lineTo(x, y + dy) : g.moveTo(x, y + dy); }
          g.stroke();
        };
        pasada(9, "rgba(20,50,22,0.9)", 1.5);
        pasada(6.5, "#3F7F35", 0);
        pasada(2, "rgba(170,225,140,0.55)", -1.6);
        // Zarcillos en espiral.
        g.strokeStyle = "#5C9C46"; g.lineWidth = 2;
        for (const ang of [0.9, 2.1, 3.3, 4.6, 5.7]) {
          const [x, y] = polar(ang, tallo(ang) + 4);
          g.beginPath();
          for (let k = 0; k <= 30; k++) { const u = k / 30, rr = 12 * (1 - u), a = ang + u * TAU * 1.4; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
          g.stroke();
        }
        for (const f of flores) {
          const [x, y] = polar(f.ang, tallo(f.ang) + 2);
          flor(g, x, y, f.tam, f.color, 0.88 + 0.12 * Math.sin((TAU * t) / T + f.ph));
        }
      },
    };
  })();

  // ---------------------------------------------------------------- Corona
  const corona = (() => {
    const T = 3;
    const GEMAS = [[229, 57, 80], [46, 139, 255], [51, 209, 122], [176, 124, 255]];
    function gema(g, x, y, tam, color, brillo) {
      g.save(); g.translate(x, y);
      g.fillStyle = "#7A5200"; g.beginPath(); g.arc(0, 0, tam + 3, 0, TAU); g.fill();
      g.fillStyle = "#E8B84A"; g.beginPath(); g.arc(0, 0, tam + 1.6, 0, TAU); g.fill();
      const lados = 8, pts = [];
      for (let i = 0; i < lados; i++) { const a = (i / lados) * TAU + Math.PI / 8; pts.push([Math.cos(a) * tam, Math.sin(a) * tam]); }
      pts.forEach((p, i) => {
        const q = pts[(i + 1) % lados];
        const luz = 0.55 + 0.45 * Math.cos(((i + 0.5) / lados) * TAU + 2.3);
        g.fillStyle = rgba(color.map((c) => c * (0.45 + 0.75 * luz)), 1);
        g.beginPath(); g.moveTo(0, 0); g.lineTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.closePath(); g.fill();
      });
      g.fillStyle = rgba(color.map((c) => Math.min(255, c * 1.25 + 40)), 1);
      g.beginPath(); for (let i = 0; i < lados; i++) { const a = (i / lados) * TAU + Math.PI / 8; g.lineTo(Math.cos(a) * tam * 0.5, Math.sin(a) * tam * 0.5); } g.closePath(); g.fill();
      g.fillStyle = `rgba(255,255,255,${0.35 + 0.6 * brillo})`;
      g.beginPath(); g.ellipse(-tam * 0.3, -tam * 0.35, tam * 0.28, tam * 0.16, -0.6, 0, TAU); g.fill();
      g.restore();
    }
    return {
      T,
      dibujar(g, t) {
        const brilloAng = (t / T) * TAU - Math.PI / 2;
        const cerca = (ang) => { const d = Math.atan2(Math.sin(ang - brilloAng), Math.cos(ang - brilloAng)); return Math.exp(-(d * d) / 0.08); };
        const Rr = A + 10, ancho = 24;
        // Aro de oro con bisel: bordes oscuros, centro claro.
        const bisel = g.createRadialGradient(C, C, Rr - ancho / 2, C, C, Rr + ancho / 2);
        bisel.addColorStop(0, "#6B4500"); bisel.addColorStop(0.18, "#C99520"); bisel.addColorStop(0.42, "#FFE8A0"); bisel.addColorStop(0.58, "#F4C24A"); bisel.addColorStop(0.85, "#A87410"); bisel.addColorStop(1, "#5A3A00");
        g.strokeStyle = bisel; g.lineWidth = ancho; g.beginPath(); g.arc(C, C, Rr, 0, TAU); g.stroke();
        // Grabado: muescas a lo largo del aro.
        g.strokeStyle = "rgba(90,58,0,0.55)"; g.lineWidth = 1.4;
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * TAU;
          const [x0, y0] = polar(a, Rr - 5), [x1, y1] = polar(a + 0.03, Rr + 5);
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        }
        g.strokeStyle = "rgba(255,246,214,0.9)"; g.lineWidth = 1.6; g.beginPath(); g.arc(C, C, Rr - ancho / 2 + 2, 0, TAU); g.stroke();
        g.strokeStyle = "rgba(70,44,0,0.9)"; g.lineWidth = 1.6; g.beginPath(); g.arc(C, C, Rr + ancho / 2 - 1, 0, TAU); g.stroke();
        // Reflejo que recorre el oro (una vuelta por ciclo).
        g.save(); g.globalCompositeOperation = "lighter";
        for (let i = 0; i < 120; i++) {
          const a0 = (i / 120) * TAU, k = cerca(a0);
          if (k < 0.02) continue;
          g.strokeStyle = `rgba(255,248,220,${0.55 * k})`; g.lineWidth = ancho * 0.7;
          g.beginPath(); g.arc(C, C, Rr, a0, a0 + TAU / 118); g.stroke();
        }
        g.restore();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU + Math.PI / 8;
          const [x, y] = polar(a, Rr);
          gema(g, x, y, 8.5, GEMAS[i % 4], cerca(a));
        }
        // Corona arriba, con un vaivén mínimo.
        const cy = C - Rr - 14 + Math.sin((TAU * t) / T) * 1.6, w = 64, alto = 46;
        const met = g.createLinearGradient(0, cy - alto, 0, cy + 10);
        met.addColorStop(0, "#FFF0B8"); met.addColorStop(0.35, "#FFD45A"); met.addColorStop(0.75, "#D49A1A"); met.addColorStop(1, "#7A5200");
        g.fillStyle = met; g.strokeStyle = "#6B4500"; g.lineWidth = 2.4; g.lineJoin = "round";
        g.beginPath();
        g.moveTo(C - w, cy + 10); g.lineTo(C - w, cy - 6);
        g.lineTo(C - w * 0.98, cy - alto * 0.62); g.lineTo(C - w * 0.5, cy - alto * 0.22);
        g.lineTo(C - w * 0.26, cy - alto * 0.86); g.lineTo(C, cy - alto * 0.32);
        g.lineTo(C + w * 0.26, cy - alto * 0.86); g.lineTo(C + w * 0.5, cy - alto * 0.22);
        g.lineTo(C + w * 0.98, cy - alto * 0.62); g.lineTo(C + w, cy - 6); g.lineTo(C + w, cy + 10);
        g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#B88A1A"; g.fillRect(C - w + 2, cy - 2, w * 2 - 4, 12);
        g.strokeStyle = "rgba(255,244,200,0.8)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(C - w + 3, cy - 1); g.lineTo(C + w - 3, cy - 1); g.stroke();
        for (const [px, py] of [[C - w * 0.98, cy - alto * 0.62], [C - w * 0.26, cy - alto * 0.86], [C + w * 0.26, cy - alto * 0.86], [C + w * 0.98, cy - alto * 0.62]]) {
          const pg = g.createRadialGradient(px - 2, py - 2, 0.5, px, py, 5.5);
          pg.addColorStop(0, "#FFFFFF"); pg.addColorStop(1, "#C9C2B0");
          g.fillStyle = pg; g.beginPath(); g.arc(px, py, 5, 0, TAU); g.fill();
        }
        gema(g, C, cy + 4, 6, GEMAS[0], cerca(-Math.PI / 2));
        gema(g, C - w * 0.55, cy + 4, 4.5, GEMAS[1], cerca(-Math.PI / 2 - 0.3));
        gema(g, C + w * 0.55, cy + 4, 4.5, GEMAS[2], cerca(-Math.PI / 2 + 0.3));
      },
    };
  })();

  // ---------------------------------------------------------------- Marea
  const marea = (() => {
    const T = 3;
    const r = azar(89);
    const burbujas = Array.from({ length: 22 }, () => ({ ang: entre(r, 0, TAU), nace: entre(r, 0, T), vida: entre(r, 1.2, 2.4), tam: entre(r, 3, 9), ph: entre(r, 0, TAU), sube: entre(r, 40, 80) }));
    const ola = (ang, t, capa) => A + 8 + capa * 2 + Math.sin(ang * 6 - (TAU * 2 * t) / T + capa) * 4 + Math.sin(ang * 11 + (TAU * 3 * t) / T + capa * 2) * 2.2;
    return {
      T,
      dibujar(g, t) {
        fueraDelAvatar(g, () => {
          const halo = g.createRadialGradient(C, C, A, C, C, A + 44);
          halo.addColorStop(0, "rgba(40,170,240,0.22)"); halo.addColorStop(1, "rgba(20,90,200,0)");
          g.fillStyle = halo; g.beginPath(); g.arc(C, C, A + 44, 0, TAU); g.fill();
          for (const b of burbujas) {
            const edad = ((t - b.nace) % T + T) % T;
            if (edad > b.vida) continue;
            const u = edad / b.vida;
            const [x0, y0] = polar(b.ang, A + 14);
            const sale = 18 + b.sube * u;
            const x = x0 + Math.cos(b.ang) * sale * 0.6 + Math.sin(TAU * 2 * (t / T) + b.ph) * 4, y = y0 + Math.sin(b.ang) * sale * 0.6 - b.sube * u;
            const a = Math.sin(Math.PI * u);
            const tam = b.tam * (0.6 + 0.4 * u);
            g.fillStyle = `rgba(160,225,255,${0.12 * a})`; g.beginPath(); g.arc(x, y, tam, 0, TAU); g.fill();
            g.strokeStyle = `rgba(210,245,255,${0.8 * a})`; g.lineWidth = 1.3; g.beginPath(); g.arc(x, y, tam, 0, TAU); g.stroke();
            g.fillStyle = `rgba(255,255,255,${0.9 * a})`; g.beginPath(); g.ellipse(x - tam * 0.35, y - tam * 0.4, tam * 0.28, tam * 0.16, -0.6, 0, TAU); g.fill();
          }
        }, 4);
        // Tres capas de agua: honda, media y la cresta con espuma.
        const capa = (c, ancho, color) => {
          g.strokeStyle = color; g.lineWidth = ancho; g.lineJoin = "round";
          g.beginPath();
          for (let i = 0; i <= 240; i++) { const a = (i / 240) * TAU, [x, y] = polar(a, ola(a, t, c)); i ? g.lineTo(x, y) : g.moveTo(x, y); }
          g.closePath(); g.stroke();
        };
        capa(0, 20, "rgba(10,70,150,0.95)");
        capa(1, 12, "rgba(24,140,214,0.95)");
        capa(2, 6, "rgba(90,200,245,0.95)");
        capa(3, 2.4, "rgba(230,250,255,0.95)");
        // Espuma que corre por la cresta.
        for (let i = 0; i < 70; i++) {
          const a = (i / 70) * TAU + (TAU * t) / T;
          const k = 0.5 + 0.5 * Math.sin(a * 4 - (TAU * 2 * t) / T);
          if (k < 0.55) continue;
          const [x, y] = polar(a, ola(a, t, 3) + 1.5);
          g.fillStyle = `rgba(255,255,255,${(k - 0.55) * 2})`; g.beginPath(); g.arc(x, y, 1.8, 0, TAU); g.fill();
        }
        // Reflejos de luz en el agua.
        g.save(); g.globalCompositeOperation = "lighter";
        for (let i = 0; i < 9; i++) {
          const a0 = (i / 9) * TAU + (TAU * t) / T * (i % 2 ? 1 : -1) * 0.5;
          g.strokeStyle = "rgba(180,240,255,0.35)"; g.lineWidth = 2;
          g.beginPath(); g.arc(C, C, ola(a0, t, 1), a0, a0 + 0.18); g.stroke();
        }
        g.restore();
      },
    };
  })();

  // ---------------------------------------------------------------- Glitch
  const glitch = (() => {
    const T = 2, CUADROS = 50;
    const fallas = [[0.32, 0.12], [0.98, 0.07], [1.46, 0.16]];
    let capa = null;
    function neon(t) {
      if (!capa) { capa = document.createElement("canvas"); capa.width = S; capa.height = S; }
      const g = capa.getContext("2d");
      g.clearRect(0, 0, S, S);
      const parpadeo = 0.9 + 0.1 * Math.sin((TAU * 7 * t) / T);
      g.globalCompositeOperation = "lighter";
      for (const [ancho, a] of [[18, 0.12], [10, 0.25], [5, 0.7], [2.2, 1]]) {
        g.strokeStyle = `rgba(255,46,140,${a * parpadeo})`; g.lineWidth = ancho; g.beginPath(); g.arc(C, C, A + 6, 0, TAU); g.stroke();
      }
      g.globalCompositeOperation = "source-over";
      g.strokeStyle = "rgba(40,6,40,0.55)"; g.lineWidth = 2; g.beginPath(); g.arc(C, C, A + 1, 0, TAU); g.stroke();
      g.globalCompositeOperation = "lighter";
      for (const [ancho, a] of [[12, 0.12], [5, 0.4], [1.8, 1]]) {
        g.strokeStyle = `rgba(8,247,254,${a * parpadeo})`; g.lineWidth = ancho; g.beginPath(); g.arc(C, C, A + 18, 0, TAU); g.stroke();
      }
      // Marcas de circuito: segmentos que corren.
      for (let i = 0; i < 12; i++) {
        const a0 = (i / 12) * TAU + (TAU * t) / T * (i % 2 ? 1 : -1) * 0.25;
        g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 3;
        g.beginPath(); g.arc(C, C, A + 12, a0, a0 + 0.08); g.stroke();
      }
      g.globalCompositeOperation = "source-over";
      return capa;
    }
    return {
      T,
      dibujar(g, t) {
        const cuadro = Math.floor((t / T) * CUADROS);
        let fuerza = 0;
        for (const [en, dura] of fallas) if (t >= en && t < en + dura) fuerza = 1;
        const lienzo = neon(t);
        const rr = azar(900 + cuadro);
        if (!fuerza) {
          g.globalCompositeOperation = "lighter";
          g.globalAlpha = 0.5; g.drawImage(lienzo, -2, 0); g.globalAlpha = 1;
          g.drawImage(lienzo, 0, 0);
          g.globalCompositeOperation = "source-over";
          return;
        }
        // Falla: el aro se corta en franjas desplazadas y se separa en rojo, verde y azul.
        const franjas = 9;
        g.globalCompositeOperation = "lighter";
        for (let f = 0; f < franjas; f++) {
          const y0 = (S / franjas) * f, alto = S / franjas;
          const dx = (rr() - 0.5) * 46;
          for (const [col, off] of [["#FF2E63", -6], ["#08F7FE", 6]]) {
            g.save(); g.beginPath(); g.rect(0, y0, S, alto); g.clip();
            g.globalAlpha = 0.6; g.drawImage(lienzo, dx + off, 0); g.restore();
            void col;
          }
          g.save(); g.beginPath(); g.rect(0, y0, S, alto); g.clip(); g.globalAlpha = 1; g.drawImage(lienzo, dx, 0); g.restore();
        }
        g.globalCompositeOperation = "source-over";
        for (let i = 0; i < 10; i++) {
          const ang = rr() * TAU, [x, y] = polar(ang, A + 10 + rr() * 50);
          g.fillStyle = ["#FF2E63", "#08F7FE", "#FFFFFF", "#39FF14"][i % 4];
          g.globalAlpha = 0.85; g.fillRect(x, y, 8 + rr() * 34, 3 + rr() * 5); g.globalAlpha = 1;
        }
      },
    };
  })();

  window.MARCOS = { S, C, A, lista: { fenix, escarcha, tormenta, orbita, enredadera, corona, marea, glitch } };
  window.dibujarMarco = function (id, lienzo, t) {
    const g = lienzo.getContext("2d");
    g.setTransform(lienzo.width / S, 0, 0, lienzo.height / S, 0, 0);
    g.clearRect(0, 0, S, S);
    window.MARCOS.lista[id].dibujar(g, t);
  };
})();

// Dibujo de los fondos de chat (0262): una escena ilustrada por fondo, armada
// como un SVG en texto. La web lo usa como imagen de fondo (data URI) y la app lo
// dibuja con SvgXml, así se ve igual en los dos lados. Los slugs y precios viven
// en fondosChat.ts; acá solo está el dibujo.
//
// Reglas del dibujo:
// - Sin azar en el render: cada escena usa su propia semilla fija.
// - Se arma para el tamaño real del lienzo (ancho × alto): las cosas del cielo se
//   reparten por todo el ancho y lo de abajo (montañas, árboles, ciudad) queda
//   apoyado en el borde inferior, sea una pantalla de teléfono o una ventana ancha.
// - La cantidad de detalles crece con el área, con tope, para que la app no tenga
//   que dibujar miles de elementos.
// - Todo es oscuro y de poco contraste en el centro, con viñeta en los bordes: los
//   globos de mensaje se leen encima.
// - Solo elementos que react-native-svg entiende: rect, circle, ellipse, path,
//   line, g (opacity/transform), linearGradient, radialGradient, clipPath, pattern.

type Parada = [number, string, number?];

interface Lienzo {
  W: number;
  H: number;
  // Escala de los dibujos (1 ≈ teléfono de 400 × 700).
  k: number;
  // Área relativa a un teléfono, para la cantidad de detalles.
  area: number;
  id: (nombre: string) => string;
  azar: () => number;
}

const r = (v: number) => Math.round(v * 10) / 10;

// mulberry32: mismo resultado en V8 (web) y Hermes (app).
function generador(semilla: number): () => number {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function cantidad(L: Lienzo, base: number, minimo = 4): number {
  return Math.max(minimo, Math.round(base * Math.min(L.area, 2.2)));
}

function entre(L: Lienzo, a: number, b: number): number {
  return a + (b - a) * L.azar();
}

function paradas(lista: Parada[]): string {
  return lista.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("");
}

function lineal(id: string, lista: Parada[], x1 = 0, y1 = 0, x2 = 0, y2 = 1): string {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${paradas(lista)}</linearGradient>`;
}

function radial(id: string, lista: Parada[], cx = 0.5, cy = 0.5, rr = 0.5): string {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rr}">${paradas(lista)}</radialGradient>`;
}

// Halo suave: un círculo con degradé radial del color al transparente.
function halo(L: Lienzo, nombre: string, color: string, fuerza: number): { def: string; usar: (x: number, y: number, radio: number) => string } {
  const id = L.id(nombre);
  return {
    def: radial(id, [
      [0, color, fuerza],
      [0.45, color, fuerza * 0.35],
      [1, color, 0],
    ]),
    usar: (x, y, radio) => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(radio)}" fill="url(#${id})"/>`,
  };
}

function poligono(puntos: [number, number][]): string {
  return `M${puntos.map(([a, b]) => `${r(a)} ${r(b)}`).join("L")}Z`;
}

// Pino en capas, apoyado en (x, base).
function pino(x: number, base: number, h: number, w: number): string {
  return poligono([
    [x, base - h],
    [x + w * 0.2, base - h * 0.72],
    [x + w * 0.1, base - h * 0.72],
    [x + w * 0.36, base - h * 0.42],
    [x + w * 0.2, base - h * 0.42],
    [x + w * 0.5, base - h * 0.1],
    [x + w * 0.07, base - h * 0.1],
    [x + w * 0.07, base],
    [x - w * 0.07, base],
    [x - w * 0.07, base - h * 0.1],
    [x - w * 0.5, base - h * 0.1],
    [x - w * 0.2, base - h * 0.42],
    [x - w * 0.36, base - h * 0.42],
    [x - w * 0.1, base - h * 0.72],
    [x - w * 0.2, base - h * 0.72],
  ]);
}

// Hilera de pinos que tapa todo hasta el borde de abajo.
function bosqueDePinos(L: Lienzo, base: number, altMin: number, altMax: number, separacion: number, color: string, opacidad = 1, soloBordes = 0): string {
  const partes: string[] = [];
  let x = -separacion * entre(L, 0, 1);
  while (x < L.W + separacion) {
    // soloBordes: deja el centro libre (los árboles cercanos enmarcan la escena).
    const lejosDelCentro = Math.abs(x - L.W / 2) / (L.W / 2);
    if (!soloBordes || lejosDelCentro > soloBordes) {
      const h = entre(L, altMin, altMax) * (soloBordes ? 0.6 + lejosDelCentro * 0.5 : 1);
      partes.push(pino(x, base + entre(L, 0, 6) * L.k, h, h * entre(L, 0.36, 0.46)));
    }
    x += separacion * entre(L, 0.55, 1.1);
  }
  return `<g fill="${color}" opacity="${opacidad}"><path d="${partes.join("")}"/><rect x="0" y="${r(base - altMin * 0.1)}" width="${r(L.W)}" height="${r(L.H - base + altMin * 0.1 + 2)}"/></g>`;
}

// Cordillera de picos (máximo de triángulos con borde rocoso).
function cordillera(L: Lienzo, base: number, picos: number, altMin: number, altMax: number): { d: string; cimas: { x: number; y: number; h: number; p: number }[] } {
  const cimas = Array.from({ length: picos }, (_, i) => {
    const x = ((i + entre(L, 0.15, 0.85)) / picos) * (L.W + 80 * L.k) - 40 * L.k;
    return { x, y: 0, h: entre(L, altMin, altMax), p: entre(L, 0.65, 1.15) };
  });
  const paso = Math.max(4, 7 * L.k);
  const pts: [number, number][] = [[-10, L.H + 2]];
  for (let x = -10; x <= L.W + 10; x += paso) {
    let alt = 0;
    for (const c of cimas) alt = Math.max(alt, c.h - Math.abs(x - c.x) * c.p);
    alt = Math.max(alt, 8 * L.k) + entre(L, -2.2, 2.2) * L.k;
    pts.push([x, base - alt]);
  }
  pts.push([L.W + 10, L.H + 2]);
  for (const c of cimas) c.y = base - c.h;
  return { d: poligono(pts), cimas };
}

// Colinas suaves (suma de senos).
function colinas(L: Lienzo, base: number, amp: number, fase: number): string {
  const pts: [number, number][] = [[-10, L.H + 2]];
  const paso = Math.max(6, 10 * L.k);
  for (let x = -10; x <= L.W + 10; x += paso) {
    const t = x / L.W;
    pts.push([x, base - amp * (0.55 + 0.3 * Math.sin(t * 5.3 + fase) + 0.15 * Math.sin(t * 13.1 + fase * 2))]);
  }
  pts.push([L.W + 10, L.H + 2]);
  return poligono(pts);
}

function estrellas(L: Lienzo, n: number, yMax: number, colores: string[], rMin: number, rMax: number, opMin: number, opMax: number): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = entre(L, 0, L.W);
    // Más densas arriba.
    const y = Math.pow(L.azar(), 1.4) * yMax;
    s += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(entre(L, rMin, rMax) * L.k)}" fill="${colores[i % colores.length]}" opacity="${r(entre(L, opMin, opMax) * 100) / 100}"/>`;
  }
  return s;
}

function vineta(L: Lienzo, fuerza = 0.55): { def: string; capa: string } {
  const id = L.id("vineta");
  return {
    def: radial(id, [
      [0, "#000", 0],
      [0.62, "#000", 0],
      [1, "#000", fuerza],
    ], 0.5, 0.48, 0.72),
    capa: `<rect width="${r(L.W)}" height="${r(L.H)}" fill="url(#${id})"/>`,
  };
}

function cielo(L: Lienzo, lista: Parada[]): { def: string; capa: string } {
  const id = L.id("cielo");
  return { def: lineal(id, lista), capa: `<rect width="${r(L.W)}" height="${r(L.H)}" fill="url(#${id})"/>` };
}

// ---------------------------------------------------------------- Cuaderno
function cuaderno(L: Lienzo): string {
  const { W, H, k } = L;
  const fondo = cielo(L, [
    [0, "#1A2246"],
    [0.55, "#121935"],
    [1, "#0B1022"],
  ]);
  const g = 18 * k;
  const idMenor = L.id("cuadro");
  const idMayor = L.id("cuadroMayor");
  const idTexto = L.id("papel");
  const tinta = "#7F92D6";
  const trazoBase = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const trazo = `${trazoBase} stroke="#A9B8EE"`;
  const v = vineta(L, 0.6);
  const margen = 44 * k;

  // Garabatos de clase, en tiza clara y muy suaves.
  const garabatos: string[] = [];
  // Triángulo rectángulo con su marca de ángulo.
  {
    const x = W * 0.6;
    const y = H * 0.17;
    const a = 78 * k;
    garabatos.push(`<path d="M${r(x)} ${r(y)}L${r(x)} ${r(y + a)}L${r(x + a * 1.3)} ${r(y + a)}Z" ${trazo} stroke-width="${r(1.5 * k)}"/>`);
    garabatos.push(`<path d="M${r(x)} ${r(y + a - 10 * k)}H${r(x + 10 * k)}V${r(y + a)}" ${trazo} stroke-width="${r(1.1 * k)}"/>`);
    garabatos.push(`<path d="M${r(x + a * 1.3 - 22 * k)} ${r(y + a)}A${r(22 * k)} ${r(22 * k)} 0 0 1 ${r(x + a * 1.3 - 20 * k)} ${r(y + a - 13 * k)}" ${trazo} stroke-width="${r(1.1 * k)}"/>`);
  }
  // Ejes con una parábola.
  {
    const x = Math.max(margen + 40 * k, W * 0.24);
    const y = H * 0.42;
    const a = 56 * k;
    garabatos.push(`<path d="M${r(x - a)} ${r(y)}H${r(x + a)}M${r(x)} ${r(y + a * 0.35)}V${r(y - a)}M${r(x + a - 6 * k)} ${r(y - 4 * k)}L${r(x + a)} ${r(y)}L${r(x + a - 6 * k)} ${r(y + 4 * k)}M${r(x - 4 * k)} ${r(y - a + 6 * k)}L${r(x)} ${r(y - a)}L${r(x + 4 * k)} ${r(y - a + 6 * k)}" ${trazo} stroke-width="${r(1.2 * k)}"/>`);
    garabatos.push(`<path d="M${r(x - a * 0.75)} ${r(y - a * 0.85)}Q${r(x)} ${r(y + a * 0.75)} ${r(x + a * 0.75)} ${r(y - a * 0.85)}" ${trazoBase} stroke-width="${r(1.6 * k)}" stroke="#FFB0C8"/>`);
  }
  // Onda seno.
  {
    const y = H * 0.66;
    const x0 = W * 0.52;
    const x1 = W * 0.95;
    let d = `M${r(x0)} ${r(y)}`;
    for (let x = x0; x <= x1; x += 4 * k) d += `L${r(x)} ${r(y - Math.sin(((x - x0) / (36 * k)) * Math.PI) * 14 * k)}`;
    garabatos.push(`<path d="${d}" ${trazoBase} stroke-width="${r(1.5 * k)}" stroke="#8FE3FF"/>`);
    garabatos.push(`<path d="M${r(x0 - 6 * k)} ${r(y)}H${r(x1 + 6 * k)}" ${trazo} stroke-width="${r(0.9 * k)}"/>`);
  }
  // Círculo con radio y ángulo.
  {
    const x = W * 0.78;
    const y = H * 0.87;
    const a = 34 * k;
    garabatos.push(`<circle cx="${r(x)}" cy="${r(y)}" r="${r(a)}" ${trazo} stroke-width="${r(1.4 * k)}"/>`);
    garabatos.push(`<path d="M${r(x)} ${r(y)}L${r(x + a)} ${r(y)}M${r(x)} ${r(y)}L${r(x + a * 0.6)} ${r(y - a * 0.8)}M${r(x + 12 * k)} ${r(y)}A${r(12 * k)} ${r(12 * k)} 0 0 0 ${r(x + 7.2 * k)} ${r(y - 9.6 * k)}" ${trazo} stroke-width="${r(1.1 * k)}"/>`);
  }
  // Cubo en perspectiva.
  {
    const x = Math.max(margen + 34 * k, W * 0.3);
    const y = H * 0.82;
    const a = 34 * k;
    const o = 15 * k;
    garabatos.push(`<path d="M${r(x)} ${r(y)}h${r(a)}v${r(a)}h${r(-a)}Z M${r(x + o)} ${r(y - o)}h${r(a)}v${r(a)}h${r(-a)}Z M${r(x)} ${r(y)}l${r(o)} ${r(-o)}M${r(x + a)} ${r(y)}l${r(o)} ${r(-o)}M${r(x + a)} ${r(y + a)}l${r(o)} ${r(-o)}M${r(x)} ${r(y + a)}l${r(o)} ${r(-o)}" ${trazo} stroke-width="${r(1.2 * k)}"/>`);
  }
  // Vectores.
  {
    const x = Math.max(margen + 20 * k, W * 0.16);
    const y = H * 0.2;
    garabatos.push(`<path d="M${r(x)} ${r(y)}l${r(52 * k)} ${r(-26 * k)}M${r(x)} ${r(y)}l${r(18 * k)} ${r(-50 * k)}M${r(x + 52 * k)} ${r(y - 26 * k)}l${r(-9 * k)} ${r(-1 * k)}M${r(x + 52 * k)} ${r(y - 26 * k)}l${r(-5 * k)} ${r(7 * k)}M${r(x + 18 * k)} ${r(y - 50 * k)}l${r(-6 * k)} ${r(7 * k)}M${r(x + 18 * k)} ${r(y - 50 * k)}l${r(4 * k)} ${r(8 * k)}" ${trazoBase} stroke-width="${r(1.3 * k)}" stroke="#FFD27A"/>`);
  }

  // Lápiz apoyado abajo a la izquierda.
  const lx = Math.max(margen + 26 * k, W * 0.12);
  const ly = H - 26 * k;
  const lapiz = `<g transform="translate(${r(lx)} ${r(ly)}) rotate(-24)" opacity="0.42">
<rect x="0" y="${r(-5 * k)}" width="${r(96 * k)}" height="${r(10 * k)}" rx="${r(1.5 * k)}" fill="#E8A93A"/>
<rect x="0" y="${r(-5 * k)}" width="${r(96 * k)}" height="${r(3.3 * k)}" fill="#F7C35A"/>
<rect x="${r(96 * k)}" y="${r(-5 * k)}" width="${r(10 * k)}" height="${r(10 * k)}" fill="#C9CED8"/>
<rect x="${r(106 * k)}" y="${r(-5 * k)}" width="${r(12 * k)}" height="${r(10 * k)}" rx="${r(3 * k)}" fill="#F08AA0"/>
<path d="M0 ${r(-5 * k)}L${r(-20 * k)} 0L0 ${r(5 * k)}Z" fill="#F2D9B0"/>
<path d="M${r(-13 * k)} ${r(-1.8 * k)}L${r(-20 * k)} 0L${r(-13 * k)} ${r(1.8 * k)}Z" fill="#2B2F3A"/>
</g>`;

  const agujeros = [0.18, 0.5, 0.82]
    .map((f) => `<circle cx="${r(18 * k)}" cy="${r(H * f)}" r="${r(6.5 * k)}" fill="#05070F" opacity="0.75"/><circle cx="${r(18 * k)}" cy="${r(H * f)}" r="${r(6.5 * k)}" fill="none" stroke="${tinta}" stroke-opacity="0.35" stroke-width="${r(0.8 * k)}"/>`)
    .join("");

  // Mancha de café: dos anillos imperfectos.
  const cx = W * 0.86;
  const cy = H * 0.38;
  const cafe = `<g fill="none" stroke="#C9A36B"><circle cx="${r(cx)}" cy="${r(cy)}" r="${r(34 * k)}" stroke-width="${r(4.5 * k)}" opacity="0.1"/><circle cx="${r(cx + 2 * k)}" cy="${r(cy + 1 * k)}" r="${r(30 * k)}" stroke-width="${r(1.2 * k)}" opacity="0.14"/></g>`;

  return `<defs>${fondo.def}${v.def}
<pattern id="${idTexto}" width="${r(5 * k)}" height="${r(5 * k)}" patternUnits="userSpaceOnUse"><circle cx="${r(1 * k)}" cy="${r(1.5 * k)}" r="${r(0.45 * k)}" fill="#C8D2FF" opacity="0.06"/><circle cx="${r(3.6 * k)}" cy="${r(3.8 * k)}" r="${r(0.35 * k)}" fill="#000" opacity="0.25"/></pattern>
<pattern id="${idMenor}" width="${r(g)}" height="${r(g)}" patternUnits="userSpaceOnUse"><path d="M${r(g)} 0H0V${r(g)}" fill="none" stroke="${tinta}" stroke-opacity="0.2" stroke-width="${r(0.6 * k)}"/></pattern>
<pattern id="${idMayor}" width="${r(g * 4)}" height="${r(g * 4)}" patternUnits="userSpaceOnUse"><path d="M${r(g * 4)} 0H0V${r(g * 4)}" fill="none" stroke="${tinta}" stroke-opacity="0.32" stroke-width="${r(1 * k)}"/></pattern>
</defs>
${fondo.capa}
<rect width="${r(W)}" height="${r(H)}" fill="url(#${idTexto})"/>
<rect width="${r(W)}" height="${r(H)}" fill="url(#${idMenor})"/>
<rect width="${r(W)}" height="${r(H)}" fill="url(#${idMayor})"/>
<path d="M${r(margen)} 0V${r(H)}" stroke="#FF6B8B" stroke-opacity="0.38" stroke-width="${r(1.3 * k)}"/>
<path d="M${r(margen + 4 * k)} 0V${r(H)}" stroke="#FF6B8B" stroke-opacity="0.18" stroke-width="${r(0.8 * k)}"/>
${agujeros}
${cafe}
<g opacity="0.26">${garabatos.join("")}</g>
${lapiz}
${v.capa}`;
}

// ---------------------------------------------------------------- Noche estrellada
function nocheEstrellada(L: Lienzo): string {
  const { W, H, k } = L;
  const fondo = cielo(L, [
    [0, "#0B1238"],
    [0.55, "#0A0F2C"],
    [0.85, "#141C4C"],
    [1, "#1B2558"],
  ]);
  const v = vineta(L, 0.5);
  const brillo = halo(L, "brillo", "#DCE6FF", 0.55);
  const luna = halo(L, "luna", "#F6F0D2", 0.32);
  const via = L.id("via");
  const fugaz = L.id("fugaz");
  const horizonte = halo(L, "horizonte", "#4A5FC0", 0.35);

  // Vía Láctea: banda diagonal de nubes suaves y estrellas apretadas.
  const cx = W * 0.5;
  const cy = H * 0.4;
  const largo = Math.hypot(W, H) * 0.75;
  let banda = "";
  for (let i = 0; i < 5; i++) {
    const t = (i / 4 - 0.5) * largo * 1.3;
    banda += `<ellipse cx="${r(t)}" cy="${r(entre(L, -10, 10) * k)}" rx="${r(largo * 0.42)}" ry="${r(entre(L, 38, 60) * k)}" fill="url(#${via})"/>`;
  }
  const nBanda = cantidad(L, 120, 30);
  for (let i = 0; i < nBanda; i++) {
    const t = (L.azar() * 2 - 1) * largo;
    const d = (L.azar() + L.azar() + L.azar() - 1.5) * 34 * k;
    banda += `<circle cx="${r(t)}" cy="${r(d)}" r="${r(entre(L, 0.35, 0.95) * k)}" fill="#E6ECFF" opacity="${r(entre(L, 0.25, 0.75) * 100) / 100}"/>`;
  }

  // Constelaciones: el Carro y Casiopea.
  const carro: [number, number][] = [
    [0.1, 0.14],
    [0.18, 0.12],
    [0.25, 0.15],
    [0.31, 0.19],
    [0.33, 0.27],
    [0.43, 0.28],
    [0.45, 0.2],
  ];
  const casiopea: [number, number][] = [
    [0.6, 0.5],
    [0.67, 0.45],
    [0.72, 0.51],
    [0.79, 0.44],
    [0.87, 0.48],
  ];
  const lineas = (pts: [number, number][], extra = "") => `M${pts.map(([a, b]) => `${r(a * W)} ${r(b * H)}`).join("L")}${extra}`;
  const constelaciones =
    `<path d="${lineas(carro, `L${r(0.31 * W)} ${r(0.19 * H)}`)} ${lineas(casiopea)}" fill="none" stroke="#C9D6FF" stroke-opacity="0.2" stroke-width="${r(0.8 * k)}" stroke-dasharray="${r(3 * k)} ${r(3 * k)}"/>` +
    [...carro, ...casiopea].map(([a, b]) => brillo.usar(a * W, b * H, 7 * k) + `<circle cx="${r(a * W)}" cy="${r(b * H)}" r="${r(1.5 * k)}" fill="#FFFFFF" opacity="0.85"/>`).join("");

  // Estrellas sueltas con algunas brillantes.
  const sueltas = estrellas(L, cantidad(L, 110, 24), H * 0.85, ["#FFFFFF", "#CFE0FF", "#FFE6B0", "#FFFFFF"], 0.35, 1.1, 0.25, 0.85);
  let brillantes = "";
  for (let i = 0; i < cantidad(L, 7, 3); i++) {
    const x = entre(L, 0.05, 0.95) * W;
    const y = entre(L, 0.05, 0.7) * H;
    brillantes += brillo.usar(x, y, 9 * k) + `<circle cx="${r(x)}" cy="${r(y)}" r="${r(1.3 * k)}" fill="#FFFFFF"/>`;
  }

  // Luna creciente con luz cenicienta.
  const lx = W * 0.8;
  const ly = H * 0.11;
  const lr = 22 * k;
  const lunaDibujo = `${luna.usar(lx, ly, 95 * k)}<circle cx="${r(lx)}" cy="${r(ly)}" r="${r(lr)}" fill="#C9D3F5" opacity="0.08"/><path d="M${r(lx)} ${r(ly - lr)}A${r(lr)} ${r(lr)} 0 1 1 ${r(lx)} ${r(ly + lr)}A${r(lr * 0.58)} ${r(lr)} 0 1 0 ${r(lx)} ${r(ly - lr)}Z" fill="#FBF4DA" opacity="0.92"/>`;

  // Estrella fugaz.
  const fx = W * 0.58;
  const fy = H * 0.07;
  const estrellaFugaz = `<path d="M${r(fx)} ${r(fy)}L${r(fx - 90 * k)} ${r(fy + 36 * k)}" stroke="url(#${fugaz})" stroke-width="${r(1.4 * k)}" stroke-linecap="round"/><circle cx="${r(fx)}" cy="${r(fy)}" r="${r(1.6 * k)}" fill="#FFFFFF"/>`;

  // Colinas, pinos y una cabaña con la ventana encendida.
  const base = H - 30 * k;
  const casaX = W * 0.72;
  const casaY = base - 8 * k;
  const casa = `<g fill="#05081A"><path d="M${r(casaX - 16 * k)} ${r(casaY)}V${r(casaY - 16 * k)}L${r(casaX)} ${r(casaY - 30 * k)}L${r(casaX + 16 * k)} ${r(casaY - 16 * k)}V${r(casaY)}Z"/><rect x="${r(casaX + 6 * k)}" y="${r(casaY - 30 * k)}" width="${r(4 * k)}" height="${r(10 * k)}"/></g><rect x="${r(casaX - 5 * k)}" y="${r(casaY - 14 * k)}" width="${r(7 * k)}" height="${r(6 * k)}" fill="#FFC86B" opacity="0.9"/>`;
  const ventanaHalo = halo(L, "ventana", "#FFB84A", 0.5);
  let pinos = "";
  for (let i = 0; i < 7; i++) {
    const x = i < 3 ? W * (0.05 + i * 0.07) : W * (0.82 + (i - 3) * 0.05);
    const h = entre(L, 26, 44) * k;
    pinos += pino(x, base + 6 * k - Math.sin(i) * 2 * k, h, h * 0.42);
  }

  return `<defs>${fondo.def}${v.def}${brillo.def}${luna.def}${horizonte.def}${ventanaHalo.def}
${radial(via, [
    [0, "#9FB0FF", 0.13],
    [0.5, "#7D8CE0", 0.06],
    [1, "#7D8CE0", 0],
  ])}
${lineal(fugaz, [
    [0, "#FFFFFF", 0.9],
    [1, "#FFFFFF", 0],
  ], 0, 0, 1, 0)}
</defs>
${fondo.capa}
${horizonte.usar(W * 0.5, H * 1.02, Math.max(W, H) * 0.55)}
<g transform="translate(${r(cx)} ${r(cy)}) rotate(-32)">${banda}</g>
${sueltas}
${brillantes}
${constelaciones}
${lunaDibujo}
${estrellaFugaz}
<path d="${colinas(L, base - 22 * k, 40 * k, 1.3)}" fill="#111845"/>
<path d="${colinas(L, base, 26 * k, 4.1)}" fill="#070B22"/>
<path d="${pinos}" fill="#070B22"/>
${ventanaHalo.usar(casaX - 1.5 * k, casaY - 11 * k, 26 * k)}
${casa}
${v.capa}`;
}

// ---------------------------------------------------------------- Océano
function oceano(L: Lienzo): string {
  const { W, H, k } = L;
  const fondo = cielo(L, [
    [0, "#0C5C7C"],
    [0.3, "#07405E"],
    [0.72, "#052A42"],
    [1, "#031827"],
  ]);
  const v = vineta(L, 0.5);
  const superficie = halo(L, "superficie", "#8EF0FF", 0.35);
  const rayo = L.id("rayo");
  const arena = L.id("arena");
  const medusa = halo(L, "medusa", "#FF9AD5", 0.4);
  const tinta = "#4FE0F5";

  // Rayos de luz desde la superficie.
  let rayos = "";
  for (let i = 0; i < 6; i++) {
    const x = W * (0.06 + i * 0.18) + entre(L, -12, 12) * k;
    const a = entre(L, 14, 34) * k;
    const largo = H * entre(L, 0.55, 0.8);
    const deriva = largo * 0.22;
    rayos += `<path d="${poligono([
      [x - a / 2, 0],
      [x + a / 2, 0],
      [x + deriva + a * 1.6, largo],
      [x + deriva - a * 0.4, largo],
    ])}" fill="url(#${rayo})" opacity="${r(entre(L, 0.5, 1) * 100) / 100}"/>`;
  }

  // Reflejos de la superficie.
  let ondas = "";
  for (let i = 0; i < 5; i++) {
    const y = (8 + i * 9) * k;
    let d = `M-10 ${r(y)}`;
    const largo = 40 * k + i * 8 * k;
    for (let x = -10; x < W + largo; x += largo) d += `Q${r(x + largo / 4)} ${r(y - 4 * k)} ${r(x + largo / 2)} ${r(y)}T${r(x + largo)} ${r(y)}`;
    ondas += `<path d="${d}" fill="none" stroke="#BFF6FF" stroke-opacity="${r((0.3 - i * 0.05) * 100) / 100}" stroke-width="${r(1.1 * k)}"/>`;
  }

  // Cardúmenes.
  const pez = (x: number, y: number, t: number, izq: boolean) => {
    const s = t * k * (izq ? -1 : 1);
    const m = (a: number, b: number) => `${r(x + a * s)} ${r(y + b * Math.abs(s))}`;
    return `M${m(-6, 0)}Q${m(-1, -3.4)} ${m(5, 0)}Q${m(-1, 3.4)} ${m(-6, 0)}ZM${m(-5.5, 0)}L${m(-9.5, -3)}L${m(-9.5, 3)}Z`;
  };
  let peces = "";
  const cardumenes: [number, number, boolean][] = [
    [0.7, 0.3, true],
    [0.26, 0.56, false],
  ];
  for (const [fx, fy, izq] of cardumenes) {
    let d = "";
    for (let i = 0; i < cantidad(L, 12, 6); i++) d += pez(W * fx + entre(L, -50, 50) * k, H * fy + entre(L, -26, 26) * k, entre(L, 1.1, 1.7), izq);
    peces += `<path d="${d}" fill="${tinta}" opacity="0.2"/>`;
  }

  // Medusas.
  const medusas = [
    [0.18, 0.24, 1],
    [0.84, 0.5, 0.75],
  ]
    .map(([fx, fy, t]) => {
      const x = W * fx;
      const y = H * fy;
      const s = t * k;
      let tent = "";
      for (let j = -2; j <= 2; j++) {
        const x0 = x + j * 4.5 * s;
        tent += `M${r(x0)} ${r(y + 2 * s)}q${r(3 * s)} ${r(8 * s)} 0 ${r(16 * s)}t0 ${r(16 * s)}`;
      }
      return `${medusa.usar(x, y - 4 * s, 34 * s)}<path d="M${r(x - 15 * s)} ${r(y + 2 * s)}Q${r(x - 15 * s)} ${r(y - 16 * s)} ${r(x)} ${r(y - 16 * s)}Q${r(x + 15 * s)} ${r(y - 16 * s)} ${r(x + 15 * s)} ${r(y + 2 * s)}Q${r(x)} ${r(y - 2 * s)} ${r(x - 15 * s)} ${r(y + 2 * s)}Z" fill="#FFB3E0" opacity="0.28"/><path d="${tent}" fill="none" stroke="#FFB3E0" stroke-opacity="0.24" stroke-width="${r(1 * s)}" stroke-linecap="round"/>`;
    })
    .join("");

  // Burbujas que suben en columnas.
  let burbujas = "";
  for (let i = 0; i < cantidad(L, 26, 8); i++) {
    const columna = [0.12, 0.47, 0.9][i % 3];
    const y = H * (1 - Math.pow(L.azar(), 0.8) * 0.85);
    const x = W * columna + Math.sin(y / (30 * k)) * 10 * k + entre(L, -6, 6) * k;
    const rb = entre(L, 1.6, 6) * k;
    burbujas += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rb)}" fill="${tinta}" fill-opacity="0.06" stroke="#BFF6FF" stroke-opacity="0.38" stroke-width="${r(0.7 * k)}"/><circle cx="${r(x - rb * 0.35)}" cy="${r(y - rb * 0.35)}" r="${r(rb * 0.25)}" fill="#FFFFFF" opacity="0.45"/>`;
  }

  // Nieve marina.
  const nieve = estrellas(L, cantidad(L, 50, 14), H, ["#D8FBFF"], 0.3, 0.8, 0.08, 0.22);

  // Algas desde el fondo.
  const base = H - 20 * k;
  let algas = "";
  for (let i = 0; i < 9; i++) {
    const x = (i < 4 ? W * (0.02 + i * 0.06) : W * (0.7 + (i - 4) * 0.065)) + entre(L, -6, 6) * k;
    const alto = entre(L, 0.2, 0.42) * H;
    let d = `M${r(x)} ${r(base + 10 * k)}`;
    const tramos = 6;
    for (let j = 1; j <= tramos; j++) {
      const y = base + 10 * k - (alto * j) / tramos;
      d += `Q${r(x + (j % 2 ? 12 : -12) * k)} ${r(y + alto / tramos / 2)} ${r(x + Math.sin(j) * 3 * k)} ${r(y)}`;
    }
    const verde = i % 2 ? "#1E8A62" : "#2FA57A";
    algas += `<path d="${d}" fill="none" stroke="${verde}" stroke-opacity="0.55" stroke-width="${r(entre(L, 3, 5.5) * k)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#7CF0C0" stroke-opacity="0.18" stroke-width="${r(1 * k)}" stroke-linecap="round"/>`;
  }

  // Corales.
  const coral = (x: number, y: number, s: number, color: string) =>
    `<path d="M${r(x)} ${r(y)}V${r(y - 26 * s)}M${r(x)} ${r(y - 12 * s)}L${r(x - 12 * s)} ${r(y - 24 * s)}V${r(y - 34 * s)}M${r(x - 12 * s)} ${r(y - 26 * s)}L${r(x - 18 * s)} ${r(y - 32 * s)}M${r(x)} ${r(y - 18 * s)}L${r(x + 11 * s)} ${r(y - 30 * s)}V${r(y - 38 * s)}M${r(x)} ${r(y - 26 * s)}L${r(x + 4 * s)} ${r(y - 36 * s)}" fill="none" stroke="${color}" stroke-opacity="0.42" stroke-width="${r(3.2 * s)}" stroke-linecap="round"/>`;
  const corales = coral(W * 0.32, base + 4 * k, k, "#FF7A8A") + coral(W * 0.58, base + 6 * k, 0.8 * k, "#FFB35C") + coral(W * 0.42, base + 8 * k, 0.6 * k, "#C77DFF");

  return `<defs>${fondo.def}${v.def}${superficie.def}${medusa.def}
${lineal(rayo, [
    [0, "#CFF8FF", 0.16],
    [1, "#CFF8FF", 0],
  ])}
${lineal(arena, [
    [0, "#0F4652"],
    [1, "#061C24"],
  ])}
</defs>
${fondo.capa}
${superficie.usar(W * 0.5, -30 * k, Math.max(W, 260 * k) * 0.7)}
${rayos}
${ondas}
${nieve}
${peces}
${medusas}
${algas}
<path d="${colinas(L, base, 14 * k, 2.2)}" fill="url(#${arena})"/>
${corales}
${burbujas}
${v.capa}`;
}

// ---------------------------------------------------------------- Bosque
function bosque(L: Lienzo): string {
  const { W, H, k } = L;
  const fondo = cielo(L, [
    [0, "#0A2620"],
    [0.4, "#123A2E"],
    [0.75, "#0B2519"],
    [1, "#06150E"],
  ]);
  const v = vineta(L, 0.55);
  const lunaHalo = halo(L, "luna", "#C8F7D2", 0.3);
  const niebla = halo(L, "niebla", "#A8F0C4", 0.16);
  const luciernaga = halo(L, "luciernaga", "#D8FF7A", 0.55);

  const lx = W * 0.26;
  const ly = H * 0.12;
  const luna = `${lunaHalo.usar(lx, ly, 120 * k)}<circle cx="${r(lx)}" cy="${r(ly)}" r="${r(20 * k)}" fill="#EAF7DC" opacity="0.88"/><circle cx="${r(lx - 6 * k)}" cy="${r(ly - 4 * k)}" r="${r(4 * k)}" fill="#C9DDBE" opacity="0.6"/><circle cx="${r(lx + 7 * k)}" cy="${r(ly + 6 * k)}" r="${r(2.6 * k)}" fill="#C9DDBE" opacity="0.6"/>`;
  const cielito = estrellas(L, cantidad(L, 40, 10), H * 0.45, ["#E9FFE9", "#FFFFFF"], 0.3, 0.9, 0.2, 0.6);

  const lejos = bosqueDePinos(L, H * 0.62, 50 * k, 100 * k, 22 * k, "#1C4C3A", 0.95);
  const medio = bosqueDePinos(L, H * 0.76, 90 * k, 160 * k, 34 * k, "#0F3427");
  const cerca = bosqueDePinos(L, H * 0.95, 180 * k, 300 * k, 46 * k, "#05170E", 1, 0.45);

  let luces = "";
  for (let i = 0; i < cantidad(L, 22, 8); i++) {
    const x = entre(L, 0.04, 0.96) * W;
    const y = entre(L, 0.45, 0.96) * H;
    luces += luciernaga.usar(x, y, 7 * k) + `<circle cx="${r(x)}" cy="${r(y)}" r="${r(entre(L, 0.9, 1.6) * k)}" fill="#F2FFB0" opacity="0.9"/>`;
  }

  return `<defs>${fondo.def}${v.def}${lunaHalo.def}${niebla.def}${luciernaga.def}</defs>
${fondo.capa}
${cielito}
${luna}
${lejos}
<g transform="translate(${r(W * 0.5)} ${r(H * 0.64)}) scale(${r((W * 0.9) / (40 * k))} 1)">${niebla.usar(0, 0, 40 * k)}</g>
${medio}
<g transform="translate(${r(W * 0.35)} ${r(H * 0.78)}) scale(${r((W * 0.7) / (34 * k))} 1)">${niebla.usar(0, 0, 34 * k)}</g>
${cerca}
${luces}
${v.capa}`;
}

// ---------------------------------------------------------------- Atardecer
function atardecer(L: Lienzo): string {
  const { W, H, k } = L;
  const horizonteY = H * 0.72;
  const fondo = cielo(L, [
    [0, "#200E30"],
    [0.32, "#47193F"],
    [0.55, "#7A2A50"],
    [0.67, "#B44C58"],
    [0.72, "#D9735A"],
    [0.73, "#3E1838"],
    [1, "#12081A"],
  ]);
  const v = vineta(L, 0.5);
  const sol = L.id("sol");
  const recorte = L.id("recorte");
  const nubeClara = L.id("nubeClara");
  const nubeOscura = L.id("nubeOscura");
  const resplandor = halo(L, "resplandor", "#FF9E5E", 0.4);
  const sx = W * 0.5;
  const sy = horizonteY - 26 * k;
  const sr = 64 * k;

  // Sol a franjas (recortado con bandas horizontales).
  let bandas = `<rect x="${r(sx - sr)}" y="${r(sy - sr)}" width="${r(sr * 2)}" height="${r(sr * 1.05)}"/>`;
  let y = sy + sr * 0.1;
  let alto = 9 * k;
  while (y < sy + sr) {
    bandas += `<rect x="${r(sx - sr)}" y="${r(y)}" width="${r(sr * 2)}" height="${r(alto)}"/>`;
    y += alto + 3.5 * k;
    alto *= 0.78;
  }

  const nubes = [
    [0.22, 0.42, 120, 5],
    [0.7, 0.36, 150, 6],
    [0.45, 0.52, 190, 4],
    [0.85, 0.56, 110, 3.5],
    [0.15, 0.6, 140, 3],
  ]
    .map(([fx, fy, w, h]) => `<rect x="${r(W * fx - (w * k) / 2)}" y="${r(H * fy)}" width="${r(w * k)}" height="${r(h * k)}" rx="${r((h * k) / 2)}" fill="url(#${nubeClara})"/><rect x="${r(W * fx - (w * k) / 2 + 20 * k)}" y="${r(H * fy + h * k + 3 * k)}" width="${r(w * 0.6 * k)}" height="${r(h * 0.7 * k)}" rx="${r((h * k) / 3)}" fill="url(#${nubeOscura})"/>`)
    .join("");

  const lejos = cordillera(L, horizonteY, 6, 40 * k, 90 * k);
  const cerca = cordillera(L, horizonteY, 4, 18 * k, 50 * k);

  // Reflejo del sol en el agua.
  let reflejo = "";
  for (let i = 0; i < 9; i++) {
    const yy = horizonteY + 8 * k + i * 9 * k;
    const ancho = sr * (1.6 - i * 0.14) * entre(L, 0.7, 1);
    reflejo += `<rect x="${r(sx - ancho / 2 + entre(L, -8, 8) * k)}" y="${r(yy)}" width="${r(ancho)}" height="${r(2 * k)}" rx="${r(k)}" fill="#FFB25E" opacity="${r((0.42 - i * 0.04) * 100) / 100}"/>`;
  }

  let aves = "";
  for (let i = 0; i < 6; i++) {
    const x = W * (0.3 + i * 0.07) + entre(L, -10, 10) * k;
    const yy = H * (0.2 + Math.sin(i * 1.7) * 0.04);
    const s = entre(L, 4, 7) * k;
    aves += `M${r(x - s)} ${r(yy - s * 0.4)}Q${r(x - s * 0.4)} ${r(yy - s * 0.5)} ${r(x)} ${r(yy + s * 0.15)}Q${r(x + s * 0.4)} ${r(yy - s * 0.5)} ${r(x + s)} ${r(yy - s * 0.4)}`;
  }

  return `<defs>${fondo.def}${v.def}${resplandor.def}
${lineal(sol, [
    [0, "#FFE08A"],
    [0.6, "#FF9A5E"],
    [1, "#FF5E7A"],
  ])}
<clipPath id="${recorte}">${bandas}</clipPath>
${lineal(nubeClara, [
    [0, "#FFC0A0", 0],
    [0.35, "#FFC0A0", 0.26],
    [0.7, "#FFC0A0", 0.2],
    [1, "#FFC0A0", 0],
  ], 0, 0, 1, 0)}
${lineal(nubeOscura, [
    [0, "#2A0F30", 0],
    [0.4, "#2A0F30", 0.5],
    [1, "#2A0F30", 0],
  ], 0, 0, 1, 0)}
</defs>
${fondo.capa}
${estrellas(L, cantidad(L, 18, 6), H * 0.28, ["#FFE6C8"], 0.3, 0.8, 0.2, 0.5)}
${resplandor.usar(sx, sy, 200 * k)}
<circle cx="${r(sx)}" cy="${r(sy)}" r="${r(sr)}" fill="url(#${sol})" clip-path="url(#${recorte})" opacity="0.8"/>
${nubes}
<path d="${aves}" fill="none" stroke="#1A0A1E" stroke-opacity="0.65" stroke-width="${r(1.3 * k)}" stroke-linecap="round"/>
<path d="${lejos.d}" fill="#5A2150" opacity="0.9"/>
<path d="${cerca.d}" fill="#2E1236"/>
<rect x="0" y="${r(horizonteY)}" width="${r(W)}" height="${r(H - horizonteY)}" fill="#2A1030" opacity="0.55"/>
${reflejo}
${v.capa}`;
}

// ---------------------------------------------------------------- Aurora
function aurora(L: Lienzo): string {
  const { W, H, k } = L;
  const fondo = cielo(L, [
    [0, "#06101F"],
    [0.4, "#0B1C30"],
    [0.72, "#10263A"],
    [1, "#0A1424"],
  ]);
  const v = vineta(L, 0.5);
  const base = H * 0.8;

  // Cortinas de aurora: brillantes en el borde de abajo y desvanecidas hacia arriba.
  const cortinas: [number, number, number, string, string, number][] = [
    [0.22, 26, 120, "#4CFFB0", "#2EE6A6", 1.3],
    [0.34, 20, 90, "#9B85FF", "#6EE7F5", 3.1],
    [0.14, 14, 70, "#FF7AD9", "#B98BFF", 5.2],
  ];
  let defs = "";
  let capas = "";
  cortinas.forEach(([fy, amp, alto, c1, c2, fase], i) => {
    const id = L.id(`aurora${i}`);
    defs += lineal(id, [
      [0, c1, 0],
      [0.6, c1, 0.16],
      [1, c2, 0.5],
    ]);
    const curva = (x: number) => H * fy + Math.sin((x / W) * 4.2 + fase) * amp * k + Math.sin((x / W) * 9 + fase * 2) * amp * 0.35 * k;
    const altura = (x: number) => alto * k * (0.7 + 0.3 * Math.sin((x / W) * 6 + fase));
    // Franjas angostas: cada una toma el degradé completo de arriba a abajo (el
    // degradé va por caja de cada elemento), así la cortina se desvanece pareja.
    const paso = 9 * k;
    let franjas = "";
    for (let x = -10; x <= W + 10; x += paso) {
      const x1 = x + paso + 0.6;
      franjas += `<path d="${poligono([
        [x, curva(x) - altura(x)],
        [x1, curva(x1) - altura(x1)],
        [x1, curva(x1)],
        [x, curva(x)],
      ])}"/>`;
    }
    capas += `<g fill="url(#${id})">${franjas}</g>`;
    let borde = `M-10 ${r(curva(-10))}`;
    for (let x = -10; x <= W + 10; x += 6 * k) borde += `L${r(x)} ${r(curva(x))}`;
    capas += `<path d="${borde}" fill="none" stroke="${c2}" stroke-opacity="0.35" stroke-width="${r(1.2 * k)}"/>`;
    let rayas = "";
    for (let x = 0; x <= W; x += 7 * k) {
      const yy = curva(x);
      rayas += `M${r(x)} ${r(yy)}V${r(yy - altura(x) * entre(L, 0.3, 0.95))}`;
    }
    capas += `<path d="${rayas}" stroke="${c2}" stroke-opacity="0.1" stroke-width="${r(2 * k)}"/>`;
  });

  const lejos = cordillera(L, base, 5, 60 * k, 120 * k);
  const cerca = cordillera(L, base + 14 * k, 4, 26 * k, 70 * k);
  // Nieve en las cumbres lejanas.
  const nieve = lejos.cimas
    .map((c) => {
      const h = 18 * k;
      const a = h / c.p;
      return poligono([
        [c.x, c.y],
        [c.x + a, c.y + h],
        [c.x + a * 0.45, c.y + h * 0.7],
        [c.x + a * 0.1, c.y + h * 1.05],
        [c.x - a * 0.35, c.y + h * 0.75],
        [c.x - a, c.y + h],
      ]);
    })
    .join("");
  const reflejo = halo(L, "reflejo", "#4CFFB0", 0.14);
  let pinos = "";
  for (let i = 0; i < 12; i++) {
    const x = i < 6 ? W * (0.02 + i * 0.045) : W * (0.74 + (i - 6) * 0.045);
    const h = entre(L, 16, 30) * k;
    pinos += pino(x, base + 26 * k, h, h * 0.4);
  }

  return `<defs>${fondo.def}${v.def}${reflejo.def}${defs}</defs>
${fondo.capa}
${estrellas(L, cantidad(L, 90, 22), H * 0.75, ["#FFFFFF", "#D6E4FF", "#E8DEFF"], 0.3, 1, 0.2, 0.75)}
${capas}
<path d="${lejos.d}" fill="#1A2A44"/>
<path d="${nieve}" fill="#DCE8FF" opacity="0.5"/>
<path d="${cerca.d}" fill="#0E1830"/>
<rect x="0" y="${r(base + 24 * k)}" width="${r(W)}" height="${r(H)}" fill="#08101E"/>
<g transform="translate(${r(W * 0.4)} ${r(base + 50 * k)}) scale(${r((W * 0.6) / (30 * k))} 1)">${reflejo.usar(0, 0, 30 * k)}</g>
<path d="${pinos}" fill="#050B16"/>
${v.capa}`;
}

// ---------------------------------------------------------------- Ciudad de neón
function neon(L: Lienzo): string {
  const { W, H, k } = L;
  const suelo = H * 0.8;
  const fondo = cielo(L, [
    [0, "#14062A"],
    [0.4, "#25103F"],
    [0.68, "#3C1360"],
    [0.8, "#5A1A72"],
    [0.81, "#12062A"],
    [1, "#08031A"],
  ]);
  const v = vineta(L, 0.5);
  const planeta = L.id("planeta");
  const resplandor = halo(L, "resplandor", "#E36BF2", 0.3);
  const colores = ["#FFD27A", "#6EE7FF", "#E36BF2", "#FF9AC8"];

  const px = W * 0.62;
  const py = suelo - 110 * k;
  const pr = 70 * k;

  let ventanas = "";
  let totalVentanas = 0;
  const tope = cantidad(L, 170, 40);
  const edificios = (alturaMin: number, alturaMax: number, color: string, prob: number, bordes: number) => {
    let x = -10 * k;
    let s = "";
    while (x < W) {
      const ancho = entre(L, 26, 54) * k;
      const lejosDelCentro = Math.abs(x + ancho / 2 - W / 2) / (W / 2);
      const alto = entre(L, alturaMin, alturaMax) * (bordes ? 0.45 + lejosDelCentro * bordes : 1);
      const top = suelo - alto;
      s += `<rect x="${r(x)}" y="${r(top)}" width="${r(ancho + 0.6)}" height="${r(alto + 1)}" fill="${color}"/>`;
      if (L.azar() < 0.35) s += `<path d="M${r(x + ancho * 0.5)} ${r(top)}V${r(top - 16 * k)}" stroke="${color}" stroke-width="${r(1.4 * k)}"/><circle cx="${r(x + ancho * 0.5)}" cy="${r(top - 16 * k)}" r="${r(1.5 * k)}" fill="#FF4D6D" opacity="0.9"/>`;
      for (let yy = top + 7 * k; yy < suelo - 6 * k; yy += 9 * k) {
        for (let xx = x + 5 * k; xx < x + ancho - 5 * k; xx += 7 * k) {
          if (totalVentanas < tope && L.azar() < prob) {
            totalVentanas++;
            ventanas += `<rect x="${r(xx)}" y="${r(yy)}" width="${r(3 * k)}" height="${r(4 * k)}" fill="${colores[totalVentanas % colores.length]}" opacity="${r(entre(L, 0.3, 0.7) * 100) / 100}"/>`;
          }
        }
      }
      x += ancho + entre(L, 0, 4) * k;
    }
    return s;
  };
  const lejos = edificios(60 * k, 150 * k, "#2A1048", 0.05, 0);
  const ventanasLejos = ventanas;
  ventanas = "";
  const cerca = edificios(70 * k, 260 * k, "#0F0522", 0.09, 1.1);

  // Carteles de neón (con un trazo ancho y suave como resplandor).
  const cartel = (x: number, y: number, w: number, h: number, c: string) =>
    `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(4 * k)}" fill="none" stroke="${c}" stroke-opacity="0.18" stroke-width="${r(6 * k)}"/><rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(4 * k)}" fill="${c}" fill-opacity="0.08" stroke="${c}" stroke-opacity="0.85" stroke-width="${r(1.4 * k)}"/>`;
  const carteles = cartel(W * 0.06, suelo - 150 * k, 34 * k, 16 * k, "#E36BF2") + cartel(W * 0.88, suelo - 190 * k, 12 * k, 48 * k, "#4FE0F5") + cartel(W * 0.8, suelo - 96 * k, 30 * k, 12 * k, "#FFD27A");

  // Piso en perspectiva.
  let grilla = "";
  const fuga = W / 2;
  for (let i = -12; i <= 12; i++) grilla += `M${r(fuga + i * 14 * k)} ${r(suelo)}L${r(fuga + i * 90 * k)} ${r(H)}`;
  for (let t = 1; t <= 7; t++) {
    const yy = suelo + (H - suelo) * Math.pow(t / 7, 1.8);
    grilla += `M0 ${r(yy)}H${r(W)}`;
  }

  let lluvia = "";
  for (let i = 0; i < cantidad(L, 50, 12); i++) {
    const x = entre(L, 0, W + 40 * k);
    const yy = entre(L, 0, H);
    lluvia += `M${r(x)} ${r(yy)}l${r(-5 * k)} ${r(16 * k)}`;
  }

  return `<defs>${fondo.def}${v.def}${resplandor.def}
${lineal(planeta, [
    [0, "#FF4FD8"],
    [0.55, "#9B3BFF"],
    [1, "#3A1A8A"],
  ])}
</defs>
${fondo.capa}
${estrellas(L, cantidad(L, 30, 8), H * 0.45, ["#FFFFFF", "#F5C8FF"], 0.3, 0.9, 0.2, 0.6)}
${resplandor.usar(W * 0.5, suelo, Math.max(W, H) * 0.5)}
<circle cx="${r(px)}" cy="${r(py)}" r="${r(pr)}" fill="url(#${planeta})" opacity="0.42"/>
<path d="M${r(px - pr)} ${r(py + 20 * k)}H${r(px + pr)}M${r(px - pr)} ${r(py + 34 * k)}H${r(px + pr)}M${r(px - pr)} ${r(py + 46 * k)}H${r(px + pr)}" stroke="#25103F" stroke-width="${r(4 * k)}" opacity="0.8"/>
${lejos}
${ventanasLejos}
${cerca}
${ventanas}
${carteles}
<path d="${grilla}" stroke="#E36BF2" stroke-opacity="0.3" stroke-width="${r(0.9 * k)}"/>
<path d="M0 ${r(suelo)}H${r(W)}" stroke="#FF8BF5" stroke-opacity="0.6" stroke-width="${r(1.2 * k)}"/>
<path d="${lluvia}" stroke="#B9C4FF" stroke-opacity="0.09" stroke-width="${r(0.8 * k)}" stroke-linecap="round"/>
${v.capa}`;
}

// ---------------------------------------------------------------- Galaxia
function galaxia(L: Lienzo): string {
  const { W, H, k } = L;
  const fondoId = L.id("espacio");
  const v = vineta(L, 0.55);
  const nucleo = halo(L, "nucleo", "#FFE9B0", 0.85);
  const brazo = halo(L, "brazo", "#C9A0FF", 0.22);
  const nebulas = [
    halo(L, "nebula1", "#C13BFF", 0.2),
    halo(L, "nebula2", "#3B6BFF", 0.18),
    halo(L, "nebula3", "#FF5E9A", 0.14),
  ];
  const cuerpo = L.id("cuerpo");

  const gx = W * 0.5;
  const gy = H * 0.42;
  const R = Math.min(W, H) * 0.56;

  let nubes = "";
  const posiciones: [number, number, number, number][] = [
    [0.2, 0.18, 120, 0],
    [0.82, 0.3, 140, 1],
    [0.3, 0.72, 150, 2],
    [0.75, 0.78, 110, 0],
    [0.55, 0.12, 90, 1],
  ];
  for (const [fx, fy, radio, i] of posiciones) nubes += `<g transform="translate(${r(W * fx)} ${r(H * fy)}) scale(1.6 1)">${nebulas[i].usar(0, 0, radio * k)}</g>`;

  // Brazos en espiral (puntos sobre dos espirales logarítmicas).
  let puntos = "";
  const colores = ["#FFE3A0", "#FFC53D", "#FFB0E0", "#C9A0FF", "#9FC2FF"];
  const porBrazo = cantidad(L, 130, 45);
  for (let b = 0; b < 2; b++) {
    for (let i = 0; i < porBrazo; i++) {
      const t = Math.pow(i / porBrazo, 0.85);
      const ang = t * 3.1 * Math.PI + b * Math.PI;
      const rr = 10 * k + t * R;
      const dispersion = (5 + t * 20) * k;
      const x = Math.cos(ang) * rr + entre(L, -1, 1) * dispersion;
      const y = Math.sin(ang) * rr + entre(L, -1, 1) * dispersion;
      const c = colores[Math.min(colores.length - 1, Math.floor(t * colores.length + entre(L, -0.6, 0.6)))] ?? colores[0];
      puntos += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(entre(L, 0.6, 1.9) * k)}" fill="${c}" opacity="${r(entre(L, 0.4, 0.9) * (1 - t * 0.35) * 100) / 100}"/>`;
    }
  }

  // Planeta con anillo abajo a la izquierda.
  const px = W * 0.17;
  const py = H * 0.85;
  const pr = 24 * k;
  const anillo = (mitad: "atras" | "adelante") =>
    `<path d="M${r(px - pr * 1.9)} ${r(py)}A${r(pr * 1.9)} ${r(pr * 0.5)} 0 0 ${mitad === "atras" ? 1 : 0} ${r(px + pr * 1.9)} ${r(py)}" fill="none" stroke="#FFD9A8" stroke-opacity="0.55" stroke-width="${r(2.6 * k)}" transform="rotate(-16 ${r(px)} ${r(py)})"/>`;

  return `<defs>${v.def}${nucleo.def}${brazo.def}${nebulas.map((n) => n.def).join("")}
${radial(fondoId, [
    [0, "#3A1460"],
    [0.45, "#1A1240"],
    [1, "#05060F"],
  ], 0.5, 0.42, 0.75)}
${lineal(cuerpo, [
    [0, "#FFB07A"],
    [0.6, "#B2457A"],
    [1, "#3A1450"],
  ], 0, 0, 1, 1)}
</defs>
<rect width="${r(W)}" height="${r(H)}" fill="url(#${fondoId})"/>
${nubes}
${estrellas(L, cantidad(L, 130, 30), H, ["#FFFFFF", "#FFE6B0", "#D6E4FF", "#FFFFFF"], 0.3, 1, 0.2, 0.8)}
<g transform="translate(${r(gx)} ${r(gy)}) rotate(-22) scale(1 0.58)">
${brazo.usar(0, 0, R * 1.05)}
${puntos}
${nucleo.usar(0, 0, 64 * k)}
<circle cx="0" cy="0" r="${r(5 * k)}" fill="#FFF6DA"/>
</g>
${anillo("atras")}
<circle cx="${r(px)}" cy="${r(py)}" r="${r(pr)}" fill="url(#${cuerpo})" opacity="0.85"/>
${anillo("adelante")}
<circle cx="${r(W * 0.86)}" cy="${r(H * 0.13)}" r="${r(8 * k)}" fill="#7FB2FF" opacity="0.55"/>
<circle cx="${r(W * 0.86 - 2.5 * k)}" cy="${r(H * 0.13 - 2.5 * k)}" r="${r(3 * k)}" fill="#DDEBFF" opacity="0.4"/>
${v.capa}`;
}

const ESCENAS: Record<string, { semilla: number; dibujar: (L: Lienzo) => string }> = {
  cuadriculado: { semilla: 11, dibujar: cuaderno },
  estrellas: { semilla: 23, dibujar: nocheEstrellada },
  oceano: { semilla: 37, dibujar: oceano },
  bosque: { semilla: 41, dibujar: bosque },
  atardecer: { semilla: 53, dibujar: atardecer },
  aurora: { semilla: 67, dibujar: aurora },
  neon: { semilla: 79, dibujar: neon },
  galaxia: { semilla: 83, dibujar: galaxia },
};

export function tieneDibujoFondoChat(slug: string | null | undefined): boolean {
  return !!slug && slug in ESCENAS;
}

// SVG completo de un fondo para un lienzo de ancho × alto (px lógicos). Devuelve
// null si el slug no tiene escena. `prefijo` separa los ids de los degradés cuando
// hay varios fondos dibujados a la vez (las muestras del selector en la app).
export function svgFondoChat(slug: string, ancho: number, alto: number, prefijo = "fc"): string | null {
  const escena = ESCENAS[slug];
  if (!escena) return null;
  // Las muestras chicas (selector) se dibujan en un lienzo lógico mayor y se
  // achican: se ve la escena entera en miniatura, no un recorte con todo gigante.
  const aumento = Math.max(1, 360 / Math.max(1, ancho, alto));
  const W = Math.max(40, Math.round(ancho * aumento));
  const H = Math.max(40, Math.round(alto * aumento));
  const L: Lienzo = {
    W,
    H,
    k: Math.min(1.4, Math.max(0.5, Math.sqrt(W * H) / 520)),
    area: (W * H) / (400 * 700),
    id: (nombre) => `${prefijo}-${slug}-${nombre}`,
    azar: generador(escena.semilla),
  };
  const cuerpo = escena.dibujar(L).replace(/\n/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${cuerpo}</svg>`;
}

// Para la web: el fondo como imagen CSS.
export function urlFondoChat(slug: string, ancho: number, alto: number): string | null {
  const svg = svgFondoChat(slug, ancho, alto);
  return svg ? `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")` : null;
}

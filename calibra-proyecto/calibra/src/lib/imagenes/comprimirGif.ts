// La app compila este archivo desde ../calibra/src sin incluir src/types: la referencia trae los tipos de gifenc.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../types/gifenc.d.ts" />
import { decompressFrame, parseGIF, type ParsedGif } from "gifuct-js";
import { applyPalette, GIFEncoder, quantize } from "gifenc";

// Achica un GIF animado hasta que pese menos que `maxBytes` (pedido del usuario,
// 2026-10-06: «si la foto o el GIF es más grande que el límite, que se comprima un
// poco»). JavaScript puro, sin canvas: lo usan la web (SubirAvatar,
// SubirFondoPerfil) y la app (lib/tienda.ts) por igual.
//
// Cómo: se decodifica cuadro por cuadro (nunca todos en memoria a la vez), cada
// cuadro se compone sobre el anterior respetando cómo se descarta (disposal), se
// reduce de tamaño promediando píxeles y se vuelve a codificar con su paleta. Si
// todavía pesa mucho, se prueba con menos tamaño, menos colores y saltando cuadros
// (sumando su duración, así la animación dura lo mismo).

export interface IntentoGif {
  escala: number;
  paso: number;
  colores: number;
}

export interface ResultadoGif {
  bytes: Uint8Array;
  ancho: number;
  alto: number;
  cuadros: number;
  intento: IntentoGif;
}

// La serie de intentos, del más fiel al más liviano. `escala0` sale de cuánto
// sobra: si el archivo pesa 4 veces el límite, se arranca a la mitad de lado.
export function intentosGif(bytesOriginales: number, maxBytes: number, ancho: number, alto: number, maxLado: number): IntentoGif[] {
  const porPeso = Math.sqrt(maxBytes / Math.max(1, bytesOriginales)) * 1.15;
  const porLado = maxLado / Math.max(ancho, alto);
  const escala0 = Math.min(1, porPeso, porLado);
  return [
    { escala: escala0, paso: 1, colores: 256 },
    { escala: escala0 * 0.85, paso: 1, colores: 128 },
    { escala: escala0 * 0.85, paso: 2, colores: 128 },
    { escala: escala0 * 0.7, paso: 2, colores: 64 },
    { escala: escala0 * 0.55, paso: 3, colores: 64 },
    { escala: escala0 * 0.45, paso: 4, colores: 32 },
    { escala: escala0 * 0.35, paso: 5, colores: 32 },
  ];
}

// Promedio de cada bloque de píxeles (con transparencia): reduce sin el ruido de
// tomar un píxel suelto.
export function reducir(origen: Uint8ClampedArray, w: number, h: number, nw: number, nh: number): Uint8Array {
  const destino = new Uint8Array(nw * nh * 4);
  const fx = w / nw;
  const fy = h / nh;
  for (let y = 0; y < nh; y++) {
    const y0 = Math.floor(y * fy);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * fy));
    for (let x = 0; x < nw; x++) {
      const x0 = Math.floor(x * fx);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * fx));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * w + xx) * 4;
          const alfa = origen[i + 3];
          r += origen[i] * alfa;
          g += origen[i + 1] * alfa;
          b += origen[i + 2] * alfa;
          a += alfa;
          n++;
        }
      }
      const j = (y * nw + x) * 4;
      if (a > 0) {
        destino[j] = Math.round(r / a);
        destino[j + 1] = Math.round(g / a);
        destino[j + 2] = Math.round(b / a);
      }
      // Transparencia de un bit (la de los GIF): visible si más de la mitad lo es.
      destino[j + 3] = a / n >= 128 ? 255 : 0;
    }
  }
  return destino;
}

type CuadroCrudo = Parameters<typeof decompressFrame>[0];

function codificar(gif: ParsedGif, intento: IntentoGif): ResultadoGif {
  const W = gif.lsd.width;
  const H = gif.lsd.height;
  const nw = Math.max(1, Math.round(W * intento.escala));
  const nh = Math.max(1, Math.round(H * intento.escala));
  const lienzo = new Uint8ClampedArray(W * H * 4);
  const cuadrosCrudos = gif.frames.filter((f): f is CuadroCrudo => "image" in f);
  const enc = GIFEncoder();
  let cuadros = 0;
  let acumulado = 0;
  let pendiente: Uint8Array | null = null;

  const escribir = (rgba: Uint8Array, ms: number) => {
    const paleta = quantize(rgba, intento.colores, { format: "rgba4444", oneBitAlpha: true });
    const indice = applyPalette(rgba, paleta, "rgba4444");
    const transparente = paleta.findIndex((c) => c.length > 3 && c[3] === 0);
    enc.writeFrame(indice, nw, nh, {
      palette: paleta,
      delay: Math.max(20, ms),
      transparent: transparente >= 0,
      transparentIndex: Math.max(0, transparente),
      dispose: transparente >= 0 ? 2 : -1,
    });
    cuadros++;
  };

  cuadrosCrudos.forEach((crudo, i) => {
    const f = decompressFrame(crudo, gif.gct, true);
    const { left, top, width, height } = f.dims;
    const previo = f.disposalType === 3 ? lienzo.slice() : null;
    for (let y = 0; y < height; y++) {
      const fy = top + y;
      if (fy < 0 || fy >= H) continue;
      for (let x = 0; x < width; x++) {
        const fx = left + x;
        if (fx < 0 || fx >= W) continue;
        const p = (y * width + x) * 4;
        if (f.patch[p + 3] === 0) continue;
        const q = (fy * W + fx) * 4;
        lienzo[q] = f.patch[p];
        lienzo[q + 1] = f.patch[p + 1];
        lienzo[q + 2] = f.patch[p + 2];
        lienzo[q + 3] = 255;
      }
    }
    // Cada `paso` cuadros se escribe uno, que dura lo suyo más lo de los saltados.
    if (i % intento.paso === 0) {
      if (pendiente) escribir(pendiente, acumulado);
      pendiente = reducir(lienzo, W, H, nw, nh);
      acumulado = 0;
    }
    acumulado += f.delay || 100;
    if (f.disposalType === 2) {
      for (let y = Math.max(0, top); y < Math.min(H, top + height); y++) lienzo.fill(0, (y * W + Math.max(0, left)) * 4, (y * W + Math.min(W, left + width)) * 4);
    } else if (previo) {
      lienzo.set(previo);
    }
  });
  if (pendiente) escribir(pendiente, acumulado);
  enc.finish();
  return { bytes: enc.bytes(), ancho: nw, alto: nh, cuadros, intento };
}

// null = no se pudo dejar debajo del límite ni con el intento más liviano.
export function comprimirGif(entrada: ArrayBuffer, maxBytes: number, maxLado = 1080): ResultadoGif | null {
  const gif = parseGIF(entrada);
  if (!gif.frames.some((f) => "image" in f)) return null;
  for (const intento of intentosGif(entrada.byteLength, maxBytes, gif.lsd.width, gif.lsd.height, maxLado)) {
    const r = codificar(gif, intento);
    if (r.bytes.byteLength <= maxBytes) return r;
  }
  return null;
}

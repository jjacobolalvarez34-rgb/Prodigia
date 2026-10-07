import { describe, expect, it } from "vitest";
import { decompressFrames, parseGIF } from "gifuct-js";
import { applyPalette, GIFEncoder, quantize } from "gifenc";
import { comprimirGif, intentosGif, reducir } from "./comprimirGif";

// Un GIF de prueba pesado: cuadros de ruido de colores (no se comprime bien), con
// un borde transparente para comprobar que la transparencia sobrevive.
function gifDePrueba(lado: number, cuadros: number, demoraMs: number): ArrayBuffer {
  const enc = GIFEncoder();
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let c = 0; c < cuadros; c++) {
    const rgba = new Uint8Array(lado * lado * 4);
    for (let y = 0; y < lado; y++) {
      for (let x = 0; x < lado; x++) {
        const i = (y * lado + x) * 4;
        const borde = x < 4 || y < 4;
        rgba[i] = Math.floor(azar() * 256);
        rgba[i + 1] = (x * 3 + c * 20) % 256;
        rgba[i + 2] = (y * 5) % 256;
        rgba[i + 3] = borde ? 0 : 255;
      }
    }
    const paleta = quantize(rgba, 256, { format: "rgba4444", oneBitAlpha: true });
    const indice = applyPalette(rgba, paleta, "rgba4444");
    const t = paleta.findIndex((p) => p[3] === 0);
    enc.writeFrame(indice, lado, lado, { palette: paleta, delay: demoraMs, transparent: t >= 0, transparentIndex: Math.max(0, t), dispose: 2 });
  }
  enc.finish();
  const b = enc.bytes();
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

const duracionTotal = (buf: ArrayBuffer) => decompressFrames(parseGIF(buf), true).reduce((s, f) => s + f.delay, 0);

describe("comprimirGif", () => {
  it("deja un GIF grande debajo del límite, sigue siendo un GIF animado válido y dura lo mismo", () => {
    const original = gifDePrueba(320, 12, 100);
    const limite = Math.floor(original.byteLength / 4);
    expect(original.byteLength).toBeGreaterThan(limite);
    const r = comprimirGif(original, limite)!;
    expect(r).not.toBeNull();
    expect(r.bytes.byteLength).toBeLessThanOrEqual(limite);
    const salida = r.bytes.buffer.slice(r.bytes.byteOffset, r.bytes.byteOffset + r.bytes.byteLength) as ArrayBuffer;
    const gif = parseGIF(salida);
    expect(gif.lsd.width).toBe(r.ancho);
    expect(gif.lsd.width).toBeLessThan(320);
    const cuadros = decompressFrames(gif, true);
    expect(cuadros.length).toBe(r.cuadros);
    expect(cuadros.length).toBeGreaterThan(1);
    // Saltar cuadros suma su duración: la animación dura lo mismo.
    expect(duracionTotal(salida)).toBe(duracionTotal(original));
  }, 60_000);

  it("la transparencia sobrevive (el borde transparente sigue transparente)", () => {
    const original = gifDePrueba(120, 3, 200);
    const r = comprimirGif(original, Math.floor(original.byteLength / 2))!;
    const salida = r.bytes.buffer.slice(r.bytes.byteOffset, r.bytes.byteOffset + r.bytes.byteLength) as ArrayBuffer;
    const primero = decompressFrames(parseGIF(salida), true)[0];
    expect(primero.patch[3]).toBe(0);
    const centro = (Math.floor(primero.dims.height / 2) * primero.dims.width + Math.floor(primero.dims.width / 2)) * 4;
    expect(primero.patch[centro + 3]).toBe(255);
  }, 60_000);

  it("los intentos van del más fiel al más liviano y la primera escala respeta el lado máximo", () => {
    const xs = intentosGif(8_000_000, 2_000_000, 2000, 1000, 1080);
    expect(xs[0].escala).toBeLessThanOrEqual(1080 / 2000);
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i].escala).toBeLessThanOrEqual(xs[i - 1].escala);
      expect(xs[i].colores).toBeLessThanOrEqual(xs[i - 1].colores);
      expect(xs[i].paso).toBeGreaterThanOrEqual(xs[i - 1].paso);
    }
    expect(intentosGif(100, 1000, 10, 10, 1080)[0].escala).toBe(1);
  });

  it("reducir promedia bloques y respeta la transparencia de un bit", () => {
    // Rojo, azul y rojo opacos y uno transparente: promedio de los visibles, opaco.
    const src = new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 0, 0]);
    const out = reducir(src, 2, 2, 1, 1);
    expect(Array.from(out)).toEqual([170, 0, 85, 255]);
    // Mitad visible y mitad transparente: queda transparente (hace falta más de la mitad).
    const mitad = reducir(new Uint8ClampedArray([9, 9, 9, 255, 9, 9, 9, 255, 0, 0, 0, 0, 0, 0, 0, 0]), 2, 2, 1, 1);
    expect(mitad[3]).toBe(0);
    const vacio = reducir(new Uint8ClampedArray(16), 2, 2, 1, 1);
    expect(vacio[3]).toBe(0);
  });
});

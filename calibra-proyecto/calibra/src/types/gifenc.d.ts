// gifenc no trae tipos: solo lo que usa src/lib/imagenes/comprimirGif.ts.
declare module "gifenc" {
  export type Paleta = number[][];
  export type FormatoColor = "rgb565" | "rgb444" | "rgba4444";
  export interface CodificadorGif {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: { palette?: Paleta; delay?: number; transparent?: boolean; transparentIndex?: number; repeat?: number; dispose?: number }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  }
  export function GIFEncoder(opt?: { initialCapacity?: number; auto?: boolean }): CodificadorGif;
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number, opts?: { format?: FormatoColor; oneBitAlpha?: boolean | number; clearAlpha?: boolean }): Paleta;
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: Paleta, format?: FormatoColor): Uint8Array;
}

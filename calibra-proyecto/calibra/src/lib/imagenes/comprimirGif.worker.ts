import { comprimirGif } from "./comprimirGif";

// Hilo aparte para achicar GIFs en la web: así la página nunca se traba mientras tanto.
self.onmessage = async (e: MessageEvent<{ bytes: ArrayBuffer; maxBytes: number; maxLado: number }>) => {
  try {
    const r = await comprimirGif(e.data.bytes, e.data.maxBytes, e.data.maxLado);
    if (!r) return self.postMessage({ ok: false });
    const buf = r.bytes.buffer.slice(r.bytes.byteOffset, r.bytes.byteOffset + r.bytes.byteLength) as ArrayBuffer;
    self.postMessage({ ok: true, bytes: buf }, { transfer: [buf] });
  } catch {
    self.postMessage({ ok: false });
  }
};

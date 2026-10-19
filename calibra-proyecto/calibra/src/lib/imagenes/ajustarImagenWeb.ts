import { comprimirGif } from "./comprimirGif";

// Web: si la foto o el GIF pesa más que el límite del bucket, se achica en el
// navegador antes de subirla (pedido del usuario, 2026-10-06), en vez de
// rechazarla. Lo que ya cumple se sube tal cual, sin perder calidad.
//   - GIF: comprimirGif (sigue animado).
//   - PNG, JPG o WEBP: se redibuja más chico en un canvas y se guarda en WEBP (o
//     JPG si el navegador no sabe hacer WEBP), bajando calidad y tamaño de a poco.
// null = no se pudo dejar debajo del límite.

// El GIF se achica en un Web Worker (2026-10-19: en el hilo de la página la trababa
// hasta «La página no responde»). Si el navegador no puede crear el worker, se hace
// acá mismo, que igual cede el turno entre cuadros.
async function gifEnHiloAparte(bytes: ArrayBuffer, maxBytes: number, maxLado: number): Promise<ArrayBuffer | null> {
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL("./comprimirGif.worker.ts", import.meta.url), { type: "module" });
  } catch {
    worker = null;
  }
  if (!worker) {
    const r = await comprimirGif(bytes, maxBytes, maxLado);
    return r ? (r.bytes.buffer.slice(r.bytes.byteOffset, r.bytes.byteOffset + r.bytes.byteLength) as ArrayBuffer) : null;
  }
  const w = worker;
  return new Promise((ok) => {
    w.onmessage = (e: MessageEvent<{ ok: boolean; bytes?: ArrayBuffer }>) => {
      w.terminate();
      ok(e.data.ok && e.data.bytes ? e.data.bytes : null);
    };
    w.onerror = () => {
      w.terminate();
      comprimirGif(bytes, maxBytes, maxLado).then((r) => ok(r ? (r.bytes.buffer.slice(r.bytes.byteOffset, r.bytes.byteOffset + r.bytes.byteLength) as ArrayBuffer) : null));
    };
    // Se manda una copia: si el worker falla, el original sigue sirviendo acá.
    w.postMessage({ bytes: bytes.slice(0), maxBytes, maxLado });
  });
}

export async function ajustarImagenAlLimite(file: File, maxBytes: number, maxLado: number): Promise<File | null> {
  if (file.size <= maxBytes) return file;
  const base = file.name.replace(/\.[^.]+$/, "") || "imagen";

  if (file.type === "image/gif") {
    const bytes = await gifEnHiloAparte(await file.arrayBuffer(), maxBytes, maxLado);
    return bytes ? new File([bytes], `${base}.gif`, { type: "image/gif" }) : null;
  }

  const bitmap = await createImageBitmap(file);
  try {
    const escala0 = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height), Math.sqrt(maxBytes / file.size) * 2);
    for (const factor of [1, 0.85, 0.7, 0.55, 0.4]) {
      const w = Math.max(1, Math.round(bitmap.width * escala0 * factor));
      const h = Math.max(1, Math.round(bitmap.height * escala0 * factor));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, w, h);
      for (const calidad of [0.86, 0.76, 0.64]) {
        const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", calidad));
        if (!blob) continue;
        if (blob.size <= maxBytes) {
          const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
          return new File([blob], `${base}.${ext}`, { type: blob.type });
        }
      }
    }
    return null;
  } finally {
    bitmap.close();
  }
}

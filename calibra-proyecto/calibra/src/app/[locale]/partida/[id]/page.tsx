import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import BotonEnlace from "@/components/BotonEnlace";
import PreguntaPorPregunta from "@/components/partidas/PreguntaPorPregunta";
import RepeticionPartida from "@/components/partidas/RepeticionPartida";
import { COLOR_MUNDO, type MundoDuelo } from "@/lib/duelos/rutas";
import { aciertosTexto, type TarjetaPartida } from "@/lib/partidas/compartir";
import { leerPartidaPublica } from "@/lib/partidas/servidor";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

async function textos(t: TarjetaPartida, locale: string) {
  const tp = await getTranslations({ locale, namespace: "Partidas.publica" });
  const tm = await getTranslations({ locale, namespace: "Mundos.nombres" });
  const nombre = t.yo.nombre ?? tp("jugador");
  const mundo = tm.has(t.mundo) ? tm(t.mundo) : t.mundo;
  return {
    titulo: tp("titulo", { nombre }),
    descripcion:
      t.tipo === "duelo" && t.rival
        ? tp("descripcionDuelo", { nombre, rival: t.rival.nombre ?? "—", mundo })
        : tp("descripcionSprint", { aciertos: aciertosTexto(t.yo), mundo }),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const tarjeta = await leerPartidaPublica(id);
  if (!tarjeta) return { title: "Prodigia", robots: { index: false } };
  const { titulo, descripcion } = await textos(tarjeta, locale);
  const imagen = `/api/partida/tarjeta?id=${id}&l=${locale}&f=og`;
  return {
    title: titulo,
    description: descripcion,
    robots: { index: false },
    openGraph: { title: titulo, description: descripcion, images: [{ url: imagen, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion, images: [imagen] },
  };
}

// Página pública de solo lectura de una partida compartida (0300): la tarjeta
// del resultado y, si se guardó, la partida pregunta por pregunta. No pide
// sesión: el enlace lo crea el jugador al compartir.
export default async function PartidaCompartidaPage({ params }: Props) {
  const { locale, id } = await params;
  const tarjeta = await leerPartidaPublica(id);
  const tp = await getTranslations({ locale, namespace: "Partidas" });

  if (!tarjeta) {
    return (
      <>
        <Header />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-4 py-20 text-center">
          <p className="text-sm text-texto-secundario">{tp("publica.noExiste")}</p>
          <BotonEnlace href="/" destacado>
            {tp("publica.volverInicio")}
          </BotonEnlace>
        </div>
      </>
    );
  }

  const color = COLOR_MUNDO[tarjeta.mundo as MundoDuelo] ?? "#6C4CF1";
  const { titulo } = await textos(tarjeta, locale);
  const nombreYo = tarjeta.yo.nombre ?? tp("publica.jugador");
  const nombreRival = tarjeta.rival?.nombre ?? tp("tarjeta.rival");
  const lados = [
    ...(tarjeta.yo.respuestas ? [{ nombre: nombreYo, respuestas: tarjeta.yo.respuestas, color }] : []),
    ...(tarjeta.rival?.respuestas ? [{ nombre: nombreRival, respuestas: tarjeta.rival.respuestas, color: "var(--error)" }] : []),
  ];

  return (
    <>
      <Header />
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-8">
        <h1 className="text-center font-display text-xl font-bold text-foreground">{titulo}</h1>
        <div className="overflow-hidden rounded-2xl border border-border bg-[#090C14] shadow-xl" style={{ aspectRatio: "1080 / 1350" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/partida/tarjeta?id=${id}&l=${locale}`} alt={titulo} className="h-full w-full object-cover" />
        </div>
        <BotonEnlace href="/" destacado colorHex={color} className="py-4">
          {tp("publica.cta")}
        </BotonEnlace>
        {lados.length > 0 && (
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tp("detalle.repeticion")}</h2>
            <RepeticionPartida lados={lados} colorHex={color} />
          </section>
        )}
        {tarjeta.yo.respuestas && (
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{tp("detalle.porPregunta")}</h2>
            <PreguntaPorPregunta yo={tarjeta.yo.respuestas} rival={tarjeta.rival?.respuestas ?? null} nombreYo={nombreYo} nombreRival={nombreRival} colorHex={color} />
          </section>
        )}
      </div>
    </>
  );
}

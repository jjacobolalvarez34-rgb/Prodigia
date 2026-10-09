// Melodía: los 7 modos de la web (MelodiaSprintRunner.tsx). Lectura dibuja las notas
// en el pentagrama, Fundamentos la figura rítmica cuando la pregunta es "¿cómo se
// llama esta figura?" Oído absoluto hace sonar la nota o el acorde (sin mostrarlos) y Tempo, un metrónomo.
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { frecuenciaDeNota, generarPreguntaMelodia, NOMBRE_MODO_MELODIA, type ModoMelodia, type PreguntaMelodia } from "@/lib/practica/melodia";
import type { MundoJugable, Visual } from "./tipos";

const clave = (p: PreguntaMelodia) => `${p.enunciado}|${p.respuesta}`;

function visualDe(p: PreguntaMelodia): Visual[] | undefined {
  if (p.tipo === "pentagrama") return [{ tipo: "pentagrama", notas: p.notas, disposicion: p.disposicion }];
  if (p.tipo === "audio") return [{ tipo: "nota-audio", frecuencia: frecuenciaDeNota(p.nota), acorde: p.acorde?.map(frecuenciaDeNota) }];
  if (p.tipo === "pulso") return [{ tipo: "pulso", bpm: p.bpm, pulsos: p.pulsos, acentoCada: p.acentoCada }];
  if (p.figuraId) return [{ tipo: "figura", figura: p.figuraId }];
  return undefined;
}

export const MELODIA: MundoJugable = {
  slug: "melodia",
  modos: [
    { id: "fundamentos", nombre: NOMBRE_MODO_MELODIA.fundamentos, simbolo: "♩", descripcion: "Figuras, cifrado y compases." },
    { id: "lectura", nombre: NOMBRE_MODO_MELODIA.lectura, simbolo: "𝄞", descripcion: "Leer notas en el pentagrama." },
    { id: "alteraciones", nombre: NOMBRE_MODO_MELODIA.alteraciones, simbolo: "♯", descripcion: "Sostenidos y bemoles." },
    { id: "escalas", nombre: NOMBRE_MODO_MELODIA.escalas, simbolo: "♫", descripcion: "Mayores y menores." },
    { id: "acordes", nombre: NOMBRE_MODO_MELODIA.acordes, simbolo: "♬", descripcion: "Triadas y sus notas." },
    { id: "oido_absoluto", nombre: NOMBRE_MODO_MELODIA.oido_absoluto, simbolo: "👂", descripcion: "Escucha la nota (o el acorde) y nómbrala." },
    { id: "tempo", nombre: NOMBRE_MODO_MELODIA.tempo, simbolo: "🥁", descripcion: "Pulso, BPM, tempos y compases." },
  ],
  generar: (modo, nivel, usados) => {
    const p = generarSinRepetir(() => generarPreguntaMelodia(modo as ModoMelodia, nivel), clave, usados);
    return {
      enunciado: p.enunciado,
      entrada: { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      visuales: visualDe(p),
      clave: clave(p),
    };
  },
};

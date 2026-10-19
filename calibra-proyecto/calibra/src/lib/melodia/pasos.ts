import {
  DURACION_FIGURA,
  FIGURAS,
  formaFigura,
  frecuenciaDeNota,
  indiceDiatonicoAbsoluto,
  LETRA_A_CIFRADO,
  LETRAS,
  nombreNota,
  NOMBRE_FIGURA,
  semitonoAbsoluto,
  TEMPOS_ITALIANOS,
  type FiguraRitmica,
  type NotaMusical,
  type PreguntaMelodia,
} from "@/lib/practica/melodia";

// «Cómo se resuelve» de Melodía (pedido 2026-10-18). Se arma desde la pregunta ya
// generada (las notas, el acorde o el pulso que trae, o el enunciado para las de
// texto), así que vale para la web y la app sin tocar los generadores.

const coma = (x: number) => String(Math.round(x * 1000) / 1000).replace(".", ",");
const FIGURA_POR_NOMBRE = new Map(FIGURAS.map((f) => [NOMBRE_FIGURA[f].toLowerCase(), f]));
const figuraDe = (texto: string): FiguraRitmica | undefined => FIGURA_POR_NOMBRE.get(texto.toLowerCase());
const PLURALES: [string, FiguraRitmica][] = [
  ["semicorcheas", "semicorchea"],
  ["semifusas", "semifusa"],
  ["corcheas", "corchea"],
  ["blancas", "blanca"],
  ["negras", "negra"],
  ["fusas", "fusa"],
];

function valorEnNegras(f: FiguraRitmica): string {
  const d = DURACION_FIGURA[f];
  if (d === 1) return "1 tiempo (una negra)";
  return d > 1 ? `${coma(d)} negras` : `1/${coma(1 / d)} de negra`;
}

function pasosFigura(f: FiguraRitmica): string[] {
  const forma = formaFigura(f);
  const partes = [forma.unidas ? "dos cabezas rellenas unidas por una barra" : forma.hueca ? "cabeza hueca (blanca)" : "cabeza rellena (negra)"];
  if (!forma.unidas) partes.push(forma.plica ? "con plica (el palito)" : "sin plica");
  if (forma.corchetes) partes.push(`${forma.corchetes} ${forma.corchetes === 1 ? "corchete" : "corchetes"}`);
  if (forma.puntillo) partes.push("y un puntillo, que le suma la mitad de su valor");
  return [`Fíjate en la forma: ${partes.join(", ")}`, forma.unidas ? "Son dos corcheas unidas: cada una vale media negra, juntas 1 tiempo" : `Es la ${NOMBRE_FIGURA[f].toLowerCase()}: vale ${valorEnNegras(f)}`];
}

// Dónde cae una nota natural en el pentagrama de clave de sol (líneas Mi4 Sol4 Si4 Re5 Fa5).
function lugarEnPentagrama(n: NotaMusical): string {
  const p = indiceDiatonicoAbsoluto(n) - indiceDiatonicoAbsoluto({ letra: "Mi", octava: 4, alteracion: null });
  if (p >= 0 && p <= 8) return p % 2 === 0 ? `en la ${p / 2 + 1}.ª línea` : `en el ${(p + 1) / 2}.º espacio`;
  const abajo = p < 0;
  const fuera = abajo ? -p : p - 8;
  const lado = abajo ? "de abajo" : "de arriba";
  if (fuera % 2 === 0) return `sobre la ${fuera / 2}.ª línea adicional ${lado}`;
  const k = (fuera - 1) / 2;
  if (k === 0) return abajo ? "justo debajo de la 1.ª línea" : "justo encima de la 5.ª línea";
  return `${abajo ? "debajo de" : "encima de"} la ${k}.ª línea adicional ${lado}`;
}

const nombreSinOctava = (n: NotaMusical) => nombreNota(n).replace(/-?\d+$/, "");

function intervalos(notas: NotaMusical[]): number[] {
  return notas.slice(1).map((n, i) => semitonoAbsoluto(n) - semitonoAbsoluto(notas[i]));
}
const tonoOSemitono = (d: number) => (d === 1 ? "S" : d === 2 ? "T" : d === 3 ? "T+S" : `${d}`);

const NOMBRE_INTERVALO: Record<number, string> = {
  2: "segunda mayor",
  3: "tercera menor",
  4: "tercera mayor",
  5: "cuarta justa",
  6: "quinta disminuida",
  7: "quinta justa",
  8: "quinta aumentada",
  9: "sexta mayor / séptima disminuida",
  10: "séptima menor",
  11: "séptima mayor",
  14: "novena",
  17: "oncena",
  21: "trecena",
};

function pasosAcorde(notas: NotaMusical[], respuesta: string): string[] {
  const f = semitonoAbsoluto(notas[0]);
  const desde = notas.slice(1).map((n) => {
    const d = semitonoAbsoluto(n) - f;
    return `${nombreSinOctava(n)} a ${d} semitonos (${NOMBRE_INTERVALO[d] ?? "intervalo"})`;
  });
  return [`Notas: ${notas.map(nombreSinOctava).join(" – ")}`, `Desde la fundamental ${nombreSinOctava(notas[0])}: ${desde.join(", ")}`, `Esa combinación es: ${respuesta}`];
}

const FORMULAS_ESCALA = "Mayor T-T-S-T-T-T-S · Menor natural T-S-T-T-S-T-T · Pentatónica mayor T-T-(T+S)-T-(T+S) · Pentatónica menor (T+S)-T-T-(T+S)-T";

function pasosTempoTexto(p: PreguntaMelodia): string[] | null {
  const e = p.enunciado;
  const termino = /«(.+)»/.exec(e)?.[1];
  if (termino) {
    const t = TEMPOS_ITALIANOS.find((x) => x.nombre === termino);
    if (t) return [`${t.nombre} = «${t.significa.toLowerCase()}», más o menos de ${t.min} a ${t.max} BPM`];
  }
  if (/más rápido/.test(e)) {
    const ordenados = TEMPOS_ITALIANOS.filter((t) => p.opciones.includes(t.nombre));
    return [`De lento a rápido: ${ordenados.map((t) => `${t.nombre} (${t.min}–${t.max})`).join(" < ")}`, `El más rápido es ${p.respuesta}`];
  }
  if (/60 BPM/.test(e)) return ["BPM son «beats per minute»: pulsos por minuto", "60 BPM = 60 pulsos en un minuto, uno por segundo"];
  const bpm = /A (\d+) BPM/.exec(e);
  if (bpm) {
    const f = figuraDe(/dura una (.+)\?/.exec(e)?.[1] ?? "");
    const n = Number(bpm[1]);
    const negra = 60 / n;
    if (f) return [`La negra dura 60 ÷ ${n} = ${coma(negra)} s`, `La ${NOMBRE_FIGURA[f].toLowerCase()} vale ${coma(DURACION_FIGURA[f])} ${DURACION_FIGURA[f] === 1 ? "negra" : "negras"}: ${coma(DURACION_FIGURA[f])} × ${coma(negra)} = ${p.respuesta}`];
  }
  const cifra = /compás de (\d)\/(\d)/.exec(e);
  if (cifra) {
    const [arriba, abajo] = [Number(cifra[1]), Number(cifra[2])];
    const unidad = abajo === 2 ? "la blanca" : abajo === 4 ? "la negra" : "la corchea";
    const pasos = [`El número de arriba (${arriba}) dice cuántos tiempos hay; el de abajo (${abajo}) qué figura vale un tiempo: ${unidad}`];
    if (/corcheas/.test(e)) {
      const porTiempo = abajo === 2 ? 4 : abajo === 4 ? 2 : 1;
      pasos.push(porTiempo === 1 ? `Cada tiempo es una corchea: ${arriba} corcheas` : `En ${unidad} caben ${porTiempo} corcheas: ${arriba} × ${porTiempo} = ${arriba * porTiempo}`);
    }
    return pasos;
  }
  return null;
}

export function pasosMelodia(p: PreguntaMelodia): string[] {
  const r = p.respuesta;
  if (p.tipo === "pulso") {
    const cada = 60 / p.bpm;
    return [`${p.bpm} BPM = ${p.bpm} pulsos por minuto: un clic cada ${coma(cada)} s`, `Truco: cuenta los clics durante 15 segundos y multiplica por 4 (a ${p.bpm} BPM salen ${coma(p.bpm / 4)})`];
  }
  if (p.tipo === "audio") {
    if (p.acorde) {
      const d = intervalos(p.acorde);
      const caracter = d[0] === 4 && d[1] === 3 ? "mayor: suena luminoso, estable" : d[0] === 3 && d[1] === 4 ? "menor: suena más oscuro, triste" : d[0] === 3 ? "disminuido: tenso, inestable" : "aumentado: suena suspendido, como sin resolver";
      return [...pasosAcorde(p.acorde, r).slice(0, 2), `El acorde ${caracter}`, `Respuesta: ${r}`];
    }
    return [`Sonó ${r} (${Math.round(frecuenciaDeNota(p.nota))} Hz)`, "Referencias para el oído: La4 = 440 Hz (el tono de afinar) y Do4 ≈ 262 Hz (el do central); cada octava duplica la frecuencia"];
  }
  if (p.tipo === "pentagrama") {
    if (p.modo === "lectura") {
      const n = p.notas[0];
      return [`En clave de sol, las líneas de abajo hacia arriba son Mi4, Sol4, Si4, Re5 y Fa5 (y los espacios Fa4, La4, Do5, Mi5)`, `Esta nota está ${lugarEnPentagrama(n)}: es ${r}`];
    }
    if (p.modo === "alteraciones") {
      const n = p.notas[0];
      const natural = { ...n, alteracion: null };
      const pasos = [`La cabeza está ${lugarEnPentagrama(natural)}: es ${nombreNota(natural)}`, `${n.alteracion === "sostenido" ? "El sostenido (♯) la sube" : "El bemol (♭) la baja"} medio tono → ${r}`];
      if (p.dificultad >= 5) pasos.push("Ojo con el enarmónico: suena igual pero se escribe con otra letra, y aquí la letra es la de la línea o el espacio");
      return pasos;
    }
    if (p.modo === "escalas") {
      const d = intervalos(p.notas);
      return [`Notas: ${p.notas.map(nombreSinOctava).join(" – ")}`, `Distancias (T = tono, S = semitono): ${d.map(tonoOSemitono).join("-")}`, `Fórmulas: ${FORMULAS_ESCALA}`, `Coincide con: ${r}`];
    }
    return pasosAcorde(p.notas, r);
  }
  // Texto: Fundamentos y Tempo.
  if (p.figuraId && /cómo se llama/i.test(p.enunciado)) return pasosFigura(p.figuraId);
  const caben = /¿Cuántas (\w+) caben en una (.+)\?/.exec(p.enunciado);
  if (caben) {
    const chica = PLURALES.find(([pl]) => pl === caben[1])?.[1];
    const grande = figuraDe(caben[2]);
    if (chica && grande) return [`En negras: la ${NOMBRE_FIGURA[grande].toLowerCase()} vale ${coma(DURACION_FIGURA[grande])} y la ${NOMBRE_FIGURA[chica].toLowerCase()} ${coma(DURACION_FIGURA[chica])}`, `${coma(DURACION_FIGURA[grande])} ÷ ${coma(DURACION_FIGURA[chica])} = ${r}`];
  }
  if (/cifrado/.test(p.enunciado)) {
    return [`El cifrado americano usa letras empezando por La: ${["La", "Si", "Do", "Re", "Mi", "Fa", "Sol"].map((l) => `${l} = ${LETRA_A_CIFRADO[l as (typeof LETRAS)[number]]}`).join(", ")}`, `Respuesta: ${r}`];
  }
  return pasosTempoTexto(p) ?? [`Respuesta: ${r}`];
}

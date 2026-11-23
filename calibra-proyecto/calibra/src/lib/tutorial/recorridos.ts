// Tutorial guiado por sección (docs/PLAN_TUTORIAL_GUIADO.md, 2026-11-23). La misma
// definición para la web y la app: cada paso enfoca un elemento (su «ancla») o, sin
// ancla, es una tarjeta centrada. Las anclas son distintas en cada plataforma porque
// las pantallas también lo son: en la web es el valor de data-tour (o un selector CSS
// si empieza con un carácter de selector); en la app, el nombre que registra useAncla.
// Si un ancla no está en pantalla, ese paso se salta solo. Máximo 5 pasos por sección.

export type IdRecorrido = "inicio" | "mundos" | "ciudad" | "competir" | "social" | "tienda" | "recompensas" | "perfil" | "curso" | "docente" | "panel";

type Texto = [es: string, en: string];

export interface PasoRecorrido {
  web?: string;
  app?: string;
  // Un paso sin ancla en una plataforma solo se muestra ahí si es centrado (sin web ni app).
  soloEn?: "web" | "app";
  titulo: Texto;
  texto: Texto;
}

export const MAX_PASOS = 5;

export const RECORRIDOS: Record<IdRecorrido, PasoRecorrido[]> = {
  inicio: [
    { titulo: ["Tu base", "Your home"], texto: ["Aquí ves cómo vas y qué te toca hoy. Te muestro lo importante en unos pasos.", "Here you see how you're doing and what's up today. Let me show you the key parts."] },
    { web: "inicio-metricas", titulo: ["Racha, precisión y Chispas", "Streak, accuracy and Sparks"], texto: ["La racha crece con una partida al día. Las Chispas se ganan jugando y se gastan en la tienda.", "Your streak grows with one round a day. Sparks are earned by playing and spent in the shop."] },
    { app: "inicio-continuar", titulo: ["Sigue donde quedaste", "Pick up where you left off"], texto: ["Un toque y vuelves a la última ciudad que jugaste.", "One tap takes you back to the last city you played."] },
    { web: "inicio-retos", titulo: ["Retos", "Challenges"], texto: ["Del día, de la semana y del fin de semana: las mismas preguntas para todos.", "Daily, weekly and weekend: the same questions for everyone."] },
    { web: "inicio-recompensas", app: "inicio-recompensas", titulo: ["Recompensas", "Rewards"], texto: ["Cada partida enciende una estrella de su ciudad; con 7, la constelación te da su premio.", "Each round lights a star in its city; with 7, the constellation gives you its reward."] },
    { web: "inicio-tareas", app: "inicio-tareas", titulo: ["Tareas de tu curso", "Class tasks"], texto: ["Si tu docente te asignó algo, aparece aquí con su plazo.", "If your teacher assigned something, it shows up here with its due date."] },
    { web: "inicio-mundos", titulo: ["Tus ciudades", "Your cities"], texto: ["Entra a una para practicar o aprender. Las que tienen candado se abren con Chispas.", "Enter one to practice or learn. Locked ones open with Sparks."] },
  ],
  mundos: [
    { titulo: ["Las 15 ciudades", "The 15 cities"], texto: ["Cada una es una materia, con su propio día y su propia noche.", "Each one is a subject, with its own day and night."] },
    { app: "mundos-lista", titulo: ["Entra a una", "Step inside"], texto: ["Las tuyas se tocan para jugar; las demás se abren con Chispas o Cometas.", "Tap yours to play; the rest open with Sparks or Comets."] },
    { titulo: ["Doble experiencia", "Double experience"], texto: ["Cada día una ciudad da el doble de Exp: la del paquete en paracaídas.", "Every day one city gives double Exp: the one with the parachute crate."] },
  ],
  ciudad: [
    { titulo: ["Una ciudad", "A city"], texto: ["Practicar: partidas de 60 segundos que se adaptan a ti. Aprender: lecciones cortas para resolver mejor.", "Practice: 60-second rounds that adapt to you. Learn: short lessons to solve better."] },
    { web: "ciudad-nivel", app: "ciudad-nivel", titulo: ["Tu nivel aquí", "Your level here"], texto: ["Sube con cada acierto en esta ciudad. Cada ciudad lleva su propio nivel.", "It rises with every right answer in this city. Each city has its own level."] },
    { app: "ciudad-pestanas", titulo: ["Practicar o aprender", "Practice or learn"], texto: ["Cambia de pestaña cuando quieras: las lecciones explican la técnica antes de practicarla.", "Switch tabs any time: lessons explain the technique before you practice it."] },
    { web: "a[href$='/aprender']", titulo: ["Aprender", "Learn"], texto: ["Lecciones paso a paso, con ejemplos resueltos y un quiz corto.", "Step-by-step lessons with worked examples and a short quiz."] },
    { web: "ciudad-modo", app: "ciudad-modo", titulo: ["Elige un modo", "Pick a mode"], texto: ["Cada modo sube de nivel por separado. Si respondes en racha, ganas segundos.", "Each mode levels up on its own. Answer in a streak to gain seconds."] },
  ],
  competir: [
    { titulo: ["Competir", "Compete"], texto: ["Rankeds contra gente de tu nivel: ganar sube tu ELO, de Bronce a Prodigio.", "Ranked against players at your level: winning raises your ELO, from Bronze to Prodigy."] },
    { titulo: ["Duelos y liga", "Duels and league"], texto: ["Reta a tus amigos a la misma partida, y suma puntos en la liga de la semana.", "Challenge friends to the same round and earn points in the weekly league."] },
  ],
  social: [
    { titulo: ["Social", "Social"], texto: ["Agrega amigos para retarlos en vivo y chatear.", "Add friends to challenge them live and chat."] },
    { titulo: ["Clanes", "Clans"], texto: ["Únete a un clan para sumar puntos juntos en la liga.", "Join a clan to earn league points together."] },
  ],
  tienda: [
    { titulo: ["La tienda", "The shop"], texto: ["Marcos, fondos, fuentes y ayudas para las partidas. Se pagan con Chispas que ganas jugando.", "Frames, backgrounds, fonts and in-round helpers, paid with the Sparks you earn."] },
    { titulo: ["Pruébatelo antes", "Try it first"], texto: ["Toca un objeto para verlo puesto en tu placa antes de comprarlo.", "Tap an item to see it on your card before buying."] },
  ],
  recompensas: [
    { titulo: ["Recompensas", "Rewards"], texto: ["Cada partida enciende estrellas en su ciudad. Con 7, la constelación se dibuja y te da su premio.", "Each round lights stars in its city. With 7, the constellation is drawn and gives you its reward."] },
    { titulo: ["De noche, más", "More at night"], texto: ["Si allí es de noche, el premio trae 20 % más Chispas; en la Gran Alineación, el doble.", "If it's night there, the reward has 20% more Sparks; during the Great Alignment, double."] },
  ],
  perfil: [
    { titulo: ["Tu perfil", "Your profile"], texto: ["Tu placa la ven todos en rankings, duelos y el chat: personalízala.", "Everyone sees your card in rankings, duels and chat: make it yours."] },
    { titulo: ["Logros y estadísticas", "Achievements and stats"], texto: ["Aquí ves tus logros y en qué ciudades te va mejor.", "Here you see your achievements and where you do best."] },
  ],
  curso: [
    { titulo: ["Mi curso", "My class"], texto: ["Únete al curso de tu docente con su código y verás aquí tus tareas.", "Join your teacher's class with their code and your tasks show up here."] },
    { web: "curso-unirse", titulo: ["El código", "The code"], texto: ["Son 6 letras. Si tu colegio tiene licencia, al unirte recibes Pro.", "It's 6 letters. If your school has a license, you get Pro when you join."] },
  ],
  docente: [
    { soloEn: "web", titulo: ["Panel docente", "Teacher dashboard"], texto: ["Crea tus cursos, asigna tareas y mira quién necesita ayuda.", "Create classes, assign tasks and see who needs help."] },
    { web: "docente-licencia", titulo: ["Licencia del colegio", "School license"], texto: ["Con el código del colegio, tus estudiantes reciben Pro mientras dure.", "With the school's code, your students get Pro while it lasts."] },
    { web: "docente-crear", titulo: ["Crea un curso", "Create a class"], texto: ["Ponle el nombre que quieras; te damos un código para compartir.", "Name it anything; we give you a code to share."] },
    { web: "docente-cursos", titulo: ["Tus cursos", "Your classes"], texto: ["Abre uno para ver su panel, sus tareas y su estudio.", "Open one to see its dashboard, tasks and study."] },
  ],
  panel: [
    { web: "curso-codigo", titulo: ["Comparte el código", "Share the code"], texto: ["Tus estudiantes lo escriben en «Mi curso», en la web o en la app.", "Students enter it in \"My class\", on the web or the app."] },
    { web: "curso-resumen", titulo: ["La semana del curso", "The class's week"], texto: ["Cuántos practicaron, cuántos ejercicios hicieron y cuánto acertaron.", "How many practiced, how many exercises and how accurate."] },
    { web: "curso-alertas", titulo: ["Necesitan atención", "Need attention"], texto: ["Quién no ha practicado o acierta poco, sin buscarlo.", "Who hasn't practiced or is struggling, without digging."] },
    { web: "curso-tareas", titulo: ["Tareas", "Tasks"], texto: ["Ciudad, cantidad de ejercicios y fecha límite. Ves el avance de cada uno.", "City, number of exercises and due date. You see everyone's progress."] },
    { web: "curso-pestana-estudio", titulo: ["Estudio del curso", "Class study"], texto: ["Qué temas cuestan, cómo va cada estudiante y qué hacer ahora.", "Which topics are hard, how each student is doing and what to do next."] },
  ],
};

export type Plataforma = "web" | "app";

// Los pasos que aplican a una plataforma (antes de mirar si el ancla está en pantalla).
export function pasosPara(id: IdRecorrido, plataforma: Plataforma): PasoRecorrido[] {
  return RECORRIDOS[id].filter((p) => {
    if (p.soloEn && p.soloEn !== plataforma) return false;
    const ancla = plataforma === "web" ? p.web : p.app;
    if (ancla) return true;
    return !p.web && !p.app;
  });
}

export function textoDe(t: Texto, locale: string): string {
  return locale.startsWith("en") ? t[1] : t[0];
}

// Qué recorrido corresponde a una ruta de la web (sin el idioma), o null.
const CIUDADES = ["numeria", "enigmia", "geografia", "quimia", "anatomia", "melodia", "trigonometria", "historia", "calculia", "circuitia", "estadistica", "naipia", "codia", "dinamia", "vitalia"];

export function recorridoDeRutaWeb(ruta: string): IdRecorrido | null {
  const r = ruta.replace(/\/+$/, "") || "/";
  if (r === "/") return "inicio";
  const partes = r.split("/").filter(Boolean);
  if (partes.length === 1 && CIUDADES.includes(partes[0])) return "ciudad";
  const directo: Record<string, IdRecorrido> = { rankeds: "competir", social: "social", tienda: "tienda", recompensas: "recompensas", perfil: "perfil", curso: "curso", profesor: "docente" };
  if (partes.length === 1 && directo[partes[0]]) return directo[partes[0]];
  if (partes.length === 2 && partes[0] === "profesor") return "panel";
  return null;
}

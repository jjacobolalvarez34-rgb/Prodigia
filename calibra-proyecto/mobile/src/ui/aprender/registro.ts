import type { ComponentType } from "react";
import CuadrosAnimados from "./CuadrosAnimados";
import * as Anatomia from "./anatomia/visuales";
import * as Calculia from "./calculia/visuales";
import * as Circuitia from "./circuitia/visuales";
import * as Codia from "./codia/visuales";
import * as Enigmia from "./enigmia/visuales";
import * as Estadistica from "./estadistica/visuales";
import * as Geografia from "./geografia/visuales";
import * as Historia from "./historia/visuales";
import * as Melodia from "./melodia/visuales";
import * as MelodiaMetronomo from "./melodia/metronomo";
import * as Naipia from "./naipia/visuales";
import * as NumeriaCurso from "./numeria/curso";
import * as Numeria from "./numeria/visuales";
import * as QuimiaMol from "./quimia/moleculas";
import * as Quimia from "./quimia/visuales";
import * as Trigonometria from "./trigonometria/visuales";

// Registro de visuales de lecciones de la app: los MISMOS `tipo` que registran los
// `components/<mundo>/visuales/registro.ts` de la web (npm run paridad lo revisa).
// Cada componente recibe el visual completo en `visual` y se defiende de datos malos.
type ComponenteVisual = ComponentType<{ visual: any }>;
const c = (x: unknown) => x as ComponenteVisual;

export const REGISTRO_VISUALES: Record<string, ComponenteVisual> = {
  cuadros: c(CuadrosAnimados),
  "geografia.mapa": c(Geografia.Mapa),
  "enigmia.secuencia": c(Enigmia.Secuencia),
  "enigmia.agrupacion": c(Enigmia.Agrupacion),
  "enigmia.cadena": c(Enigmia.Cadena),
  "enigmia.eliminacion": c(Enigmia.Eliminacion),
  "enigmia.loci": c(Enigmia.Loci),
  "enigmia.algoritmo": c(Enigmia.Algoritmo),
  "melodia.pentagrama": c(Melodia.PentagramaVisual),
  "melodia.teclado": c(Melodia.Teclado),
  "melodia.escala": c(Melodia.Escala),
  "melodia.acorde": c(Melodia.Acorde),
  "melodia.ritmo": c(Melodia.Ritmo),
  "melodia.frecuencia": c(Melodia.Frecuencia),
  "melodia.metronomo": c(MelodiaMetronomo.Metronomo),
  "naipia.valores": c(Naipia.Valores),
  "naipia.conteo": c(Naipia.Conteo),
  "naipia.cancelacion": c(Naipia.Cancelacion),
  "naipia.verdadero": c(Naipia.Verdadero),
  "naipia.mazo": c(Naipia.MazoCompleto),
  "naipia.comparar": c(Naipia.Comparar),
  "trigonometria.triangulo": c(Trigonometria.Triangulo),
  "trigonometria.resolver": c(Trigonometria.Resolver),
  "trigonometria.circulo": c(Trigonometria.Circulo),
  "trigonometria.cuadrantes": c(Trigonometria.Cuadrantes),
  "trigonometria.onda": c(Trigonometria.Onda),
  "trigonometria.ley": c(Trigonometria.Ley),
  "trigonometria.ecuacion": c(Trigonometria.Ecuacion),
  "trigonometria.identidad": c(Trigonometria.Identidad),
  "trigonometria.mano": c(Trigonometria.Mano),
  "quimia.tabla": c(Quimia.TablaPeriodica),
  "quimia.elemento": c(Quimia.FichaElemento),
  "quimia.enlace": c(QuimiaMol.Enlace),
  "quimia.cruce": c(Quimia.Cruce),
  "quimia.cuadro": c(Quimia.Cuadro),
  "quimia.orbitales": c(Quimia.Orbitales),
  "quimia.redox": c(Quimia.Redox),
  "quimia.oxidacion": c(Quimia.Oxidacion),
  "quimia.balanceo": c(Quimia.Balanceo),
  "quimia.pila": c(Quimia.Pila),
  "quimia.cadena": c(QuimiaMol.Cadena),
  "quimia.grupos": c(QuimiaMol.Grupos),
  "quimia.isomeria": c(QuimiaMol.Isomeria),
  "quimia.hibridacion": c(QuimiaMol.Hibridacion),
  "numeria.columnas": c(Numeria.Columnas),
  "numeria.multiplicacion": c(Numeria.Multiplicacion),
  "numeria.division": c(Numeria.Division),
  "numeria.mcm": c(Numeria.Mcm),
  "numeria.fraccion": c(Numeria.Fraccion),
  "numeria.recta": c(Numeria.Recta),
  "numeria.potencia": c(Numeria.Potencia),
  "numeria.balanza": c(Numeria.Balanza),
  "numeria.figura": c(Numeria.Figura),
  "numeria.metodoFraccion": c(NumeriaCurso.MetodoFraccion),
  "numeria.decimal": c(NumeriaCurso.Decimal),
  "numeria.porcentaje": c(NumeriaCurso.Porcentaje),
  "numeria.exponentes": c(NumeriaCurso.Exponentes),
  "numeria.raiz": c(NumeriaCurso.Raiz),
  "numeria.terminos": c(NumeriaCurso.Terminos),
  "numeria.distributiva": c(NumeriaCurso.Distributiva),
  "numeria.ecuacion": c(NumeriaCurso.Ecuacion),
  "estadistica.ordenar": c(Estadistica.Ordenar),
  "estadistica.frecuencias": c(Estadistica.Frecuencias),
  "estadistica.desvios": c(Estadistica.Desvios),
  "estadistica.grafico": c(Estadistica.GraficoLeccion),
  "estadistica.dispersion": c(Estadistica.Dispersion),
  "estadistica.arbol": c(Estadistica.ArbolProbabilidad),
  "estadistica.normal": c(Estadistica.Normal),
  "calculia.tangente": c(Calculia.Tangente),
  "calculia.area": c(Calculia.Area),
  "calculia.serie": c(Calculia.Serie),
  "calculia.edo": c(Calculia.Edo),
  "codia.traza": c(Codia.Traza),
  "codia.comparar": c(Codia.Comparar),
  "codia.flujo": c(Codia.Flujo),
  "codia.crecimiento": c(Codia.Crecimiento),
  "circuitia.circuito": c(Circuitia.Circuito),
  "circuitia.resistenciaEquivalente": c(Circuitia.ResistenciaEquivalente),
  "circuitia.leyOhm": c(Circuitia.LeyOhm),
  "anatomia.cuerpo": c(Anatomia.Cuerpo),
  "anatomia.esqueleto": c(Anatomia.Esqueleto),
  "anatomia.flujo": c(Anatomia.Flujo),
  "anatomia.grupos": c(Anatomia.Grupos),
  "historia.linea": c(Historia.Linea),
  "historia.epocas": c(Historia.Epocas),
  "historia.causas": c(Historia.Causas),
  "historia.siglos": c(Historia.Siglos),
  "historia.sincronia": c(Historia.Sincronia),
  "historia.personaje": c(Historia.Personaje),
};

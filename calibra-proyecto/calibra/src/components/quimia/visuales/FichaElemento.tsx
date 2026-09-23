"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { configuracionAbreviada, configuracionConSuperindices, datosDe, type DatosElemento } from "@/lib/quimia/datos";
import { familiaDe, elementoPorSimbolo, tieneGrupoDefinido } from "@/lib/quimia/tabla";
import { numeroOxidacion } from "@/lib/quimia/formulas";
import type { CampoFicha, VisualQuimiaElemento } from "@/lib/quimia/visuales";
import type { ElementoQuimico } from "@/lib/practica/quimia";
import { MarcoVisual, TextoDelPaso, COLOR_QUIMIA } from "./comun";
import { COLOR_FAMILIA } from "./TablaPeriodica";

interface Props {
  visual: VisualQuimiaElemento;
}

const CAMPOS_VALIDOS: CampoFicha[] = [
  "numeroAtomico",
  "simbolo",
  "nombre",
  "masa",
  "configuracion",
  "electronegatividad",
  "oxidacion",
  "estado",
  "posicion",
  "familia",
];

function camposValidos(campos: unknown): CampoFicha[] {
  if (!Array.isArray(campos)) return [];
  return campos.filter((c): c is CampoFicha => CAMPOS_VALIDOS.includes(c as CampoFicha));
}

function coma(n: number): string {
  return String(n).replace(".", ",");
}

// Ficha de un elemento (visual "quimia.elemento"): un casillero como los de
// la tabla periódica (número atómico, símbolo, nombre, masa, estados de
// oxidación) más las líneas de configuración, electronegatividad, estado y
// ubicación. Cada paso ilumina un dato y explica qué es y para qué sirve.
// Los valores salen de ELEMENTOS + DATOS_ELEMENTOS (datos.ts), verificados
// en datos.test.ts.
export default function FichaElemento({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.elemento");
  const tf = useTranslations("Quimia.visuales.tabla.familias");
  const el = elementoPorSimbolo(visual.simbolo);
  const datos = datosDe(visual.simbolo);
  const campos = camposValidos(visual.campos);
  const { alVer, ...r } = useReproductor({ total: campos.length, ms: 3400, estatico: visual.estatico, inicio: 1 });
  if (!el || !datos || campos.length === 0) return null;

  const activo = campos[Math.min(campos.length, Math.max(1, r.paso)) - 1];
  const visibles = new Set(campos.slice(0, Math.max(1, r.paso)));
  const familia = familiaDe(el);
  const color = COLOR_FAMILIA[familia];

  const valor = valorDeCampo(el, datos, t, tf);
  const resaltar = (campo: CampoFicha) =>
    activo === campo ? { outline: `2px solid ${COLOR_QUIMIA}`, outlineOffset: 2, borderRadius: 6, background: `color-mix(in oklab, ${COLOR_QUIMIA} 14%, transparent)` } : undefined;
  const opaco = (campo: CampoFicha) => ({ opacity: visibles.has(campo) ? 1 : 0.18, transition: "opacity .3s ease" });

  const alternativa = (
    <ul>
      {campos.map((c) => (
        <li key={c}>
          {t(`campos.${c}.titulo`)}: {valor(c)}. {t(`campos.${c}.explicacion`)}
        </li>
      ))}
    </ul>
  );

  const filas: { campo: CampoFicha; etiqueta: string }[] = [
    { campo: "configuracion", etiqueta: t("campos.configuracion.titulo") },
    { campo: "electronegatividad", etiqueta: t("campos.electronegatividad.titulo") },
    { campo: "oxidacion", etiqueta: t("campos.oxidacion.titulo") },
    { campo: "estado", etiqueta: t("campos.estado.titulo") },
    { campo: "posicion", etiqueta: t("campos.posicion.titulo") },
    { campo: "familia", etiqueta: t("campos.familia.titulo") },
  ];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { nombre: el.nombre })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <div className="flex w-full max-w-sm flex-col gap-3">
        <div
          className="relative mx-auto grid w-44 grid-cols-[auto_1fr_auto] grid-rows-[auto_auto_auto_auto] items-center gap-x-1 rounded-xl border-2 px-2 py-2 text-center"
          style={{ borderColor: color, background: `color-mix(in oklab, ${color} 16%, var(--surface))` }}
        >
          <span className="px-1 text-sm font-bold tabular-nums" style={{ ...resaltar("numeroAtomico"), ...opaco("numeroAtomico") }}>
            {el.numeroAtomico}
          </span>
          <span />
          <span />
          <span
            className="col-span-3 my-1 font-display text-5xl font-black leading-none"
            style={{ ...resaltar("simbolo"), ...opaco("simbolo") }}
          >
            {el.simbolo}
          </span>
          <span className="col-span-3 text-sm font-semibold" style={{ ...resaltar("nombre"), ...opaco("nombre") }}>
            {el.nombre}
          </span>
          <span className="col-span-3 text-xs tabular-nums text-texto-secundario" style={{ ...resaltar("masa"), ...opaco("masa") }}>
            {coma(datos.masa)}
          </span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          {filas.map((f) => (
            <div key={f.campo} className="contents">
              <dt className="px-1 text-texto-secundario" style={{ ...resaltar(f.campo), ...opaco(f.campo) }}>
                {f.etiqueta}
              </dt>
              <dd className="px-1 font-medium text-foreground" style={{ ...resaltar(f.campo), ...opaco(f.campo) }}>
                {valor(f.campo)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <TextoDelPaso>
        <strong>{t(`campos.${activo}.titulo`)}</strong>
        {": "}
        {valor(activo)}
        {" — "}
        {t(`campos.${activo}.explicacion`)}
      </TextoDelPaso>
    </MarcoVisual>
  );
}

function valorDeCampo(
  el: ElementoQuimico,
  datos: DatosElemento,
  t: (clave: string) => string,
  tf: (clave: string) => string
): (campo: CampoFicha) => string {
  return (campo) => {
    switch (campo) {
      case "numeroAtomico":
        return String(el.numeroAtomico);
      case "simbolo":
        return el.simbolo;
      case "nombre":
        return el.nombre;
      case "masa":
        return `${coma(datos.masa)} u`;
      case "configuracion":
        return configuracionConSuperindices(configuracionAbreviada(el.numeroAtomico));
      case "electronegatividad":
        return datos.electronegatividad === null ? t("sinElectronegatividad") : coma(datos.electronegatividad);
      case "oxidacion":
        return datos.estadosOxidacion.map(numeroOxidacion).join(", ");
      case "estado":
        return t(`estados.${datos.estado}`);
      case "posicion":
        // Los del bloque f no tienen un grupo definido (ver tabla.ts).
        return tieneGrupoDefinido(el) ? `${t("grupo")} ${el.grupo}, ${t("periodo")} ${el.periodo}` : `${t("bloqueF")}, ${t("periodo")} ${el.periodo}`;
      case "familia":
        return tf(familiaDe(el));
    }
  };
}

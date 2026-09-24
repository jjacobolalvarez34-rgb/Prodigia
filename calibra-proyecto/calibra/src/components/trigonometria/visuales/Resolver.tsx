"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import TrianguloSVG from "@/components/trigonometria/TrianguloSVG";
import { datosResolver, textoResolver, type ResolverDatos } from "@/lib/trigonometria/visualesDatos";
import type { VisualTrigonometriaResolver } from "@/lib/trigonometria/visuales";
import { COLOR_COSENO, COLOR_HIPOTENUSA, COLOR_SENO, COLOR_TRIGONOMETRIA, Formula, MarcoVisual, useSeparadorDecimal } from "./comun";

interface Props {
  visual: VisualTrigonometriaResolver;
}

function calcular(v: VisualTrigonometriaResolver, sep: "," | "."): ResolverDatos | null {
  try {
    return datosResolver(v, sep);
  } catch {
    return null;
  }
}

// Hallar un lado o un ángulo de un triángulo rectángulo, paso a paso: figura,
// nombres de los lados según el ángulo, qué razón usar, plantear, despejar,
// calcular y comprobar. Todas las cuentas salen de datosResolver().
export default function Resolver({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  const sep = useSeparadorDecimal();
  const datos = calcular(visual, sep);
  const total = datos?.pasos.length ?? 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2800, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;

  const clave = { a: "ladoA", b: "ladoB", c: "ladoC" } as const;
  const paso = datos.pasos[Math.max(0, r.paso - 1)];
  const mostrarRoles = r.paso >= 2;
  const resaltar: Partial<Record<"ladoA" | "ladoB" | "ladoC", string>> = {};
  const nombres: Partial<Record<"ladoA" | "ladoB" | "ladoC", string>> = {};
  if (mostrarRoles) {
    const color = { opuesto: COLOR_SENO, adyacente: COLOR_COSENO, hipotenusa: COLOR_HIPOTENUSA } as const;
    for (const l of ["a", "b", "c"] as const) {
      resaltar[clave[l]] = color[datos.rolDe[l]];
      nombres[clave[l]] = t(`roles.${datos.rolDe[l]}`);
    }
  }
  const oculta = (["a", "b", "c"] as const).filter((l) => l === datos.pedido);
  const omitidas = (["a", "b", "c"] as const).filter((l) => l !== datos.pedido && !datos.dados.includes(l));
  const modoAngulo = datos.modo === "angulo";

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.resolver")}
      titulo={visual.titulo}
      alternativa={<p>{textoResolver(visual, sep)}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_TRIGONOMETRIA} />}
    >
      <TrianguloSVG
        triangulo={{
          ladoA: datos.a,
          ladoB: datos.b,
          ladoC: datos.c,
          anguloA: datos.A,
          anguloB: 90 - datos.A,
          anguloC: 90,
          marcarRectoEn: "C",
          ocultarLados: oculta.map((l) => clave[l]),
          omitirLados: omitidas.map((l) => clave[l]),
          ocultarAngulos: modoAngulo ? ["A", "B"] : ["B"],
        }}
        colorHex={COLOR_TRIGONOMETRIA}
        resaltar={mostrarRoles ? resaltar : undefined}
        nombres={mostrarRoles ? nombres : undefined}
        marcarAngulo="A"
        angulosIncognita={modoAngulo ? ["A"] : undefined}
        descripcion={textoResolver(visual, sep)}
      />
      <ol className="flex flex-col gap-1.5">
        {datos.pasos.slice(0, r.paso).map((p, i) => {
          const actual = p === paso;
          return (
            <li
              key={p.clave}
              className={`rounded-xl border px-3 py-2 text-left text-[13px] leading-snug ${actual ? "border-logro/50 bg-logro/10" : "border-border bg-background"}`}
            >
              <p className="text-foreground">
                <span className="mr-1.5 font-bold" style={{ color: COLOR_TRIGONOMETRIA }}>
                  {i + 1}.
                </span>
                <MathText texto={t(`resolver.${p.clave}`, { letra: datos.pedido ?? "A", fn: datos.fn })} />
              </p>
              {p.formulas.map((f, k) => (
                <Formula key={k} tex={f} tamano="text-[15px]" />
              ))}
            </li>
          );
        })}
      </ol>
    </MarcoVisual>
  );
}

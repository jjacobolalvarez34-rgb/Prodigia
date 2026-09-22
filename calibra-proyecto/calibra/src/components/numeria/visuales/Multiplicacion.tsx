"use client";

import { useTranslations } from "next-intl";
import type { VisualNumeriaMultiplicacion } from "@/lib/numeria/visuales";
import { multiplicacionColumnas } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { CasillaDigito, MarcoVisual, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaMultiplicacion;
}

function digitosAlineados(valor: number, ancho: number): (number | null)[] {
  const texto = String(Math.trunc(Math.abs(valor)));
  const relleno = ancho - texto.length;
  return Array.from({ length: ancho }, (_, i) => (i < relleno ? null : Number(texto[i - relleno])));
}

function Fila({ digitos, activo = false }: { digitos: (number | null)[]; activo?: boolean }) {
  return (
    <div className="flex gap-1">
      {digitos.map((d, i) => (
        <span key={i} className={d === null ? "inline-flex h-10 min-w-10" : ""}>
          {d !== null && <CasillaDigito valor={d} activo={activo} />}
        </span>
      ))}
    </div>
  );
}

// Clase 2 de Numeria: multiplicación en columna con los productos
// parciales apilados (uno por cada dígito del segundo factor, ya con sus
// ceros de corrimiento) y su suma final, animado fila por fila.
export default function Multiplicacion({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.multiplicacion");
  const a = Math.trunc(visual.a);
  const b = Math.trunc(visual.b);
  const valido = Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0;
  const datos = valido ? multiplicacionColumnas(a, b) : null;
  const { alVer, ...r } = useReproductor({
    total: datos?.parciales.length ?? 0,
    ms: 1800,
    estatico: visual.estatico,
  });
  if (!datos) return null;
  const { parciales, resultado } = datos;
  const ancho = Math.max(String(resultado).length, String(a).length);

  const alternativa = (
    <ol>
      <li>
        {a} × {b}
      </li>
      {parciales.map((p, i) => (
        <li key={i}>
          {t("parcial", { d: p.digito, n: p.valor })}
        </li>
      ))}
      <li>{t("suma", { n: resultado })}</li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { a, b })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <Fila digitos={digitosAlineados(a, ancho)} />
      <div className="flex items-center gap-1 self-start">
        <span className="text-lg font-bold" style={{ color: COLOR_NUMERIA }}>
          ×
        </span>
        <Fila digitos={digitosAlineados(b, ancho)} />
      </div>
      <div className="h-0.5 w-full rounded-full" style={{ background: COLOR_NUMERIA, opacity: 0.5 }} />
      {parciales.map((p, i) => {
        const revelado = i < r.paso;
        return (
          <motion.div
            key={i}
            animate={{ opacity: revelado ? 1 : 0, y: revelado ? 0 : 6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Fila digitos={digitosAlineados(revelado ? p.valor : 0, ancho).map((d) => (revelado ? d : null))} activo={i === r.paso - 1} />
          </motion.div>
        );
      })}
      {r.paso >= parciales.length && (
        <>
          <div className="h-0.5 w-full rounded-full" style={{ background: COLOR_NUMERIA, opacity: 0.5 }} />
          <Fila digitos={digitosAlineados(resultado, ancho)} activo />
          <p className="text-sm font-semibold text-foreground">{t("suma", { n: resultado })}</p>
        </>
      )}
    </MarcoVisual>
  );
}

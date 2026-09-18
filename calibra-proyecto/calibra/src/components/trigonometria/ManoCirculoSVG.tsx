"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  colorHex: string;
}

interface Dedo {
  id: number; // 0 = pulgar ... 4 = meñique
  nombre: string;
  grados: number;
  largo: number;
  angulo: number; // grados de abanico respecto de la vertical, para el transform rotate
}

const PIVOTE = { x: 130, y: 205 };
const COLOR_SENO = "#3B82F6";
const COLOR_COSENO = "#F59E0B";
const COLOR_NEUTRO = "#9CA3AF";

// La fórmula real (verificada a mano contra los 5 ángulos notables, ver
// docs/PLAN_REVISION_CONTENIDO.md — bug de la lección vieja documentado
// en la migración 0177): con los dedos numerados 0=pulgar...4=meñique,
// sen(dedo_k) = √k/2 y cos(dedo_k) = √(4-k)/2. Nunca se hardcodea un
// valor por dedo — siempre se calcula acá, así que si algún día cambia
// la asignación de ángulos, el número sigue siendo correcto por
// construcción.
function senoDeK(k: number): number {
  return Math.sqrt(k) / 2;
}
function cosenoDeK(k: number): number {
  return Math.sqrt(4 - k) / 2;
}

function formatoRaiz(k: number): string {
  if (k === 0) return "0";
  if (k === 4) return "1";
  return `√${k}/2`;
}

export default function ManoCirculoSVG({ colorHex }: Props) {
  const t = useTranslations("Trigonometria.leccion.mano");
  const [dedoActivo, setDedoActivo] = useState(3); // arranca en anular (60°), el ejemplo que ya trae la lección

  const dedos: Dedo[] = [
    { id: 0, nombre: t("pulgar"), grados: 0, largo: 58, angulo: -68 },
    { id: 1, nombre: t("indice"), grados: 30, largo: 82, angulo: -34 },
    { id: 2, nombre: t("medio"), grados: 45, largo: 96, angulo: 0 },
    { id: 3, nombre: t("anular"), grados: 60, largo: 88, angulo: 34 },
    { id: 4, nombre: t("menique"), grados: 90, largo: 62, angulo: 68 },
  ];

  const sen = senoDeK(dedoActivo);
  const cos = cosenoDeK(dedoActivo);

  function colorDeDedo(id: number): string {
    if (id === 0) return COLOR_NEUTRO;
    if (id <= dedoActivo) return COLOR_SENO;
    return COLOR_COSENO;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <svg viewBox="0 0 260 220" className="h-56 w-full max-w-[260px]">
        <ellipse cx={PIVOTE.x} cy={PIVOTE.y + 18} rx="46" ry="30" fill="var(--surface-2)" />
        {dedos.map((dedo) => {
          const activo = dedo.id === dedoActivo;
          const color = colorDeDedo(dedo.id);
          const puntaY = PIVOTE.y - dedo.largo - 8;
          return (
            <g key={dedo.id} transform={`rotate(${dedo.angulo} ${PIVOTE.x} ${PIVOTE.y})`}>
              <rect
                x={PIVOTE.x - 12}
                y={PIVOTE.y - dedo.largo}
                width={24}
                height={dedo.largo}
                rx={12}
                fill={color}
                opacity={activo ? 1 : 0.55}
                stroke={activo ? colorHex : "none"}
                strokeWidth={activo ? 2.5 : 0}
                className="cursor-pointer transition-opacity"
                onClick={() => setDedoActivo(dedo.id)}
              />
              {/* Contra-rotación local: el texto queda derecho en el resultado final aunque el <g> padre esté rotado (ver comentario arriba de esta función). */}
              <text
                x={PIVOTE.x}
                y={puntaY}
                textAnchor="middle"
                fontSize="11"
                fontWeight={activo ? 700 : 500}
                fill="var(--foreground)"
                className="pointer-events-none select-none"
                transform={`rotate(${-dedo.angulo} ${PIVOTE.x} ${puntaY})`}
              >
                {dedo.grados}°
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex w-full flex-col gap-2 text-center">
        <p className="text-sm text-texto-secundario">
          {t("instruccion", { dedo: dedos[dedoActivo].nombre })}
        </p>
        <div className="flex justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="h-2 w-6 rounded-full" style={{ background: COLOR_SENO }} />
            <span className="font-mono text-sm font-bold text-foreground">
              sen({dedos[dedoActivo].grados}°) = {formatoRaiz(dedoActivo)} ≈ {sen.toFixed(2)}
            </span>
            <span className="text-xs text-texto-secundario">{t("cuentaSeno")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="h-2 w-6 rounded-full" style={{ background: COLOR_COSENO }} />
            <span className="font-mono text-sm font-bold text-foreground">
              cos({dedos[dedoActivo].grados}°) = {formatoRaiz(4 - dedoActivo)} ≈ {cos.toFixed(2)}
            </span>
            <span className="text-xs text-texto-secundario">{t("cuentaCoseno")}</span>
          </div>
        </div>
        <p className="text-xs text-texto-secundario">{t("tocarDedo")}</p>
      </div>
    </div>
  );
}

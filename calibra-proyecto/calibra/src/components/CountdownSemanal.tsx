"use client";

import { useEffect, useState } from "react";

// Fase 4 de la tanda "Rankeds/Clanes: bugs y ranking visible": contador
// en vivo hasta que se reinicia el ranking semanal — no había un
// patrón de countdown para el reto diario del que copiar (se auditó,
// no existe), así que este es nuevo. El reset real corre en el
// servidor con date_trunc('week', current_date) de Postgres (semana
// ISO, arranca el lunes, en UTC) — el próximo límite se calcula acá
// igual, en UTC, para que la cuenta coincida con el reset real sin
// importar la zona horaria del navegador.
function proximoLunesUtc(): number {
  const ahora = new Date();
  const diaUtc = ahora.getUTCDay(); // 0 = domingo, 1 = lunes, ...
  const diasHastaLunes = diaUtc === 0 ? 1 : diaUtc === 1 ? 7 : 8 - diaUtc;
  const proximo = new Date(
    Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate() + diasHastaLunes, 0, 0, 0)
  );
  return proximo.getTime();
}

function formatearRestante(ms: number): string {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const dias = Math.floor(totalSegundos / 86400);
  const horas = Math.floor((totalSegundos % 86400) / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  if (dias > 0) return `${dias}d ${horas}h ${minutos}m`;
  if (horas > 0) return `${horas}h ${minutos}m ${segundos}s`;
  return `${minutos}m ${segundos}s`;
}

interface Props {
  className?: string;
}

export default function CountdownSemanal({ className = "" }: Props) {
  const [restanteMs, setRestanteMs] = useState<number | null>(null);

  useEffect(() => {
    const limite = proximoLunesUtc();
    function tick() {
      setRestanteMs(limite - Date.now());
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (restanteMs === null) return null;

  return (
    <p className={`font-mono text-xs text-texto-secundario ${className}`}>
      Se reinicia en <span className="font-semibold text-foreground">{formatearRestante(restanteMs)}</span>
    </p>
  );
}

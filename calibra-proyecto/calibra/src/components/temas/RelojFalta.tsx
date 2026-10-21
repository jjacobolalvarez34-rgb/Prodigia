"use client";

import { useEffect, useState } from "react";
import { faltaPara } from "@/lib/temas/eventos";

// Cuenta regresiva que se actualiza cada segundo por su cuenta (así el cartel que la
// contiene no se vuelve a pintar entero). En el servidor no muestra nada: sin saltos.
export default function RelojFalta({ hasta, texto }: { hasta: number; texto: (tiempo: string) => string }) {
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    const tic = () => setAhora(Date.now());
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, []);
  if (ahora == null) return null;
  return <>{texto(faltaPara(hasta, ahora))}</>;
}

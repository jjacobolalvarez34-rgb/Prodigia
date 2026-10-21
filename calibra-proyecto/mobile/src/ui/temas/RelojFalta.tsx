import { useEffect, useState } from "react";
import { faltaPara } from "@/lib/temas/eventos";
import Texto from "~/ui/Texto";

// Cuenta regresiva que se actualiza cada segundo por su cuenta (así el cartel que la
// contiene, con su escena, no se vuelve a pintar entero).
export default function RelojFalta({ hasta, texto, tam = 12 }: { hasta: number; texto: (tiempo: string) => string; tam?: number }) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Texto v="mono" tam={tam}>
      {texto(faltaPara(hasta, ahora))}
    </Texto>
  );
}

import { useEffect, useRef, useState } from "react";
import { type StyleProp, type TextStyle } from "react-native";
import Texto, { type Variante } from "./Texto";

// Número que cuenta hasta su valor (como un cuentakilómetros) cada vez que cambia.
interface Props {
  valor: number;
  // Desde dónde cuenta la primera vez (p. ej. 0 en la pantalla de resultado).
  desde?: number;
  v?: Variante;
  c?: string;
  duracion?: number;
  demora?: number;
  prefijo?: string;
  sufijo?: string;
  formato?: (n: number) => string;
  estilo?: StyleProp<TextStyle>;
  // Se llama en cada "tic" (para el sonido de monedas que llegan).
  onTic?: () => void;
}

const formatoMiles = (n: number) => Math.round(n).toLocaleString("es");

export default function NumeroAnimado({ valor, desde: desdeInicial, v = "mono", c, duracion = 900, demora = 0, prefijo = "", sufijo = "", formato = formatoMiles, estilo, onTic }: Props) {
  const [mostrado, setMostrado] = useState(desdeInicial ?? valor);
  const desdeRef = useRef(desdeInicial ?? valor);
  const ultimoTicRef = useRef(Math.round(desdeInicial ?? valor));
  // En una ref: una función nueva en cada render no debe reiniciar la cuenta.
  const onTicRef = useRef(onTic);
  useEffect(() => {
    onTicRef.current = onTic;
  }, [onTic]);

  useEffect(() => {
    const desde = desdeRef.current;
    if (desde === valor) return;
    let frame = 0;
    let inicio = 0;
    const arranque = setTimeout(() => {
      const paso = (t: number) => {
        if (!inicio) inicio = t;
        const p = Math.min(1, (t - inicio) / duracion);
        const suave = 1 - Math.pow(1 - p, 3);
        const actual = desde + (valor - desde) * suave;
        setMostrado(actual);
        if (onTicRef.current && Math.round(actual) !== ultimoTicRef.current) {
          ultimoTicRef.current = Math.round(actual);
          onTicRef.current();
        }
        if (p < 1) frame = requestAnimationFrame(paso);
        else desdeRef.current = valor;
      };
      frame = requestAnimationFrame(paso);
    }, demora);
    return () => {
      clearTimeout(arranque);
      cancelAnimationFrame(frame);
      desdeRef.current = valor;
    };
  }, [valor, duracion, demora]);

  return (
    <Texto v={v} c={c} style={estilo}>
      {prefijo}
      {formato(mostrado)}
      {sufijo}
    </Texto>
  );
}

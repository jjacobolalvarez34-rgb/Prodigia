const MAX_INTENTOS = 20;

// Deduplicación de problemas dentro de una misma partida: reintenta
// generar hasta MAX_INTENTOS veces si el resultado ya está en el
// registro de "ya mostrado" de esta partida. En niveles muy bajos el
// espacio de problemas posibles puede ser más chico que la cantidad de
// problemas de una partida (ej. sumas de un dígito) — en ese caso, en
// vez de trabarse buscando algo que no existe, se permite repetir
// después de agotar los intentos (la excepción rara, no lo normal).
export function generarSinRepetir<T>(
  generar: () => T,
  clave: (problema: T) => string,
  usados: Set<string>,
  maxIntentos = MAX_INTENTOS
): T {
  let problema = generar();
  let intentos = 1;
  while (usados.has(clave(problema)) && intentos < maxIntentos) {
    problema = generar();
    intentos++;
  }
  usados.add(clave(problema));
  return problema;
}

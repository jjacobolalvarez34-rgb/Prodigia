// Muestra fórmulas químicas embebidas en cualquier texto con sus subíndices
// reales (Al2O3 -> Al₂O₃, Ca(OH)2 -> Ca(OH)₂), como en cualquier libro.
//
// Regla: un número (o secuencia de dígitos) es subíndice SOLO si va pegado
// a una letra o a un ")". Un número que no cumple eso — el "+2"/"-1" de un
// estado de oxidación, "Periodo 3", un coeficiente inicial — queda como
// texto normal a propósito, porque no es un subíndice.
export function partirSubindices(texto: string): { texto: string; sub: boolean }[] {
  const partes: { texto: string; sub: boolean }[] = [];
  const regex = /([A-Za-z)])(\d+)/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto)) !== null) {
    const inicioDigitos = m.index + m[1].length;
    partes.push({ texto: texto.slice(ultimo, inicioDigitos), sub: false });
    partes.push({ texto: m[2], sub: true });
    ultimo = inicioDigitos + m[2].length;
  }
  partes.push({ texto: texto.slice(ultimo), sub: false });
  return partes.filter((p) => p.texto.length > 0);
}

export default function TextoQuimica({ texto }: { texto: string }) {
  return (
    <>
      {partirSubindices(texto).map((p, i) => (p.sub ? <sub key={i}>{p.texto}</sub> : <span key={i}>{p.texto}</span>))}
    </>
  );
}

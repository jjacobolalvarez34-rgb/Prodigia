// Emblema de la Letra libre (0314): tres «Aa» en tres letras distintas, encimadas como
// tipos de imprenta. Tienda, cápsulas e inventario. Mismo dibujo que en la app.
export default function MuestraLetraLibre({ tam = 56 }: { tam?: number }) {
  return (
    <span className="relative inline-block shrink-0 select-none" style={{ width: tam, height: tam }} aria-hidden="true">
      <span className="absolute leading-none text-primario" style={{ left: "6%", top: "4%", fontFamily: "var(--font-lobster)", fontSize: tam * 0.46 }}>
        Aa
      </span>
      <span className="absolute leading-none text-logro" style={{ right: "4%", top: "40%", fontFamily: "var(--font-bungee)", fontSize: tam * 0.28 }}>
        Aa
      </span>
      <span className="absolute leading-none text-foreground" style={{ left: "10%", bottom: "8%", fontFamily: "var(--font-press-start)", fontSize: tam * 0.17 }}>
        Aa
      </span>
    </span>
  );
}

// Firma «Un producto de Mamut Herd» (kit de marca de Mamut Herd, GUIA-DE-USO.md): en el
// pie de las páginas públicas, entre 20 y 28 px de alto, con enlace a la web de Mamut
// Herd. Lleva las dos versiones (fondo claro y oscuro) y el CSS de globals.css muestra
// la que va con el tema.
export const MAMUT_HERD_URL = "https://mamutherdpage.vercel.app";

const PROPORCION = { linea: 5.74, apilado: 2.71 } as const;

export default function MamutHerdSello({ forma = "linea", alto = 24, className }: { forma?: "linea" | "apilado"; alto?: number; className?: string }) {
  const ancho = Math.round(alto * PROPORCION[forma]);
  return (
    <a href={MAMUT_HERD_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex py-2 ${className ?? ""}`} aria-label="Un producto de Mamut Herd">
      {(["claro", "oscuro"] as const).map((fondo) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={fondo}
          src={`/mamut-herd/un-producto-de-mamut-herd-${forma}-para-fondo-${fondo}.svg`}
          alt="Un producto de Mamut Herd"
          width={ancho}
          height={alto}
          className={fondo === "claro" ? "mh-claro" : "mh-oscuro"}
          style={{ height: alto, width: "auto" }}
        />
      ))}
    </a>
  );
}

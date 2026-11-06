// Sin "use client": el layout (componente de servidor) inserta este texto tal cual.
export const CLAVE_TEMA_APP = "prodigia-tema-app";
// Letra libre (0314): la letra de títulos elegida, que gana sobre la del tema.
export const CLAVE_LETRA_APP = "prodigia-letra-app";

// Script de arranque (layout.tsx): lo mismo que aplicarTemaAppWeb, desde localStorage,
// antes de que React pinte nada. Primero el tema (colores, forma y su letra) y después
// la letra elegida, que pisa la del tema.
export const SCRIPT_TEMA_APP = `
(function () {
  var h = document.documentElement;
  try {
    var t = JSON.parse(localStorage.getItem("prodigia-tema-app") || "null");
    if (t && t.slug && t.vars) {
      for (var k in t.vars) h.style.setProperty(k, t.vars[k]);
      h.setAttribute("data-tema-app", t.slug);
      if (t.claro) h.setAttribute("data-tema-claro", "");
      if (t.sombra) h.setAttribute("data-tema-sombra", t.sombra);
      if (t.letra) h.setAttribute("data-letra", t.letra);
    }
  } catch (e) {}
  try {
    var l = JSON.parse(localStorage.getItem("prodigia-letra-app") || "null");
    if (l && l.id && l.vars) {
      for (var j in l.vars) h.style.setProperty(j, l.vars[j]);
      h.setAttribute("data-letra", l.id);
    }
  } catch (e) {}
})();
`;

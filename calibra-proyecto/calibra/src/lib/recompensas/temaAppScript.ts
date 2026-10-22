// Sin "use client": el layout (componente de servidor) inserta este texto tal cual.
export const CLAVE_TEMA_APP = "prodigia-tema-app";

// Script de arranque (layout.tsx): lo mismo que aplicarTemaAppWeb, desde localStorage,
// antes de que React pinte nada.
export const SCRIPT_TEMA_APP = `
(function () {
  try {
    var t = JSON.parse(localStorage.getItem("prodigia-tema-app") || "null");
    if (!t || !t.slug || !t.vars) return;
    var h = document.documentElement;
    for (var k in t.vars) h.style.setProperty(k, t.vars[k]);
    h.setAttribute("data-tema-app", t.slug);
    if (t.claro) h.setAttribute("data-tema-claro", "");
  } catch (e) {}
})();
`;

"""Arma esteticas.html: la maqueta compartida (src/pantallas.html + src/base.css) con
todas las estéticas (src/skins/*.css) y un selector para cambiar entre ellas.

    python construir.py
"""
import html
import random
import re
from pathlib import Path

RAIZ = Path(__file__).parent
SRC = RAIZ / "src"

# Orden del selector y ficha de cada estética.
ESTETICAS = [
    ("actual", "Hoy", "Así se ve la app ahora (referencia)",
     "La app tal como está: Space Grotesk e Inter, resplandores de color y tarjetas redondeadas. Sirve para comparar.",
     "Se mantiene", "Space Grotesk · Inter · JetBrains Mono"),
    ("propia", "Prodigia con identidad", "La de hoy, pulida",
     "La misma app, con más oficio. La noche y las ciudades iluminadas son el hilo: el cielo tiene estrellas, las ciudades son las protagonistas y las barras de progreso se llenan como pisos de ventanas encendidas. Fuera los resplandores en todo: la luz sale solo de las ventanas y del mundo activo. Tipografía con más carácter, superficies con relieve sutil y una barra de pestañas flotante.",
     "Se mantiene", "Bricolage Grotesque · Onest · Geist Mono"),
    ("roguelike", "Roguelike indie", "Balatro, Slay the Spire, Gambonanza",
     "Todo es una carta: tarjetas color hueso con contorno negro grueso y sombra corrida, sobre una mesa de pintura que gira. Letra pixelada y botones de colores planos como fichas.",
     "Se mantiene (violeta de fondo, dorado y racha)", "Pixelify Sans"),
    ("rpg", "Fantasía RPG", "Clash Royale",
     "Paneles azules con marco dorado, botones gordos que brillan y se hunden, títulos blancos con contorno negro. Cielo de fondo y todo con volumen.",
     "Se adapta (cielo azul; violeta, dorado y racha se quedan)", "Lilita One · Nunito"),
    ("cozy", "Cozy pixel art", "Stardew Valley",
     "Marcos de madera de tres tonos con esquinas en escalón, papel cálido adentro y pasto de fondo. Píxeles grandes, todo amable y legible.",
     "Se adapta (cálida, de día)", "Jersey 10 · VT323"),
    ("portatil", "Retro portátil", "Game Boy",
     "La pantalla de 4 verdes con su matriz de puntos y el marco gris. Bordes dobles, sin curvas.",
     "No se mantiene: la pantalla solo tiene 4 tonos", "Silkscreen · DotGothic16"),
    ("academia", "Dark academia", "Academia arcana",
     "Cuero oscuro, papel envejecido y filetes de bronce. Botones de lacre y el violeta de Prodigia como tinta mágica.",
     "Se adapta (violeta como tinta, rojo lacre)", "IM Fell English SC · Cormorant Garamond"),
    ("mitologia", "Mitología ilustrada", "Hades",
     "Negro profundo, fuego y oro. Esquinas cortadas en diagonal, grecas doradas y títulos tallados en mayúsculas.",
     "Se adapta (fuego y oro; los colores de mundo se quedan)", "Cinzel · Alegreya Sans"),
    ("suizo", "Editorial suizo", "Brutalismo",
     "Blanco, negro y un solo color. Bordes de 2 px, sin curvas ni sombras suaves, títulos enormes y la retícula a la vista.",
     "Se reduce: violeta como único color fuerte", "Archivo · IBM Plex Mono"),
    ("papeleria", "Papelería japonesa", "Diario de estudio",
     "Papel cuadriculado, cinta washi, resaltador y sellos. Colores pastel de los mismos mundos, letra a mano.",
     "Se adapta (pastel)", "Zen Maru Gothic · Klee One"),
    ("espacial", "Exploración espacial", "Retrofuturismo",
     "Consolas de misión de los 60 y 70: paneles con tornillos, luces piloto, retícula de puntos y naranja de cohete.",
     "Se adapta (naranja y turquesa; violeta como nebulosa)", "Syncopate · Share Tech Mono"),
    ("geometria", "Geometría imposible", "Monument Valley",
     "Cielo pastel en degradé, losas con canto sólido como bloques isométricos y letra fina y espaciada.",
     "Se adapta (pastel)", "Josefin Sans · Quicksand"),
    ("arcade", "Arcade noventero", "Salones de los 90",
     "Negro de pantalla CRT, neón magenta y cian, bordes de píxel y números de marcador.",
     "Se adapta (neón)", "Bungee · Press Start 2P · Chakra Petch"),
    ("atlas", "Atlas ilustrado", "Mapas antiguos",
     "Papel de mapa con curvas de nivel, tinta azul de imprenta, cartelas de doble filete y los mundos como manchas de acuarela.",
     "Se adapta (tinta y acuarela)", "Alegreya SC · Alegreya"),
]

FUENTES = [
    "family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;700"
    "&family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Onest:wght@400;500;600;700&family=Geist+Mono:wght@500;700"
    "&family=Pixelify+Sans:wght@400..700&family=Lilita+One&family=Nunito:wght@600;800;900&family=Jersey+10&family=VT323",
    "family=Silkscreen:wght@400;700&family=DotGothic16&family=IM+Fell+English+SC&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500"
    "&family=Cinzel:wght@600;800;900&family=Alegreya+Sans:wght@400;500;700&family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@500;700",
    "family=Zen+Maru+Gothic:wght@500;700;900&family=Klee+One:wght@400;600&family=Syncopate:wght@700&family=Share+Tech+Mono"
    "&family=Josefin+Sans:wght@300;400;600;700&family=Quicksand:wght@400;500;700&family=Press+Start+2P&family=Bungee"
    "&family=Chakra+Petch:wght@400;600;700&family=Alegreya+SC:wght@500;700&family=Alegreya:wght@400;500;700",
]


def ciudad(slug: str, alto: int, apagada: bool) -> str:
    """Skyline determinista por ciudad: dos capas de edificios con ventanas."""
    rnd = random.Random(slug)
    ancho = 300
    partes = [f'<rect class="c-cielo" width="{ancho}" height="{alto}"/>']
    if alto >= 80:
        partes.append(f'<circle class="c-luna" cx="{rnd.randint(200, 270)}" cy="{rnd.randint(14, 24)}" r="8"/>')
    for capa, clase, minimo, maximo in ((0, "ed2", 0.45, 0.85), (1, "ed", 0.3, 0.72)):
        x = -rnd.randint(0, 12)
        while x < ancho:
            w = rnd.randint(22, 44) if capa else rnd.randint(28, 52)
            h = int(alto * rnd.uniform(minimo, maximo))
            y = alto - h
            partes.append(f'<rect class="{clase}" x="{x}" y="{y}" width="{w}" height="{h}"/>')
            if capa == 1 or rnd.random() < 0.5:
                for vy in range(y + 6, alto - 6, 9):
                    for vx in range(x + 5, x + w - 6, 8):
                        luz = (not apagada) and rnd.random() < (0.42 if capa else 0.25)
                        partes.append(f'<rect class="{"v" if luz else "vo"}" x="{vx}" y="{vy}" width="4" height="5"/>')
            x += w + rnd.randint(0, 6)
    cls = "ciudad apagada" if apagada else "ciudad"
    return f'<svg class="{cls}" viewBox="0 0 {ancho} {alto}" height="{alto}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">{"".join(partes)}</svg>'


def main():
    pantallas = (SRC / "pantallas.html").read_text(encoding="utf8")
    pantallas = re.sub(
        r"<!--CIUDAD (\w+) (\d+)( apagada)?-->",
        lambda m: ciudad(m.group(1), int(m.group(2)), bool(m.group(3))),
        pantallas,
    )
    base = (SRC / "base.css").read_text(encoding="utf8")
    pieles = "\n".join((SRC / "skins" / f"{e[0]}.css").read_text(encoding="utf8") for e in ESTETICAS)

    botones = "".join(
        f'<button type="button" data-ir="{i}" aria-pressed="false">{html.escape(n)}</button>' for i, n, *_ in ESTETICAS
    )
    fichas = "".join(
        f'<template id="ficha-{i}"><div><h2>{html.escape(n)}</h2><p>{html.escape(t)}</p></div>'
        f'<dl><dt>Referencias</dt><dd>{html.escape(r)}</dd><dt>Paleta</dt><dd>{html.escape(p)}</dd><dt>Tipografías</dt><dd>{html.escape(f)}</dd></dl></template>'
        for i, n, r, t, p, f in ESTETICAS
    )
    enlaces = "".join(f'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{f}&display=swap">' for f in FUENTES)

    doc = f"""<title>Prodigia, catorce pieles</title>
<meta name="description" content="Las mismas pantallas de Prodigia con catorce estéticas visuales.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{enlaces}
<style>
{base}
{pieles}
</style>
<header class="galeria-cab">
  <h1>Prodigia, catorce pieles</h1>
  <div class="selector" role="group" aria-label="Estética">{botones}</div>
  <div class="ficha" id="ficha"></div>
</header>
<div class="maquetas">
{pantallas}
</div>
{fichas}
<script>
(function () {{
  var raiz = document.documentElement;
  var botones = document.querySelectorAll('.selector button');
  var ficha = document.getElementById('ficha');
  function ir(id) {{
    if (!document.getElementById('ficha-' + id)) id = 'actual';
    raiz.dataset.skin = id;
    botones.forEach(function (b) {{ b.setAttribute('aria-pressed', String(b.dataset.ir === id)); }});
    ficha.replaceChildren(document.getElementById('ficha-' + id).content.cloneNode(true));
    try {{ localStorage.setItem('prodigia-piel', id); }} catch (e) {{}}
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  }}
  botones.forEach(function (b) {{ b.addEventListener('click', function () {{ ir(b.dataset.ir); }}); }});
  var inicial = location.hash.slice(1);
  if (!inicial) {{ try {{ inicial = localStorage.getItem('prodigia-piel') || ''; }} catch (e) {{}} }}
  ir(inicial || 'propia');
}})();
</script>
"""
    (RAIZ / "esteticas.html").write_text(doc, encoding="utf8", newline="\n")
    print("ok", len(doc) // 1024, "KB")


if __name__ == "__main__":
    main()

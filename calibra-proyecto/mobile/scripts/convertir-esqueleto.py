# Convierte ../calibra/public/data/esqueleto-oseo.svg (el esqueleto de la web, con
# data-hueso en cada hueso tocable) a datos compactos para react-native-svg:
# cada trazo con su color, su hueso (o ninguno) y la transformación heredada.
# Uso: python scripts/convertir-esqueleto.py
import json, os, re
import xml.etree.ElementTree as ET
AQUI = os.path.dirname(os.path.abspath(__file__))
SVG = os.path.join(AQUI, "..", "..", "calibra", "public", "data", "esqueleto-oseo.svg")
SALIDA = os.path.join(AQUI, "..", "src", "lib", "datos", "esqueleto.json")
NS = "{http://www.w3.org/2000/svg}"
arbol = ET.parse(SVG).getroot()
gradientes = {}
for g in arbol.iter(NS + "linearGradient"):
    stops = [st for st in g.iter(NS + "stop")]
    if stops:
        estilo = stops[len(stops) // 2].get("style", "")
        m = re.search(r"stop-color:(#[0-9a-fA-F]{3,6})", estilo)
        gradientes[g.get("id")] = m.group(1) if m else "#dcc06d"
def estilo_de(e):
    d = {}
    for par in (e.get("style") or "").split(";"):
        if ":" in par:
            k, v = par.split(":", 1)
            d[k.strip()] = v.strip()
    for k in ("fill", "stroke", "stroke-width", "opacity", "fill-opacity", "display"):
        if e.get(k) is not None:
            d[k] = e.get(k)
    return d
def color(v):
    if not v or v == "none":
        return None
    m = re.match(r"url\(#([^)]+)\)", v)
    if m:
        return gradientes.get(m.group(1), "#dcc06d")
    return v
def numeros(d):
    return re.sub(r"-?\d+\.\d+", lambda m: ("%.1f" % float(m.group(0))).rstrip("0").rstrip("."), d)
trazos = []
def recorrer(e, heredado, hueso, transformacion):
    est = dict(heredado)
    est.update(estilo_de(e))
    if est.get("display") == "none":
        return
    hueso = e.get("data-hueso") or hueso
    t = e.get("transform")
    if t:
        transformacion = (transformacion + " " + t).strip()
    if e.tag == NS + "path" and e.get("d"):
        trazos.append({
            "d": numeros(e.get("d")),
            "f": color(est.get("fill", "#000000")),
            "s": color(est.get("stroke")),
            "w": float(re.sub(r"[^\d.]", "", est.get("stroke-width", "1")) or 1) if color(est.get("stroke")) else None,
            "h": hueso if hueso and hueso != "..." else None,
            "t": transformacion or None,
        })
    for hijo in e:
        if hijo.tag in (NS + "defs", NS + "linearGradient"):
            continue
        recorrer(hijo, est, hueso, transformacion)
recorrer(arbol, {}, None, "")
salida = {"viewBox": arbol.get("viewBox"), "trazos": [{k: v for k, v in t.items() if v is not None} for t in trazos]}
json.dump(salida, open(SALIDA, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(trazos), "trazos,", os.path.getsize(SALIDA) // 1024, "KB,", sorted({t["h"] for t in trazos if t.get("h")}))

// Íconos de temporada (2026-10-17). Android no deja cambiar el ícono de una app: lo
// que se puede es tener varias «entradas» (activity-alias) de la misma pantalla, cada
// una con su ícono, y prender una sola. Este plugin, en cada prebuild:
//  - saca el «abrir desde el launcher» de MainActivity y lo pone en los alias:
//    IconoPredeterminado (prendido) y uno por festividad activada (apagados);
//  - copia los íconos de esas fiestas (assets/iconos-temporada/<id>/res, hechos con
//    calibra/scripts/generar-iconos-temporada.ts) y arma su ícono adaptativo.
// La app elige el alias al irse a segundo plano (src/lib/iconoTemporada.ts).
// Para activar otra fiesta: agregarla a ACTIVAS aquí y en src/lib/iconoTemporada.ts.
const fs = require("fs");
const path = require("path");
const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");

const ACTIVAS = ["halloween", "navidad"];
const nombreAlias = (id) => "Icono" + id.split("_").map((p) => p[0].toUpperCase() + p.slice(1)).join("");

function filtroLauncher() {
  return { action: [{ $: { "android:name": "android.intent.action.MAIN" } }], category: [{ $: { "android:name": "android.intent.category.LAUNCHER" } }] };
}

const esLauncher = (f) => (f.action ?? []).some((a) => a.$["android:name"] === "android.intent.action.MAIN") && (f.category ?? []).some((c) => c.$["android:name"] === "android.intent.category.LAUNCHER");

function conManifiesto(config) {
  return withAndroidManifest(config, (c) => {
    const app = c.modResults.manifest.application[0];
    const main = app.activity.find((a) => a.$["android:name"] === ".MainActivity");
    main["intent-filter"] = (main["intent-filter"] ?? []).filter((f) => !esLauncher(f));
    const alias = (nombre, icono, prendido) => ({
      $: {
        "android:name": "." + nombre,
        "android:targetActivity": ".MainActivity",
        "android:enabled": prendido ? "true" : "false",
        "android:exported": "true",
        "android:icon": icono,
        "android:roundIcon": prendido ? "@mipmap/ic_launcher_round" : icono + "_redondo",
      },
      "intent-filter": [filtroLauncher()],
    });
    app["activity-alias"] = [alias("IconoPredeterminado", "@mipmap/ic_launcher", true), ...ACTIVAS.map((id) => alias(nombreAlias(id), "@mipmap/ic_launcher_" + id, false))];
    return c;
  });
}

function conRecursos(config) {
  return withDangerousMod(config, [
    "android",
    (c) => {
      const res = path.join(c.modRequest.platformProjectRoot, "app/src/main/res");
      for (const id of ACTIVAS) {
        const origen = path.join(c.modRequest.projectRoot, "assets/iconos-temporada", id, "res");
        for (const dir of fs.readdirSync(origen)) {
          fs.mkdirSync(path.join(res, dir), { recursive: true });
          for (const f of fs.readdirSync(path.join(origen, dir))) fs.copyFileSync(path.join(origen, dir, f), path.join(res, dir, f));
        }
        // Ícono adaptativo (Android 8+): fondo, frente y la versión de un color (Android 13+).
        const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@mipmap/ic_launcher_${id}_fondo"/>
  <foreground android:drawable="@mipmap/ic_launcher_${id}_frente"/>
  <monochrome android:drawable="@mipmap/ic_launcher_${id}_monocromo"/>
</adaptive-icon>
`;
        fs.mkdirSync(path.join(res, "mipmap-anydpi-v26"), { recursive: true });
        fs.writeFileSync(path.join(res, "mipmap-anydpi-v26", `ic_launcher_${id}.xml`), xml);
        fs.writeFileSync(path.join(res, "mipmap-anydpi-v26", `ic_launcher_${id}_redondo.xml`), xml);
      }
      return c;
    },
  ]);
}

module.exports = function iconosTemporada(config) {
  return conRecursos(conManifiesto(config));
};

package com.prodigia.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlin.math.min

// Widgets de la pantalla de inicio, 100 % nativos: se dibujan con los datos que la
// app guardó (SharedPreferences), sin despertar a JavaScript. Así se pueden poner y
// redibujar aunque el sistema no deje arrancar la app en segundo plano (pasa en
// Xiaomi y otros). Los datos se refrescan cada vez que se abre la app o se termina
// una partida; la festividad del día se elige aquí con el reloj (la app manda los
// tramos de los próximos 60 días).
//
// El fondo y la llama son ilustraciones (Lienzo.kt) en 3 cuadros que un ViewFlipper
// va turnando con fundido; los textos y el botón son vistas reales, nítidas y con el
// toque exacto.
object DatosWidgets {
  private const val PREFS = "prodigia_widgets"
  private const val CLAVE = "resumen"

  fun guardar(context: Context, json: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(CLAVE, json).apply()
  }

  fun leer(context: Context): JSONObject? {
    val crudo = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(CLAVE, null)
    if (crudo.isNullOrEmpty()) return null
    return try {
      JSONObject(crudo)
    } catch (e: Exception) {
      null
    }
  }

  fun numero(n: Int): String = NumberFormat.getIntegerInstance(Locale("es")).format(n)

  // Festividad de hoy (día UTC, igual que src/lib/temas/calendario.ts).
  // Gran Alineación (src/lib/ciudades/cicloDia.ts): cada 672 h desde el 24/10/2026 a
  // las 23:00 UTC, durante 3 h. Le gana a cualquier festividad: el widget se pone dorado.
  private const val PRIMERA_ALINEACION_MS = 1792882800000L
  private const val CICLO_MS = 672L * 3_600_000L
  private const val DURACION_MS = 3L * 3_600_000L

  fun enAlineacion(ahora: Long = System.currentTimeMillis()): Boolean {
    if (ahora < PRIMERA_ALINEACION_MS) return false
    return (ahora - PRIMERA_ALINEACION_MS) % CICLO_MS < DURACION_MS
  }

  fun temaDeHoy(d: JSONObject?): String? {
    if (enAlineacion()) return "alineacion"
    val tramos = d?.optJSONArray("temas") ?: return null
    val formato = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    formato.timeZone = TimeZone.getTimeZone("UTC")
    val hoy = formato.format(Date())
    for (i in 0 until tramos.length()) {
      val t = tramos.optJSONObject(i) ?: continue
      if (hoy >= t.optString("desde") && hoy <= t.optString("hasta")) return t.optString("id").ifEmpty { null }
    }
    return null
  }

  // Abre la app en una ruta (deep link prodigia://...).
  fun abrir(context: Context, ruta: String, codigo: Int): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("prodigia://$ruta")).apply {
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    return PendingIntent.getActivity(context, codigo, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }

  // Tamaño del widget en dp (en vertical: ancho mínimo × alto máximo).
  fun tamano(manager: AppWidgetManager, id: Int, anchoBase: Int, altoBase: Int): Pair<Int, Int> {
    val o: Bundle? = try {
      manager.getAppWidgetOptions(id)
    } catch (e: Exception) {
      null
    }
    val w = o?.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0) ?: 0
    val h = o?.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) ?: 0
    return Pair(if (w > 0) min(w, 640) else anchoBase, if (h > 0) min(h, 420) else altoBase)
  }

  // Pone las ilustraciones: 3 cuadros del fondo y 3 de cada llama. «calidad» baja si el
  // sistema rechaza la primera versión por pesada (Android limita la memoria de imágenes).
  fun ilustrar(context: Context, vistas: RemoteViews, wDp: Int, hDp: Int, altoCiudad: Float, tema: String?, llamas: List<Pair<Int, Int>>, apagada: Boolean, calidad: Float) {
    val u = min(context.resources.displayMetrics.density, 2f) * calidad
    val fondos = intArrayOf(R.id.wp_f0, R.id.wp_f1, R.id.wp_f2)
    for (i in 0 until Lienzo.CUADROS) {
      vistas.setImageViewBitmap(fondos[i], Lienzo.cuadroFondo((wDp * u).toInt(), (hDp * u).toInt(), u, altoCiudad * hDp * u, tema, i))
    }
    for ((cual, ladoDp) in llamas) {
      val vistasLlama = when (cual) {
        0 -> intArrayOf(R.id.wp_l0, R.id.wp_l1, R.id.wp_l2)
        else -> intArrayOf(R.id.wp_m0, R.id.wp_m1, R.id.wp_m2)
      }
      for (i in 0 until Lienzo.CUADROS) vistas.setImageViewBitmap(vistasLlama[i], Lienzo.cuadroLlama(context, (ladoDp * u).toInt(), i, apagada))
    }
  }

  // Manda las vistas; si son demasiado pesadas, prueba con menos resolución.
  fun enviar(manager: AppWidgetManager, id: Int, armar: (Float) -> RemoteViews) {
    for (calidad in floatArrayOf(1f, 0.6f, 0.35f)) {
      try {
        manager.updateAppWidget(id, armar(calidad))
        return
      } catch (e: Exception) {
        // Sigue con menos resolución.
      }
    }
  }

  fun actualizarTodos(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    val racha = manager.getAppWidgetIds(ComponentName(context, WidgetRacha::class.java))
    if (racha.isNotEmpty()) WidgetRacha.dibujar(context, manager, racha)
    val progreso = manager.getAppWidgetIds(ComponentName(context, WidgetProgreso::class.java))
    if (progreso.isNotEmpty()) WidgetProgreso.dibujar(context, manager, progreso)
  }
}

class WidgetRacha : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    dibujar(context, manager, ids)
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, opciones: Bundle?) {
    dibujar(context, manager, intArrayOf(id))
  }

  companion object {
    fun dibujar(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val d = DatosWidgets.leer(context)
      val tema = DatosWidgets.temaDeHoy(d)
      val racha = d?.optInt("racha", 0) ?: 0
      for (id in ids) {
        val (w, h) = DatosWidgets.tamano(manager, id, 150, 150)
        DatosWidgets.enviar(manager, id) { calidad ->
          val vistas = RemoteViews(context.packageName, R.layout.widget_racha)
          DatosWidgets.ilustrar(context, vistas, w, h, 0.34f, tema, listOf(Pair(0, 46)), d == null || racha == 0, calidad)
          if (d == null) {
            vistas.setTextViewText(R.id.wp_racha, "—")
            vistas.setTextViewText(R.id.wp_racha_texto, "Entra a Prodigia para ver tu racha aquí")
            vistas.setTextViewText(R.id.wp_chispas, "—")
            vistas.setOnClickPendingIntent(R.id.wp_raiz, DatosWidgets.abrir(context, "", 10))
          } else {
            vistas.setTextViewText(R.id.wp_racha, "$racha")
            vistas.setTextViewText(R.id.wp_racha_texto, if (racha == 1) "día de racha" else "días de racha")
            vistas.setTextViewText(R.id.wp_chispas, DatosWidgets.numero(d.optInt("chispas", 0)))
            vistas.setOnClickPendingIntent(R.id.wp_raiz, DatosWidgets.abrir(context, "numeria", 11))
          }
          vistas
        }
      }
    }
  }
}

class WidgetProgreso : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    dibujar(context, manager, ids)
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, opciones: Bundle?) {
    dibujar(context, manager, intArrayOf(id))
  }

  companion object {
    fun dibujar(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val d = DatosWidgets.leer(context)
      val tema = DatosWidgets.temaDeHoy(d)
      val racha = d?.optInt("racha", 0) ?: 0
      for (id in ids) {
        val (w, h) = DatosWidgets.tamano(manager, id, 300, 170)
        DatosWidgets.enviar(manager, id) { calidad ->
          val vistas = RemoteViews(context.packageName, R.layout.widget_progreso)
          DatosWidgets.ilustrar(context, vistas, w, h, 0.26f, tema, listOf(Pair(1, 22)), d == null || racha == 0, calidad)
          vistas.setOnClickPendingIntent(R.id.wp_raiz, DatosWidgets.abrir(context, "", 20))
          vistas.setOnClickPendingIntent(R.id.wp_jugar, DatosWidgets.abrir(context, "numeria", 21))
          if (d == null) {
            vistas.setTextViewText(R.id.wp_saludo, "Entra a Prodigia")
            vistas.setTextViewText(R.id.wp_racha, "—")
            vistas.setTextViewText(R.id.wp_chispas, "—")
            vistas.setTextViewText(R.id.wp_nivel, "—")
            vistas.setTextViewText(R.id.wp_meta_numeros, "")
            vistas.setProgressBar(R.id.wp_meta, 100, 0, false)
          } else {
            val avisos = d.optInt("mensajesSinLeer", 0) + d.optInt("novedadesSinLeer", 0)
            val nombre = d.optString("nombre", "")
            vistas.setTextViewText(
              R.id.wp_saludo,
              if (avisos > 0) "$avisos ${if (avisos == 1) "aviso nuevo" else "avisos nuevos"}" else if (nombre.isNotEmpty()) "Hola, $nombre" else ""
            )
            if (avisos > 0) vistas.setOnClickPendingIntent(R.id.wp_saludo, DatosWidgets.abrir(context, "avisos", 22))
            vistas.setTextViewText(R.id.wp_racha, "$racha")
            vistas.setTextViewText(R.id.wp_chispas, DatosWidgets.numero(d.optInt("chispas", 0)))
            vistas.setTextViewText(R.id.wp_nivel, "${d.optInt("nivelCuenta", 1)}")
            val xp = d.optInt("xpHoy", 0)
            val meta = maxOf(1, d.optInt("metaDiaria", 100))
            val pct = minOf(100, maxOf(0, xp * 100 / meta))
            vistas.setTextViewText(R.id.wp_meta_texto, if (pct >= 100) "Meta del día cumplida" else "Meta del día")
            vistas.setTextViewText(R.id.wp_meta_numeros, "$xp/$meta Exp")
            vistas.setProgressBar(R.id.wp_meta, 100, pct, false)
          }
          vistas
        }
      }
    }
  }
}

package com.prodigia.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale

// Widgets de la pantalla de inicio, 100 % nativos: se dibujan con layouts XML y los
// datos que la app guardó (SharedPreferences), sin despertar a JavaScript. Así se
// pueden poner y redibujar aunque el sistema no deje arrancar la app en segundo
// plano (pasa en Xiaomi y otros). Los datos se refrescan cada vez que se abre la app
// o se termina una partida.
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

  // Abre la app en una ruta (deep link prodigia://...).
  fun abrir(context: Context, ruta: String, codigo: Int): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("prodigia://$ruta")).apply {
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    return PendingIntent.getActivity(context, codigo, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
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

  companion object {
    fun dibujar(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val d = DatosWidgets.leer(context)
      val vistas = RemoteViews(context.packageName, R.layout.widget_racha)
      if (d == null) {
        vistas.setTextViewText(R.id.wp_racha, "✦")
        vistas.setTextViewText(R.id.wp_racha_texto, "Entra a Prodigia para ver tu racha aquí")
        vistas.setTextViewText(R.id.wp_chispas, "⚡ —")
        vistas.setOnClickPendingIntent(R.id.wp_raiz, DatosWidgets.abrir(context, "", 10))
      } else {
        val racha = d.optInt("racha", 0)
        vistas.setTextViewText(R.id.wp_racha, "🔥 $racha")
        vistas.setTextViewText(R.id.wp_racha_texto, if (racha == 1) "día de racha" else "días de racha")
        vistas.setTextViewText(R.id.wp_chispas, "⚡ ${DatosWidgets.numero(d.optInt("chispas", 0))}")
        vistas.setOnClickPendingIntent(R.id.wp_raiz, DatosWidgets.abrir(context, "numeria", 11))
      }
      for (id in ids) manager.updateAppWidget(id, vistas)
    }
  }
}

class WidgetProgreso : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    dibujar(context, manager, ids)
  }

  companion object {
    fun dibujar(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val d = DatosWidgets.leer(context)
      val vistas = RemoteViews(context.packageName, R.layout.widget_progreso)
      vistas.setOnClickPendingIntent(R.id.wp_raiz, DatosWidgets.abrir(context, "", 20))
      vistas.setOnClickPendingIntent(R.id.wp_jugar, DatosWidgets.abrir(context, "numeria", 21))
      if (d == null) {
        vistas.setTextViewText(R.id.wp_saludo, "Entra a Prodigia")
        vistas.setTextViewText(R.id.wp_racha, "🔥 —")
        vistas.setTextViewText(R.id.wp_chispas, "⚡ —")
        vistas.setTextViewText(R.id.wp_nivel, "★ —")
        vistas.setTextViewText(R.id.wp_meta_numeros, "")
        vistas.setProgressBar(R.id.wp_meta, 100, 0, false)
      } else {
        val avisos = d.optInt("mensajesSinLeer", 0) + d.optInt("novedadesSinLeer", 0)
        val nombre = d.optString("nombre", "")
        vistas.setTextViewText(
          R.id.wp_saludo,
          if (avisos > 0) "🔔 $avisos ${if (avisos == 1) "aviso" else "avisos"}" else if (nombre.isNotEmpty()) "Hola, $nombre" else ""
        )
        if (avisos > 0) vistas.setOnClickPendingIntent(R.id.wp_saludo, DatosWidgets.abrir(context, "avisos", 22))
        vistas.setTextViewText(R.id.wp_racha, "🔥 ${d.optInt("racha", 0)}")
        vistas.setTextViewText(R.id.wp_chispas, "⚡ ${DatosWidgets.numero(d.optInt("chispas", 0))}")
        vistas.setTextViewText(R.id.wp_nivel, "★ ${d.optInt("nivelCuenta", 1)}")
        val xp = d.optInt("xpHoy", 0)
        val meta = maxOf(1, d.optInt("metaDiaria", 100))
        val pct = minOf(100, maxOf(0, xp * 100 / meta))
        vistas.setTextViewText(R.id.wp_meta_texto, if (pct >= 100) "Meta del día cumplida ✓" else "Meta del día")
        vistas.setTextViewText(R.id.wp_meta_numeros, "$xp/$meta")
        vistas.setProgressBar(R.id.wp_meta, 100, pct, false)
      }
      for (id in ids) manager.updateAppWidget(id, vistas)
    }
  }
}

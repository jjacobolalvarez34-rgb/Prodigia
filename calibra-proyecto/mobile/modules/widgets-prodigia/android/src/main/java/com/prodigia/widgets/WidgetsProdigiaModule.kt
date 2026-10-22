package com.prodigia.widgets

import android.appwidget.AppWidgetManager
import android.content.ClipData
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.content.pm.PackageManager
import android.os.Build
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Puente con la app: guardar los datos que muestran los widgets (y redibujarlos) y
// pedirle al launcher que ancle uno.
class WidgetsProdigiaModule : Module() {
  companion object {
    val ALIAS = listOf("IconoPredeterminado", "IconoHalloween", "IconoNavidad")
  }

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("WidgetsProdigia")

    Function("guardar") { datos: String ->
      DatosWidgets.guardar(context, datos)
      // Dibujar las ilustraciones lleva unos milisegundos: fuera del hilo de JavaScript.
      val ctx = context.applicationContext
      Thread { DatosWidgets.actualizarTodos(ctx) }.start()
    }

    // Íconos de temporada (plugins/iconos-temporada.js): prende el alias del launcher
    // pedido y apaga los demás. DONT_KILL_APP para no cerrar la app; igual se llama al
    // irse a segundo plano, porque algunos launchers la reinician al cambiar.
    Function("iconoActual") {
      val pm = context.packageManager
      ALIAS.firstOrNull { alias ->
        val estado = pm.getComponentEnabledSetting(ComponentName(context.packageName, "${context.packageName}.$alias"))
        estado == PackageManager.COMPONENT_ENABLED_STATE_ENABLED || (estado == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT && alias == "IconoPredeterminado")
      } ?: "IconoPredeterminado"
    }

    Function("cambiarIcono") { nombre: String ->
      if (nombre !in ALIAS) return@Function false
      val pm = context.packageManager
      try {
        // Primero se prende el nuevo, después se apagan los otros: nunca quedan todos apagados.
        pm.setComponentEnabledSetting(ComponentName(context.packageName, "${context.packageName}.$nombre"), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
        for (alias in ALIAS) {
          if (alias != nombre) pm.setComponentEnabledSetting(ComponentName(context.packageName, "${context.packageName}.$alias"), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
        }
        true
      } catch (e: Exception) {
        // En un APK sin los alias (versión vieja del plugin) no hay nada que cambiar.
        false
      }
    }

    Function("anclar") { tipo: String ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@Function false
      val manager = AppWidgetManager.getInstance(context)
      if (!manager.isRequestPinAppWidgetSupported) return@Function false
      val clase = if (tipo == "Racha") WidgetRacha::class.java else WidgetProgreso::class.java
      manager.requestPinAppWidget(ComponentName(context, clase), null, null)
    }

    // Compartir una imagen (la tarjeta del resultado de una partida) con el menú
    // del sistema. `uri` es un content:// (FileSystem.getContentUriAsync): se da
    // permiso de lectura a la app elegida. Share de React Native solo manda texto.
    Function("compartirImagen") { uri: String, texto: String, titulo: String ->
      val imagen = Uri.parse(uri)
      val envio = Intent(Intent.ACTION_SEND).apply {
        type = "image/png"
        putExtra(Intent.EXTRA_STREAM, imagen)
        if (texto.isNotEmpty()) putExtra(Intent.EXTRA_TEXT, texto)
        clipData = ClipData.newRawUri("", imagen)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
      val selector = Intent.createChooser(envio, titulo).apply { addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION) }
      val actividad = appContext.currentActivity
      if (actividad != null) {
        actividad.startActivity(selector)
      } else {
        selector.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(selector)
      }
      true
    }
  }
}

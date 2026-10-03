package com.prodigia.widgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Puente con la app: guardar los datos que muestran los widgets (y redibujarlos) y
// pedirle al launcher que ancle uno.
class WidgetsProdigiaModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("WidgetsProdigia")

    Function("guardar") { datos: String ->
      DatosWidgets.guardar(context, datos)
      DatosWidgets.actualizarTodos(context)
    }

    Function("anclar") { tipo: String ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@Function false
      val manager = AppWidgetManager.getInstance(context)
      if (!manager.isRequestPinAppWidgetSupported) return@Function false
      val clase = if (tipo == "Racha") WidgetRacha::class.java else WidgetProgreso::class.java
      manager.requestPinAppWidget(ComponentName(context, clase), null, null)
    }
  }
}

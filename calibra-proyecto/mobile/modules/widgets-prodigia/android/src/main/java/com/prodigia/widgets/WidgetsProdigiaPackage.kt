package com.prodigia.widgets

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

// Arreglo de «la app se abre sola en Numeria» (2026-10-29): si abriste la app
// tocando un widget (prodigia://numeria) y después Android la vuelve a crear desde
// Recientes (o tras cerrarla el sistema), le entrega OTRA VEZ el intent original y
// expo-router volvía a llevarte a Numeria. Ese intent viejo se limpia: al volver
// desde Recientes se entra al Inicio, como al tocar el ícono.
class WidgetsProdigiaPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context?): List<ReactActivityLifecycleListener> =
    listOf(LimpiarIntentRepetido())
}

class LimpiarIntentRepetido : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
    val intent = activity?.intent ?: return
    val desdeRecientes = (intent.flags and Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0
    if (!desdeRecientes && savedInstanceState == null) return
    if (intent.data?.scheme != "prodigia") return
    activity.intent = Intent(intent).setAction(Intent.ACTION_MAIN).setData(null)
  }
}

package com.prodigia.widgets

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import kotlin.math.max
import kotlin.math.sin

// Dibujo de los widgets (2026-10-17, «se ven feos»): en vez de texto sobre un degradé
// plano, cada widget es una ilustración: cielo con resplandor y estrellas, la ciudad de
// Prodigia al pie con sus ventanas, la llama de la racha con brillo y la chispa de la
// marca. Se dibujan varios cuadros (la llama titila, las ventanas parpadean, cae la
// nieve…) que el widget va turnando. En las festividades la ciudad lleva los adornos de
// la fecha (src/lib/temas). Todo en unidades «u» = 1 dp × escala.
object Lienzo {
  const val CUADROS = 3

  private fun c(hex: String): Int = Color.parseColor(hex)

  private fun conAlfa(color: Int, a: Float): Int = Color.argb((a * 255).toInt().coerceIn(0, 255), Color.red(color), Color.green(color), Color.blue(color))

  // Generador con semilla: la misma ciudad y las mismas estrellas siempre.
  private class Azar(semilla: Long) {
    private var s = semilla
    fun siguiente(): Float {
      s = (s * 6364136223846793005L + 1442695040888963407L)
      return ((s ushr 33) and 0xFFFFFF).toFloat() / 0xFFFFFF.toFloat()
    }
  }

  // Colores de acento de cada festividad (igual que src/lib/temas/temas.ts).
  fun acentoDe(tema: String?): Int = when (tema) {
    "halloween" -> c("#FF8A1F")
    "muertos" -> c("#FF9F1C")
    "diwali", "anio_nuevo", "dia_musica", "linternas" -> c("#FFC53D")
    "navidad", "anio_nuevo_lunar" -> c("#E63946")
    "amor_amistad", "holi" -> c("#FF5D8F")
    "carnaval", "dia_tierra" -> c("#3DDC97")
    "pascua" -> c("#9BE7FF")
    "alineacion" -> c("#F2C14E")
    else -> c("#7C5CFF")
  }

  // ---------- Fondo: cielo con resplandor y estrellas ----------
  fun fondo(canvas: Canvas, w: Float, h: Float, u: Float, tema: String?, cuadro: Int) {
    val radio = 22f * u
    val marco = RectF(0f, 0f, w, h)
    val p = Paint(Paint.ANTI_ALIAS_FLAG)
    p.shader = LinearGradient(0f, 0f, w, h, c("#1E1647"), c("#070913"), Shader.TileMode.CLAMP)
    canvas.drawRoundRect(marco, radio, radio, p)
    // Resplandor del acento arriba a la izquierda.
    val acento = acentoDe(tema)
    p.shader = RadialGradient(w * 0.18f, h * 0.05f, max(w, h) * 0.75f, intArrayOf(conAlfa(acento, 0.45f), conAlfa(acento, 0.12f), Color.TRANSPARENT), floatArrayOf(0f, 0.45f, 1f), Shader.TileMode.CLAMP)
    canvas.drawRoundRect(marco, radio, radio, p)
    p.shader = null
    // Estrellas que titilan entre cuadros.
    val azar = Azar(97)
    for (i in 0 until 26) {
      val x = azar.siguiente() * w
      val y = azar.siguiente() * h * 0.6f
      val r = (0.5f + azar.siguiente() * 1.0f) * u
      val fase = (i + cuadro) % 3
      p.color = conAlfa(Color.WHITE, if (fase == 0) 0.85f else if (fase == 1) 0.45f else 0.25f)
      canvas.drawCircle(x, y, r, p)
    }
  }

  // Borde con brillo, por encima de todo.
  fun borde(canvas: Canvas, w: Float, h: Float, u: Float, tema: String?) {
    val p = Paint(Paint.ANTI_ALIAS_FLAG)
    p.style = Paint.Style.STROKE
    p.strokeWidth = 1.2f * u
    p.shader = LinearGradient(0f, 0f, w, h, intArrayOf(conAlfa(acentoDe(tema), 0.7f), conAlfa(Color.WHITE, 0.08f), conAlfa(acentoDe(tema), 0.35f)), null, Shader.TileMode.CLAMP)
    val m = 0.6f * u
    canvas.drawRoundRect(RectF(m, m, w - m, h - m), 22f * u, 22f * u, p)
  }

  // ---------- La ciudad al pie (con los adornos de la festividad) ----------
  fun ciudad(canvas: Canvas, w: Float, h: Float, u: Float, altoCiudad: Float, tema: String?, cuadro: Int) {
    val azar = Azar(2026)
    val piso = h
    val p = Paint(Paint.ANTI_ALIAS_FLAG)
    // Halo sobre los techos.
    p.shader = LinearGradient(0f, piso - altoCiudad * 1.4f, 0f, piso, Color.TRANSPARENT, conAlfa(acentoDe(tema), 0.18f), Shader.TileMode.CLAMP)
    canvas.drawRect(0f, piso - altoCiudad * 1.4f, w, piso, p)
    p.shader = null
    data class Edificio(val x: Float, val ancho: Float, val alto: Float)
    val edificios = mutableListOf<Edificio>()
    var x = -2f * u
    while (x < w) {
      val ancho = (14f + azar.siguiente() * 20f) * u
      val alto = altoCiudad * (0.35f + azar.siguiente() * 0.65f)
      edificios.add(Edificio(x, ancho, alto))
      x += ancho + 2f * u
    }
    // Plano de atrás: siluetas más altas y claras, sin ventanas.
    val atras = Azar(77)
    var xa = 0f
    while (xa < w) {
      val ancho = (18f + atras.siguiente() * 22f) * u
      val alto = altoCiudad * (0.55f + atras.siguiente() * 0.45f)
      p.color = conAlfa(c("#2A2560"), 0.75f)
      canvas.drawRect(xa, piso - alto, xa + ancho - 1f * u, piso, p)
      xa += ancho
    }
    for (e in edificios) {
      p.shader = LinearGradient(0f, piso - e.alto, 0f, piso, c("#161B3A"), c("#0A0D1E"), Shader.TileMode.CLAMP)
      canvas.drawRect(e.x, piso - e.alto, e.x + e.ancho, piso, p)
      p.shader = null
      // Canto iluminado del techo.
      p.color = conAlfa(acentoDe(tema), 0.35f)
      canvas.drawRect(e.x, piso - e.alto, e.x + e.ancho, piso - e.alto + 0.8f * u, p)
      canvas.drawRect(e.x, piso - e.alto, e.x + e.ancho, piso, p)
      // Ventanas: unas cambian de cuadro a cuadro.
      var vy = piso - e.alto + 5f * u
      while (vy < piso - 3f * u) {
        var vx = e.x + 3f * u
        while (vx < e.x + e.ancho - 4f * u) {
          val r = azar.siguiente()
          if (r < 0.5f) {
            val parpadea = r < 0.08f && (cuadro + (vx / u).toInt()) % 3 == 0
            p.color = if (parpadea) conAlfa(c("#FFD27A"), 0.15f) else conAlfa(c("#FFD27A"), 0.55f + r)
            canvas.drawRect(vx, vy, vx + 2.2f * u, vy + 2.8f * u, p)
          }
          vx += 5.5f * u
        }
        vy += 7f * u
      }
    }
    // Línea de neón del suelo.
    p.color = conAlfa(acentoDe(tema), 0.6f)
    canvas.drawRect(0f, piso - 1.2f * u, w, piso, p)
    // Adornos de la festividad.
    when (tema) {
      "navidad" -> {
        p.color = c("#F4F8FF")
        for (e in edificios) canvas.drawRoundRect(RectF(e.x - 0.5f * u, piso - e.alto - 1.5f * u, e.x + e.ancho + 0.5f * u, piso - e.alto + 1.6f * u), 1.6f * u, 1.6f * u, p)
        val luces = intArrayOf(c("#FF5D5D"), c("#FFD36B"), c("#3DDC97"), c("#5DE4FF"))
        for ((i, e) in edificios.withIndex()) {
          var lx = e.x + 2f * u
          var k = 0
          while (lx < e.x + e.ancho - 1f * u) {
            val col = luces[(k + i + cuadro) % luces.size]
            p.color = conAlfa(col, 0.35f)
            canvas.drawCircle(lx, piso - e.alto + 3f * u, 2.2f * u, p)
            p.color = col
            canvas.drawCircle(lx, piso - e.alto + 3f * u, 0.9f * u, p)
            lx += 4.5f * u
            k++
          }
        }
      }
      "halloween" -> {
        var px = 10f * u
        var i = 0
        while (px < w) {
          val s = (3.5f + (i % 3)) * u
          val cy = piso - s * 0.95f
          p.color = c("#FF8A1F")
          canvas.drawOval(RectF(px - s * 1.25f, cy - s * 0.95f, px + s * 1.25f, cy + s * 0.95f), p)
          p.color = if ((i + cuadro) % 2 == 0) c("#FFE08A") else c("#FFC53D")
          canvas.drawRect(px - s * 0.55f, cy - s * 0.3f, px - s * 0.2f, cy - s * 0.05f, p)
          canvas.drawRect(px + s * 0.2f, cy - s * 0.3f, px + s * 0.55f, cy - s * 0.05f, p)
          canvas.drawRect(px - s * 0.5f, cy + s * 0.25f, px + s * 0.5f, cy + s * 0.45f, p)
          p.color = c("#3A7D44")
          canvas.drawRect(px - 0.5f * u, cy - s * 1.25f, px + 0.5f * u, cy - s * 0.9f, p)
          px += 34f * u
          i++
        }
      }
      "anio_nuevo_lunar", "linternas" -> {
        val col = if (tema == "linternas") c("#FFB347") else c("#E63946")
        for ((i, e) in edificios.withIndex()) {
          if (i % 2 == 1) continue
          val fx = e.x + e.ancho / 2f
          val fy = piso - e.alto + 7f * u + (if ((i + cuadro) % 2 == 0) 0.6f else 0f) * u
          p.color = conAlfa(col, 0.3f)
          canvas.drawCircle(fx, fy, 4.6f * u, p)
          p.color = col
          canvas.drawOval(RectF(fx - 2.8f * u, fy - 2.6f * u, fx + 2.8f * u, fy + 2.6f * u), p)
        }
      }
      "amor_amistad" -> {
        val az = Azar(14)
        for (e in edificios) {
          if (az.siguiente() < 0.5f) continue
          corazon(canvas, e.x + e.ancho / 2f, piso - e.alto + 9f * u, 3.2f * u, c("#FF5D8F"))
        }
      }
      "alineacion" -> {
        // Los 15 soles alineados sobre la ciudad, cada uno del color de su ciudad.
        val soles = intArrayOf(c("#60A5FA"), c("#4FE0F5"), c("#FFC247"), c("#9B85FF"), c("#2FD89B"), c("#3FC1D6"), c("#A8E84A"), c("#8A83FF"), c("#2DD4BF"), c("#E36BF2"), c("#F2C14E"), c("#F25C5C"), c("#E0607E"), c("#E08A5C"), c("#4ADE80"))
        val y = piso - altoCiudad * 1.05f
        p.color = conAlfa(c("#F2C14E"), 0.55f)
        canvas.drawRect(w * 0.04f, y - 0.4f * u, w * 0.96f, y + 0.4f * u, p)
        for ((i, col) in soles.withIndex()) {
          val x = w * (0.06f + i * 0.88f / (soles.size - 1))
          p.color = conAlfa(col, if ((i + cuadro) % 3 == 0) 0.45f else 0.3f)
          canvas.drawCircle(x, y, 4.2f * u, p)
          p.color = col
          canvas.drawCircle(x, y, 1.9f * u, p)
        }
      }
      "diwali" -> {
        for ((i, e) in edificios.withIndex()) {
          val fx = e.x + e.ancho * 0.5f
          val fy = piso - e.alto + 6f * u
          p.color = conAlfa(c("#FFB347"), if ((i + cuadro) % 2 == 0) 0.5f else 0.3f)
          canvas.drawCircle(fx, fy, 3.2f * u, p)
          p.color = c("#FFF3C4")
          canvas.drawCircle(fx, fy, 1f * u, p)
        }
      }
    }
  }

  private fun corazon(canvas: Canvas, x: Float, y: Float, s: Float, color: Int) {
    val path = Path()
    path.moveTo(x, y + s)
    path.cubicTo(x - s * 1.8f, y - s * 0.2f, x - s * 1.1f, y - s * 1.6f, x, y - s * 0.6f)
    path.cubicTo(x + s * 1.1f, y - s * 1.6f, x + s * 1.8f, y - s * 0.2f, x, y + s)
    path.close()
    val p = Paint(Paint.ANTI_ALIAS_FLAG)
    p.color = color
    canvas.drawPath(path, p)
  }

  // ---------- Partículas de la festividad (quietas en cada cuadro, avanzan entre cuadros) ----------
  fun particulas(canvas: Canvas, w: Float, h: Float, u: Float, tema: String?, cuadro: Int) {
    val color = when (tema) {
      "navidad" -> Color.WHITE
      "halloween" -> c("#E07A2E")
      "muertos" -> c("#FF9F1C")
      "amor_amistad" -> c("#FF5D8F")
      "anio_nuevo", "carnaval" -> c("#FFC53D")
      "diwali" -> c("#FFD36B")
      "alineacion" -> c("#FFE08A")
      else -> return
    }
    val sube = tema == "diwali" || tema == "amor_amistad" || tema == "halloween" || tema == "alineacion"
    val p = Paint(Paint.ANTI_ALIAS_FLAG)
    val azar = Azar(311)
    for (i in 0 until 9) {
      val x0 = azar.siguiente() * w
      val y0 = azar.siguiente() * h
      val paso = (cuadro * h / (CUADROS * 3f)) * (0.7f + azar.siguiente() * 0.6f)
      var y = if (sube) y0 - paso else y0 + paso
      y = ((y % h) + h) % h
      val x = x0 + sin((cuadro + i).toDouble()).toFloat() * 3f * u
      val r = (1.1f + azar.siguiente() * 1.1f) * u
      if (tema == "amor_amistad") {
        corazon(canvas, x, y, r * 1.3f, conAlfa(color, 0.8f))
        continue
      }
      // Halo suave y núcleo: copos, brasas y destellos con luz propia.
      p.color = conAlfa(color, 0.18f)
      canvas.drawCircle(x, y, r * 1.9f, p)
      p.color = conAlfa(color, 0.85f)
      canvas.drawCircle(x, y, r * (if (tema == "halloween") 0.7f else 1f), p)
    }
  }

  // ---------- La llama de la racha (el vector wp_llama, igual que src/lib/fx/llama.ts) ----------
  // Cada cuadro cambia un poco el alto, la inclinación y el brillo: al turnarse con
  // fundido, la llama respira y se mece desde la base.
  fun llama(canvas: Canvas, context: Context, cx: Float, cy: Float, alto: Float, cuadro: Int, apagada: Boolean) {
    val estira = floatArrayOf(1f, 1.07f, 0.96f)[cuadro % 3]
    val inclina = floatArrayOf(0f, -0.05f, 0.035f)[cuadro % 3]
    val brillo = floatArrayOf(0.5f, 0.62f, 0.42f)[cuadro % 3]
    if (!apagada) {
      val p = Paint(Paint.ANTI_ALIAS_FLAG)
      val r = alto * 0.62f
      p.shader = RadialGradient(cx, cy + alto * 0.12f, r, intArrayOf(conAlfa(c("#FF8A3D"), brillo), conAlfa(c("#FF5A2B"), brillo * 0.3f), Color.TRANSPARENT), floatArrayOf(0f, 0.5f, 1f), Shader.TileMode.CLAMP)
      canvas.drawCircle(cx, cy + alto * 0.12f, r, p)
    }
    val dibujo = context.getDrawable(if (apagada) R.drawable.wp_llama_apagada else R.drawable.wp_llama)?.mutate() ?: return
    val k = alto / 24f
    canvas.save()
    canvas.translate(cx - 12f * k, cy - 12f * k)
    canvas.scale(k, k)
    // Base de la llama en (12, 21.5) del vector.
    canvas.translate(12f, 21.5f)
    canvas.skew(inclina, 0f)
    canvas.scale(1f, estira)
    canvas.translate(-12f, -21.5f)
    dibujo.setBounds(0, 0, 24, 24)
    dibujo.draw(canvas)
    canvas.restore()
  }

  // ---------- Cuadros listos para el widget ----------
  // Fondo completo (cielo, partículas, ciudad, borde) de w×h px con «u» px por dp.
  fun cuadroFondo(w: Int, h: Int, u: Float, altoCiudad: Float, tema: String?, cuadro: Int): Bitmap {
    val b = Bitmap.createBitmap(max(1, w), max(1, h), Bitmap.Config.ARGB_8888)
    val canvas = Canvas(b)
    val fw = w.toFloat()
    val fh = h.toFloat()
    fondo(canvas, fw, fh, u, tema, cuadro)
    particulas(canvas, fw, fh, u, tema, cuadro)
    ciudad(canvas, fw, fh, u, altoCiudad, tema, cuadro)
    // Esquinas redondeadas (con borde suave): se borra lo que queda fuera.
    val fuera = Path()
    fuera.addRoundRect(RectF(0f, 0f, fw, fh), 22f * u, 22f * u, Path.Direction.CW)
    fuera.fillType = Path.FillType.INVERSE_WINDING
    val borra = Paint(Paint.ANTI_ALIAS_FLAG)
    borra.xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR)
    canvas.drawPath(fuera, borra)
    borde(canvas, fw, fh, u, tema)
    return b
  }

  // Llama sola, cuadrada, con su brillo dentro del cuadro.
  fun cuadroLlama(context: Context, lado: Int, cuadro: Int, apagada: Boolean): Bitmap {
    val b = Bitmap.createBitmap(max(1, lado), max(1, lado), Bitmap.Config.ARGB_8888)
    val canvas = Canvas(b)
    val l = lado.toFloat()
    llama(canvas, context, l / 2f, l * 0.52f, l * 0.8f, cuadro, apagada)
    return b
  }
}

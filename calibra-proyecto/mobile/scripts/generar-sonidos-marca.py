# Uso: python scripts/generar-sonidos-marca.py  (necesita numpy). Escribe
# assets/sonidos/marca.wav y jugar.wav (estéreo, 48 kHz). generar-sonidos.py no los borra.
#
# marca (2026-10-30, versión limpia): menos capas que la primera. Un aire suave que
# sube mientras cae el logo, un golpe grave y redondo justo al asentarse (1,0 s, igual
# que CAIDA_MS*0.8 en PantallaCarga) y la firma sol-do-mi-re-SOL en campana pura, con
# un eco corto en vez del acorde que ensuciaba.
# jugar (2026-10-30): al tocar «Jugar», un golpe hondo que «abre» la partida: bajo que
# cae, un soplo de aire y una quinta grave que se apaga. Con armónicos para que el
# grave se sienta también en el parlante del teléfono.
import numpy as np, wave, os

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "sonidos")


def t_de(dur):
    return np.arange(int(SR * dur)) / SR


def pasabajos(x, corte):
    # Un polo, ida y vuelta (sin desfase): quita lo áspero sin colorear.
    a = np.exp(-2 * np.pi * corte / SR)
    for _ in range(2):
        y = np.empty_like(x)
        acc = 0.0
        for i, v in enumerate(x):
            acc = (1 - a) * v + a * acc
            y[i] = acc
        x = y[::-1]
    return x


def campana(f, dur, vol, caida):
    t = t_de(dur)
    env = np.exp(-caida * t) * np.minimum(1, t / 0.004)
    # Fundamental, octava suave y un parcial de campana muy bajo que se apaga rápido.
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-3 * t)
    s += 0.06 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-9 * t)
    return s * env * vol


def golpe(f0, f1, dur, vol, caida, armonicos=(1.0, 0.35, 0.15)):
    t = t_de(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    fase = 2 * np.pi * np.cumsum(f) / SR
    s = sum(a * np.sin((k + 1) * fase) for k, a in enumerate(armonicos))
    return s * np.exp(-caida * t) * np.minimum(1, t / 0.002) * vol


def aire(dur, vol, sube=True, corte=1800, semilla=3):
    t = t_de(dur)
    r = np.random.default_rng(semilla).uniform(-1, 1, len(t))
    r = pasabajos(r, corte)
    r /= np.max(np.abs(r))
    env = (t / dur) ** 2.2 if sube else np.exp(-6 * t) * np.minimum(1, t / 0.03)
    return r * env * vol


def poner(destino, x, en):
    a = int(SR * en)
    destino[a:a + len(x)] += x[: max(0, len(destino) - a)]


def eco(x, retardos=(0.11, 0.23, 0.37), ganancia=0.22):
    y = x.copy()
    for k, d in enumerate(retardos):
        n = int(SR * d)
        y[n:] += x[:-n] * ganancia * (0.6 ** k)
    return y


def guardar(nombre, izq, der, pico=0.85):
    m = max(np.max(np.abs(izq)), np.max(np.abs(der)))
    izq, der = izq / m * pico, der / m * pico
    k = 2048
    for c in (izq, der):
        c[-k:] *= np.linspace(1, 0, k)
    datos = np.empty(len(izq) * 2)
    datos[0::2], datos[1::2] = izq, der
    with wave.open(os.path.join(OUT, nombre + ".wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(datos, -1, 1) * 32767).astype(np.int16).tobytes())


# ---------- marca ----------
DUR = 3.4
s = np.zeros(int(SR * DUR))
poner(s, aire(1.0, 0.10, corte=1400), 0.0)
poner(s, golpe(110, 52, 0.9, 0.35, 6.5), 1.0)
# Sol4, Do5, Mi5, Re5 y Sol5 largo (la firma de siempre), con una quinta grave debajo del final.
notas = [(392.0, 1.08, 0.5, 0.20, 5.5), (523.25, 1.22, 0.5, 0.20, 5.5), (659.25, 1.36, 0.5, 0.20, 5.5), (587.33, 1.50, 0.5, 0.20, 5.5), (783.99, 1.68, 1.7, 0.30, 2.2)]
firma = np.zeros_like(s)
for f, ini, d, v, c in notas:
    poner(firma, campana(f, d, v, c), ini)
poner(firma, campana(196.0, 1.6, 0.12, 2.0), 1.68)
firma = pasabajos(firma, 6000)
izq = s + eco(firma)
# Un poco de amplitud: el eco del lado derecho llega 9 ms después.
der = s + eco(firma, retardos=(0.12, 0.24, 0.38))
guardar("marca", izq, der)

# ---------- jugar ----------
DUR = 1.5
j = np.zeros(int(SR * DUR))
poner(j, golpe(150, 45, 1.2, 0.8, 4.2, armonicos=(1.0, 0.5, 0.25, 0.1)), 0.0)
poner(j, aire(0.6, 0.12, sube=False, corte=900, semilla=11), 0.0)
for f, v, c in ((65.41, 0.35, 2.6), (98.0, 0.22, 2.8), (130.81, 0.12, 3.5)):
    poner(j, campana(f, 1.4, v, c), 0.02)
j = pasabajos(j, 4000)
guardar("jugar", eco(j, retardos=(0.09, 0.19), ganancia=0.15), eco(j, retardos=(0.1, 0.2), ganancia=0.15), pico=0.9)
print("listo: marca.wav y jugar.wav")

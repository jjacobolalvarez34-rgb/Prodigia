# Uso: python scripts/generar-sonidos.py  (necesita numpy). Reescribe assets/sonidos.
# Sonidos de la app = los tonos Web Audio de la web (src/lib/sonido.ts), sintetizados
# igual (misma onda, frecuencia, duración y caída exponencial) a 44,1 kHz.
import numpy as np, wave, os
SR=44100
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "sonidos")
def onda(tipo,f,t):
    if tipo=="sine": return np.sin(2*np.pi*f*t)
    # Cuadrada y triangular limitadas en banda (sin aliasing = sin "suciedad").
    s=np.zeros_like(t); k=1
    while k*f < SR/2.2 and k<40:
        if tipo=="square": s+=np.sin(2*np.pi*k*f*t)/k
        else: s+=((-1)**((k-1)//2))*np.sin(2*np.pi*k*f*t)/(k*k)
        k+=2
    return s*(4/np.pi if tipo=="square" else 8/np.pi**2)
def onda_deslizada(tipo,f0,f1,t,dur):
    # Altura que cae (o sube) exponencial de f0 a f1, como exponentialRampToValueAtTime:
    # se integra la frecuencia para obtener la fase (si no, la onda «salta»).
    f=f0*(f1/f0)**(t/dur); fase=2*np.pi*np.cumsum(f)/SR
    if tipo=="sine": return np.sin(fase)
    return (2/np.pi)*np.arcsin(np.sin(fase)) if tipo=="triangle" else np.sign(np.sin(fase))
def nota(f,dur,vol=0.12,tipo="sine",f_fin=None):
    n=int(SR*dur); t=np.arange(n)/SR
    # Igual que gain.exponentialRampToValueAtTime(0.0001, t0+dur), con 3 ms de
    # entrada para que no haga "clic".
    env=vol*np.exp(np.log(0.0001/vol)*t/dur)*np.minimum(1,t/0.003)
    return (onda_deslizada(tipo,f,f_fin,t,dur) if f_fin else onda(tipo,f,t))*env
def secuencia(notas,cola=0.03):
    fin=max(i+d for _,i,d,*_ in notas)+cola
    s=np.zeros(int(SR*fin))
    for f,i,d,*r in notas:
        vol=r[0] if r else 0.12; tipo=r[1] if len(r)>1 else "sine"; f_fin=r[2] if len(r)>2 else None
        x=nota(f,d,vol,tipo,f_fin); a=int(SR*i); s[a:a+len(x)]+=x
    return s
def guardar(nombre,s,pico=0.7):
    m=np.max(np.abs(s)); s=s/m*pico if m>0 else s
    k=min(256,len(s)); s[-k:]*=np.linspace(1,0,k)
    with wave.open(os.path.join(OUT,nombre+".wav"),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(s,-1,1)*32767).astype(np.int16).tobytes())
for f in os.listdir(OUT):
    if f.endswith(".wav"): os.remove(os.path.join(OUT,f))
# Acierto: el "tick" de la web (seno 880 Hz, 0,22 s) que sube por la escala mayor con el combo.
escala=[0,2,4,5,7,9,11,12]
for i,st in enumerate(escala):
    guardar(f"acierto{i}",secuencia([(880*2**(st/12),0,0.22)]),0.6)
# «Eh-ehhh» (pedido 2026-10-09): dos notas que caen, la segunda deslizándose.
guardar("error",secuencia([(330,0,.13,.1,"triangle",294),(294,.15,.42,.11,"triangle",185)]),0.55)
# Cuenta regresiva de los últimos 10 segundos (los 3 últimos, más urgentes) y el fin.
guardar("tic",secuencia([(1250,0,.045,.09),(2500,0,.02,.03)]),0.45)
guardar("tic_urgente",secuencia([(1650,0,.07,.11),(3300,0,.03,.04)]),0.55)
guardar("tiempo_fin",secuencia([(880,0,.12,.07,"square"),(698.46,.12,.12,.07,"square"),(587.33,.24,.5,.08,"square"),(293.66,.24,.5,.06,"triangle")]),0.6)
guardar("nivel",secuencia([(523.25,0,.16,.12,"triangle"),(659.25,.09,.16,.12,"triangle"),(784,.18,.28,.12,"triangle")]),0.65)
guardar("logro",secuencia([(523.25,0,.14,.08,"square"),(659.25,.08,.14,.08,"square"),(784,.16,.14,.08,"square"),(1046.5,.24,.4,.1,"square")]),0.5)
guardar("victoria",secuencia([(659.25,0,.18,.12,"triangle"),(784,.1,.18,.12,"triangle"),(1046.5,.2,.45,.12,"triangle")]),0.65)
guardar("derrota",secuencia([(392,0,.2,.08),(329.6,.12,.3,.07)]),0.5)
guardar("recompensa",secuencia([(1318.5,0,.09,.07,"square"),(1760,.07,.16,.09,"square")]),0.45)
guardar("notificacion",secuencia([(987.77,0,.1,.08),(1318.5,.09,.14,.08)]),0.5)
guardar("cuenta",secuencia([(660,0,.16,.1)]),0.55)
guardar("ya",secuencia([(990,0,.32,.1),(1320,0,.32,.07)]),0.6)
guardar("nivel_cuenta",secuencia([(392,0,.1,.05,"triangle"),(440,.08,.1,.06,"triangle"),(523.25,.16,.12,.07,"triangle"),(130.81,.3,.15,.1,"square"),(659.25,.42,.18,.1,"triangle"),(784,.54,.18,.1,"triangle"),(1046.5,.66,.5,.12,"triangle")]),0.6)
# Propios de la app (sin equivalente en la web), en el mismo estilo limpio.
guardar("moneda",secuencia([(1975.5,0,.07,.08),(2637,.035,.09,.06)]),0.35)
guardar("tecla",secuencia([(1200,0,.035,.05)]),0.18)
guardar("boton",secuencia([(740,0,.07,.08)]),0.3)
guardar("combo",secuencia([(659.25,0,.35,.1,"triangle"),(830.6,.03,.35,.08,"triangle"),(987.8,.06,.4,.08,"triangle")]),0.6)
guardar("racha",secuencia([(392,0,.14,.08,"triangle"),(523.25,.1,.14,.09,"triangle"),(784,.2,.32,.1,"triangle")]),0.6)
guardar("swoosh",secuencia([(520,0,.12,.05),(780,.05,.12,.05)]),0.3)
# Metrónomo del modo Tempo de Melodía: el mismo clic que reproducirPulso de la web
# (seno de 1568 Hz en el tiempo fuerte y de 1046,5 Hz en los demás, 0,06 s).
guardar("pulso_fuerte",secuencia([(1568,0,.06,.16)]),0.7)
guardar("pulso",secuencia([(1046.5,0,.06,.12)]),0.55)
# Paquetes de sonido de acierto de la tienda (SONIDOS de calibra/src/lib/recompensas/
# catalogo.ts, mismos números): (frecuencia relativa, inicio, duración, onda, volumen),
# en las mismas 8 alturas que el acierto clásico.
PAQUETES={
    "campanitas":[(2,0,.6,"sine",.1),(5.4,0,.35,"sine",.03),(3,.07,.5,"sine",.06)],
    "ochobits":[(1,0,.07,"square",.06),(1.5,.06,.07,"square",.06),(2,.12,.1,"square",.06)],
    "marimba":[(.5,0,.3,"sine",.16),(2,0,.08,"sine",.04)],
}
for nombre,notas in PAQUETES.items():
    for i,st in enumerate(escala):
        f=880*2**(st/12)
        guardar(f"acierto_{nombre}{i}",secuencia([(f*r,ini,d,v,o) for r,ini,d,o,v in notas]),0.6)
print(sorted(os.listdir(OUT)))

# Notas para el oído absoluto de Melodía: reproducirNotaMusical de la web
# (triangular 0,14 + segundo armónico seno 0,03, 1,1 s), de Do3 (36) a Sol5 (67):
# hasta 67 para que los acordes del oído de acordes (fundamental en la octava 4,
# hasta Si4 + 5.ª aumentada) tengan todas sus notas.
NOTAS=os.path.join(OUT,"notas")
os.makedirs(NOTAS,exist_ok=True)
for semitono in range(36,68):
    f=440*2**((semitono-57)/12)
    s=secuencia([(f,0,1.1,.14,"triangle"),(f*2,0,.9,.03,"sine")])
    m=np.max(np.abs(s)); s=s/m*0.6
    k=min(256,len(s)); s[-k:]*=np.linspace(1,0,k)
    with wave.open(os.path.join(NOTAS,f"nota{semitono}.wav"),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(s,-1,1)*32767).astype(np.int16).tobytes())

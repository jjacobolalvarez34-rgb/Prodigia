"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ARITHMETIC_PROBLEM_TYPES, rangoDeSlug, type ArithmeticProblemType, type FuenteNombre } from "@/types/database";
import type { MundoDuelo } from "@/lib/duelos/rutas";
import ReportarBoton from "@/app/perfil/[userId]/ReportarBoton";
import NombreConFuente from "@/components/NombreConFuente";

export type TipoPost = "logro" | "desafio" | "resultado_duelo" | "subida_rango" | "nivel_mundo" | "desafio_personalizado";

export interface PostFeed {
  id: string;
  userId: string;
  tipo: TipoPost;
  createdAt: string;
  autorNombre: string;
  autorFuente: FuenteNombre;
  logroNombre: string | null;
  logroDescripcion: string | null;
  operationType: string | null;
  nivel: number | null;
  cantidadProblemas: number | null;
  // Fase 5: campos de los 3 tipos auto-generados nuevos.
  mundo: MundoDuelo | "aleatorio" | null;
  rivalNombre: string | null;
  rangoNuevo: string | null;
  nivelMundoValor: number | null;
  // Fase 6: problema personalizado (única excepción a "sin texto libre").
  problemaPregunta: string | null;
  problemaRespuesta: string | null;
  esDeUnSeguido: boolean;
  esPropio: boolean;
  reaccionesTotal: number;
  yoReaccione: boolean;
}

const NOMBRE_MUNDO: Record<string, string> = { numeria: "Numeria", geografia: "Geografía", enigmia: "Enigmia", aleatorio: "todas las ciudades" };

interface Props {
  posts: PostFeed[];
  puedeCrearProblemaPersonalizado: boolean;
}

const NOMBRES_OPERACION: Record<string, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

// Fase 3 del rediseño de Social: antes era FeedClient.tsx con su propia
// columna de "Gente a seguir" — esa columna se reemplazó por completo
// por la barra lateral nueva (FeedSidebar.tsx, amigos/solicitudes/retos),
// así que este componente ya no arma su propio grid de 2 columnas ni
// pide sugeridos — SocialClient es quien arma el layout completo
// (columna central + sidebar fija) y le pasa a este componente solo los
// posts.
export default function Feed({ posts: postsIniciales, puedeCrearProblemaPersonalizado }: Props) {
  const [tab, setTab] = useState<"paraTi" | "siguiendo">("paraTi");
  const [posts, setPosts] = useState(postsIniciales);
  const [mostrandoForm, setMostrandoForm] = useState<"ninguno" | "desafio" | "personalizado">("ninguno");

  const visibles = tab === "paraTi" ? posts : posts.filter((p) => p.esDeUnSeguido || p.esPropio);

  async function reaccionar(postId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, yoReaccione: !p.yoReaccione, reaccionesTotal: p.reaccionesTotal + (p.yoReaccione ? -1 : 1) }
          : p
      )
    );
    await fetch("/api/feed/reaccionar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
          <button
            onClick={() => setTab("paraTi")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === "paraTi" ? "bg-primario text-white" : "text-texto-secundario"
            }`}
          >
            Para ti
          </button>
          <button
            onClick={() => setTab("siguiendo")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === "siguiendo" ? "bg-primario text-white" : "text-texto-secundario"
            }`}
          >
            Siguiendo
          </button>
        </div>
        <div className="flex gap-2">
          {puedeCrearProblemaPersonalizado && (
            <button
              onClick={() => setMostrandoForm((v) => (v === "personalizado" ? "ninguno" : "personalizado"))}
              className="rounded-lg border border-logro/40 px-3 py-1.5 text-sm font-medium text-foreground"
            >
              + Problema propio
            </button>
          )}
          <button
            onClick={() => setMostrandoForm((v) => (v === "desafio" ? "ninguno" : "desafio"))}
            className="rounded-lg bg-primario px-3 py-1.5 text-sm font-medium text-white"
          >
            + Desafío
          </button>
        </div>
      </div>

      {mostrandoForm === "desafio" && (
        <CrearDesafioForm
          onCreado={() => {
            setMostrandoForm("ninguno");
            window.location.reload();
          }}
        />
      )}
      {mostrandoForm === "personalizado" && (
        <CrearProblemaPersonalizadoForm
          onCreado={() => {
            setMostrandoForm("ninguno");
            window.location.reload();
          }}
        />
      )}

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-sm text-texto-secundario">
          {tab === "siguiendo"
            ? "Todavía no seguís a nadie con actividad — agregá amigos desde la barra lateral."
            : "Todavía no hay nada en el feed."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibles.map((post) => {
            switch (post.tipo) {
              case "logro":
                return <TarjetaLogro key={post.id} post={post} onReaccionar={reaccionar} />;
              case "desafio":
                return <TarjetaDesafio key={post.id} post={post} onReaccionar={reaccionar} />;
              case "desafio_personalizado":
                return <TarjetaDesafioPersonalizado key={post.id} post={post} onReaccionar={reaccionar} />;
              case "resultado_duelo":
                return <TarjetaResultadoDuelo key={post.id} post={post} onReaccionar={reaccionar} />;
              case "subida_rango":
                return <TarjetaSubidaRango key={post.id} post={post} onReaccionar={reaccionar} />;
              case "nivel_mundo":
                return <TarjetaNivelMundo key={post.id} post={post} onReaccionar={reaccionar} />;
              default:
                return null;
            }
          })}
        </div>
      )}
    </div>
  );
}

export function ReaccionBoton({ total, activa, onClick }: { total: number; activa: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        activa ? "bg-racha/15 text-racha" : "bg-surface-2 text-texto-secundario"
      }`}
    >
      🔥 {total}
    </button>
  );
}

function TarjetaLogro({ post, onReaccionar }: { post: PostFeed; onReaccionar: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-logro/30 bg-logro/5 px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏅</span>
        <p className="text-sm text-foreground">
          <Link href={`/perfil/${post.userId}`} className="font-semibold hover:underline">
            <NombreConFuente nombre={post.autorNombre} fuente={post.autorFuente} />
          </Link>{" "}
          desbloqueó <span className="font-semibold">{post.logroNombre}</span>
        </p>
      </div>
      {post.logroDescripcion && <p className="text-xs text-texto-secundario">{post.logroDescripcion}</p>}
      <div>
        <ReaccionBoton total={post.reaccionesTotal} activa={post.yoReaccione} onClick={() => onReaccionar(post.id)} />
      </div>
    </div>
  );
}

function TarjetaDesafio({ post, onReaccionar }: { post: PostFeed; onReaccionar: (id: string) => void }) {
  const router = useRouter();
  const [retando, setRetando] = useState(false);

  async function retar() {
    setRetando(true);
    const res = await fetch("/api/feed/retar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id }),
    });
    const data = await res.json();
    setRetando(false);
    if (res.ok) {
      router.push(`/practica?operacion=${data.operation_type}&duelo=${data.duel_id}`);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
      <p className="text-sm text-foreground">
        <Link href={`/perfil/${post.userId}`} className="font-semibold hover:underline">
          <NombreConFuente nombre={post.autorNombre} fuente={post.autorFuente} />
        </Link>{" "}
        te desafía a <span className="font-semibold">{NOMBRES_OPERACION[post.operationType ?? ""]}</span>, nivel{" "}
        {post.nivel}, {post.cantidadProblemas} problemas.
      </p>
      <div className="flex items-center justify-between">
        <ReaccionBoton total={post.reaccionesTotal} activa={post.yoReaccione} onClick={() => onReaccionar(post.id)} />
        {!post.esPropio && (
          <button
            onClick={retar}
            disabled={retando}
            className="rounded-lg bg-primario px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {retando ? "Creando..." : "Retar"}
          </button>
        )}
      </div>
    </div>
  );
}

// Fase 5: "Juan venció a María en Numeria 🏆" — mundo "aleatorio" es el
// resultado de una serie "todas las ciudades" (mejor de 3), se muestra
// distinto del resto para no decir "en todas las ciudades" como si
// fuera una ciudad más.
function TarjetaResultadoDuelo({ post, onReaccionar }: { post: PostFeed; onReaccionar: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-correcto/30 bg-correcto/5 px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <p className="text-sm text-foreground">
          <Link href={`/perfil/${post.userId}`} className="font-semibold hover:underline">
            <NombreConFuente nombre={post.autorNombre} fuente={post.autorFuente} />
          </Link>{" "}
          venció a <span className="font-semibold">{post.rivalNombre}</span>
          {post.mundo && (
            <>
              {" "}
              en {post.mundo === "aleatorio" ? "todas las ciudades" : NOMBRE_MUNDO[post.mundo]}
            </>
          )}
        </p>
      </div>
      <div>
        <ReaccionBoton total={post.reaccionesTotal} activa={post.yoReaccione} onClick={() => onReaccionar(post.id)} />
      </div>
    </div>
  );
}

// Fase 5: "Juan subió a Diamante 💎" — usa el color/degradé real del
// rango (mismo RANGOS_ELO que ya usa RangoBadge, ningún color nuevo
// inventado acá).
function TarjetaSubidaRango({ post, onReaccionar }: { post: PostFeed; onReaccionar: (id: string) => void }) {
  const rango = post.rangoNuevo ? rangoDeSlug(post.rangoNuevo) : undefined;
  const estiloNombre = rango?.degradado
    ? {
        backgroundImage: `linear-gradient(120deg, ${rango.degradado[0]}, ${rango.degradado[1]})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: rango?.colorHex };

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border px-5 py-4"
      style={{ borderColor: `color-mix(in oklab, ${rango?.colorHex ?? "#FFC53D"} 30%, transparent)`, background: `color-mix(in oklab, ${rango?.colorHex ?? "#FFC53D"} 6%, var(--surface))` }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">💎</span>
        <p className="text-sm text-foreground">
          <Link href={`/perfil/${post.userId}`} className="font-semibold hover:underline">
            <NombreConFuente nombre={post.autorNombre} fuente={post.autorFuente} />
          </Link>{" "}
          subió a <span className="font-bold" style={estiloNombre}>{rango?.nombre ?? post.rangoNuevo}</span>
        </p>
      </div>
      <div>
        <ReaccionBoton total={post.reaccionesTotal} activa={post.yoReaccione} onClick={() => onReaccionar(post.id)} />
      </div>
    </div>
  );
}

// Fase 5: "Juan alcanzó nivel 10 en Numeria 🎯" — solo hitos (cada 5
// niveles, ver /api/practica/finish), no cada nivel.
function TarjetaNivelMundo({ post, onReaccionar }: { post: PostFeed; onReaccionar: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-primario/30 bg-primario/5 px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🎯</span>
        <p className="text-sm text-foreground">
          <Link href={`/perfil/${post.userId}`} className="font-semibold hover:underline">
            <NombreConFuente nombre={post.autorNombre} fuente={post.autorFuente} />
          </Link>{" "}
          alcanzó nivel <span className="font-semibold">{post.nivelMundoValor}</span> en{" "}
          {post.mundo && post.mundo !== "aleatorio" ? NOMBRE_MUNDO[post.mundo] : "su mundo"}
        </p>
      </div>
      <div>
        <ReaccionBoton total={post.reaccionesTotal} activa={post.yoReaccione} onClick={() => onReaccionar(post.id)} />
      </div>
    </div>
  );
}

// Fase 6: problema personalizado — la única tarjeta con texto libre del
// usuario (pregunta/respuesta ya pasaron el filtro de palabras al
// crearse). Responder es inline, sin ELO ni duelo sincronizado: solo
// revela si acertaste o no.
function TarjetaDesafioPersonalizado({ post, onReaccionar }: { post: PostFeed; onReaccionar: (id: string) => void }) {
  const [respuesta, setRespuesta] = useState("");
  const [resultado, setResultado] = useState<{ correcto: boolean; respuesta: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function responder(e: React.FormEvent) {
    e.preventDefault();
    if (!respuesta.trim() || resultado) return;
    setEnviando(true);
    const res = await fetch("/api/feed/responder-personalizado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id, respuesta }),
    });
    const data = await res.json();
    setEnviando(false);
    if (res.ok) setResultado({ correcto: data.correcto, respuesta: data.respuesta_correcta });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-logro/30 bg-logro/5 px-5 py-4">
      <p className="text-sm text-foreground">
        <Link href={`/perfil/${post.userId}`} className="font-semibold hover:underline">
          <NombreConFuente nombre={post.autorNombre} fuente={post.autorFuente} />
        </Link>{" "}
        armó un problema para vos: <span className="font-semibold">✍️ {post.problemaPregunta}</span>
      </p>
      {!post.esPropio && !resultado && (
        <form onSubmit={responder} className="flex gap-2">
          <input
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Tu respuesta..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primario"
          />
          <button
            type="submit"
            disabled={enviando || !respuesta.trim()}
            className="rounded-lg bg-primario px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Responder
          </button>
        </form>
      )}
      {resultado && (
        <p className={`text-sm font-medium ${resultado.correcto ? "text-correcto" : "text-error"}`}>
          {resultado.correcto ? "¡Correcto! 🎉" : `No era — la respuesta era "${resultado.respuesta}"`}
        </p>
      )}
      <div className="flex items-center justify-between">
        <ReaccionBoton total={post.reaccionesTotal} activa={post.yoReaccione} onClick={() => onReaccionar(post.id)} />
        {!post.esPropio && <ReportarBoton postId={post.id} />}
      </div>
    </div>
  );
}

// Fase 6: al menos nivel 10 en algún mundo para ver este botón — el
// servidor (crear_problema_personalizado) es quien realmente lo exige,
// esto solo evita mostrar un formulario que de entrada va a fallar.
function CrearProblemaPersonalizadoForm({ onCreado }: { onCreado: () => void }) {
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear() {
    setEnviando(true);
    setError(null);
    const res = await fetch("/api/feed/crear-problema-personalizado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta, respuesta }),
    });
    const data = await res.json();
    setEnviando(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo publicar el problema.");
      return;
    }
    onCreado();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-logro/30 bg-logro/5 px-5 py-4">
      <p className="font-display text-sm font-semibold text-foreground">Armá tu propio problema</p>
      <input
        value={pregunta}
        onChange={(e) => setPregunta(e.target.value)}
        placeholder="Pregunta (ej: ¿Capital de Mongolia?)"
        maxLength={200}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
      />
      <input
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Respuesta correcta"
        maxLength={100}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <button
        onClick={crear}
        disabled={enviando || pregunta.trim().length < 3 || respuesta.trim().length < 1}
        className="self-start rounded-lg bg-logro px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60"
      >
        {enviando ? "Publicando..." : "Publicar problema"}
      </button>
      <p className="text-[11px] text-texto-secundario">Máximo uno por día — se comparte con todos en el feed.</p>
    </div>
  );
}

function CrearDesafioForm({ onCreado }: { onCreado: () => void }) {
  const [operacion, setOperacion] = useState<ArithmeticProblemType>("suma");
  const [nivel, setNivel] = useState(5);
  const [cantidad, setCantidad] = useState(10);
  const [enviando, setEnviando] = useState(false);

  async function crear() {
    setEnviando(true);
    await fetch("/api/feed/crear-desafio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation_type: operacion, nivel, cantidad_problemas: cantidad }),
    });
    setEnviando(false);
    onCreado();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4">
      <p className="font-display text-sm font-semibold text-foreground">Armá un desafío</p>
      <div className="grid grid-cols-3 gap-2">
        <select
          value={operacion}
          onChange={(e) => setOperacion(e.target.value as ArithmeticProblemType)}
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
        >
          {ARITHMETIC_PROBLEM_TYPES.map((tipo) => (
            <option key={tipo} value={tipo}>
              {NOMBRES_OPERACION[tipo]}
            </option>
          ))}
        </select>
        <select
          value={nivel}
          onChange={(e) => setNivel(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Nivel {n}
            </option>
          ))}
        </select>
        <select
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
        >
          {[5, 10, 15, 20].map((c) => (
            <option key={c} value={c}>
              {c} problemas
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={crear}
        disabled={enviando}
        className="self-start rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {enviando ? "Publicando..." : "Publicar desafío"}
      </button>
    </div>
  );
}

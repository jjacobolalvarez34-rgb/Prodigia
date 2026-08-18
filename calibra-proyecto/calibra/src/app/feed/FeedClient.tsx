"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";

export interface PostFeed {
  id: string;
  userId: string;
  tipo: "logro" | "desafio";
  createdAt: string;
  autorNombre: string;
  logroNombre: string | null;
  logroDescripcion: string | null;
  operationType: string | null;
  nivel: number | null;
  cantidadProblemas: number | null;
  esDeUnSeguido: boolean;
  esPropio: boolean;
  reaccionesTotal: number;
  yoReaccione: boolean;
}

interface Sugerido {
  id: string;
  nombre: string;
}

interface Props {
  posts: PostFeed[];
  sugeridos: Sugerido[];
}

const NOMBRES_OPERACION: Record<string, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

export default function FeedClient({ posts: postsIniciales, sugeridos: sugeridosIniciales }: Props) {
  const [tab, setTab] = useState<"paraTi" | "siguiendo">("paraTi");
  const [posts, setPosts] = useState(postsIniciales);
  const [sugeridos, setSugeridos] = useState(sugeridosIniciales);
  const [mostrandoForm, setMostrandoForm] = useState(false);

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

  async function seguir(id: string) {
    setSugeridos((prev) => prev.filter((s) => s.id !== id));
    await fetch("/api/social/seguir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: id }),
    });
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl flex-1 grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_240px]">
      <div className="flex flex-col gap-6">
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
          <button
            onClick={() => setMostrandoForm((v) => !v)}
            className="rounded-lg bg-primario px-3 py-1.5 text-sm font-medium text-white"
          >
            + Desafío
          </button>
        </div>

        {mostrandoForm && (
          <CrearDesafioForm
            onCreado={() => {
              setMostrandoForm(false);
              window.location.reload();
            }}
          />
        )}

        {visibles.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-sm text-texto-secundario">
            {tab === "siguiendo"
              ? "Todavía no seguís a nadie con actividad — mirá 'Gente a seguir' acá al lado."
              : "Todavía no hay nada en el feed."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {visibles.map((post) =>
              post.tipo === "logro" ? (
                <TarjetaLogro key={post.id} post={post} onReaccionar={reaccionar} />
              ) : (
                <TarjetaDesafio key={post.id} post={post} onReaccionar={reaccionar} />
              )
            )}
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Gente a seguir</p>
        {sugeridos.length === 0 ? (
          <p className="text-sm text-texto-secundario">No hay más sugerencias por ahora.</p>
        ) : (
          sugeridos.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground">{s.nombre}</span>
              <button onClick={() => seguir(s.id)} className="text-xs font-medium text-primario hover:underline">
                Seguir
              </button>
            </div>
          ))
        )}
      </aside>
    </div>
  );
}

function ReaccionBoton({ total, activa, onClick }: { total: number; activa: boolean; onClick: () => void }) {
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
            {post.autorNombre}
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
          {post.autorNombre}
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

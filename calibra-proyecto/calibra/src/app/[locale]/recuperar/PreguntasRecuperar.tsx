"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Boton from "@/components/Boton";
import CampoPassword from "@/components/CampoPassword";
import { MUNDOS_PAGOS } from "@/lib/mundos/precios";

type Paso = "usuario" | "google" | "mundos" | "correo" | "nueva" | "listo" | "bloqueada";

// Recuperar la contraseña con 3 preguntas (pedido 2026-10-14). Las respuestas las revisa
// el servidor (/api/recuperar/*): acá solo se arman las pantallas. Ver lib/auth/recuperacion.ts.
export default function PreguntasRecuperar() {
  const t = useTranslations("Auth.preguntas");
  const tMundos = useTranslations("Mundos.nombres");
  const [paso, setPaso] = useState<Paso>("usuario");
  const [usuario, setUsuario] = useState("");
  const [opciones, setOpciones] = useState<string[]>([]);
  const [google, setGoogle] = useState<boolean | null>(null);
  const [mundos, setMundos] = useState<string[]>([]);
  const [permiso, setPermiso] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [soporte, setSoporte] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function enviar<T>(ruta: string, cuerpo: unknown): Promise<T> {
    const res = await fetch(`/api/recuperar/${ruta}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new Error(data.error ?? t("error"));
    return data;
  }

  async function empezar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setAviso(null);
    try {
      const r = await enviar<{ opciones: string[] }>("preguntas", { usuario });
      setOpciones(r.opciones);
      setPaso("google");
    } catch (err) {
      setAviso((err as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  async function verificar(correo: string) {
    setOcupado(true);
    setAviso(null);
    try {
      const r = await enviar<{ ok: boolean; permiso?: string; quedan?: number | null; bloqueada?: boolean; soporte?: string }>("verificar", { usuario, google, mundos, correo });
      if (r.ok && r.permiso) {
        setPermiso(r.permiso);
        setPaso("nueva");
      } else if (r.bloqueada) {
        setSoporte(r.soporte ?? "");
        setPaso("bloqueada");
      } else {
        setAviso(r.quedan != null ? t("noCoincide", { n: r.quedan }) : t("noCoincideSinCuenta"));
        setGoogle(null);
        setMundos([]);
        setPaso("google");
      }
    } catch (err) {
      setAviso((err as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  async function cambiar(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setAviso(t("corta"));
    if (password !== confirmar) return setAviso(t("noCoinciden"));
    setOcupado(true);
    setAviso(null);
    try {
      await enviar("cambiar", { usuario, permiso, password });
      setPaso("listo");
    } catch (err) {
      setAviso((err as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  const etiqueta = (n: number) => <span className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">{t("pregunta", { n })}</span>;
  const opcionClase = (activa: boolean) =>
    `rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${activa ? "border-primario bg-primario/10 text-foreground" : "border-border bg-background text-foreground hover:border-primario/50"}`;

  return (
    <div className="flex flex-col gap-4">
      {paso === "usuario" && (
        <form onSubmit={empezar} className="flex flex-col gap-3">
          <p className="text-sm text-texto-secundario">{t("intro")}</p>
          <input
            id="recuperar-usuario"
            required
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder={t("usuarioPlaceholder")}
            autoComplete="username"
            className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primario"
          />
          <Boton type="submit" cargando={ocupado} className="w-full">
            {t("seguir")}
          </Boton>
        </form>
      )}

      {paso === "google" && (
        <div className="flex flex-col gap-3">
          {etiqueta(1)}
          <p className="font-display text-lg font-bold text-foreground">{t("googlePregunta")}</p>
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map((v) => (
              <button key={String(v)} type="button" className={opcionClase(google === v)} onClick={() => { setGoogle(v); setPaso("mundos"); }}>
                {v ? t("si") : t("no")}
              </button>
            ))}
          </div>
        </div>
      )}

      {paso === "mundos" && (
        <div className="flex flex-col gap-3">
          {etiqueta(2)}
          <p className="font-display text-lg font-bold text-foreground">{t("mundosPregunta")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {MUNDOS_PAGOS.map((m) => {
              const activo = mundos.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  className={opcionClase(activo)}
                  onClick={() => setMundos((xs) => (activo ? xs.filter((x) => x !== m) : xs.length < 2 ? [...xs, m] : xs))}
                >
                  {tMundos(m)}
                </button>
              );
            })}
          </div>
          <Boton disabled={mundos.length !== 2} onClick={() => setPaso("correo")} className="w-full">
            {t("seguir")}
          </Boton>
        </div>
      )}

      {paso === "correo" && (
        <div className="flex flex-col gap-3">
          {etiqueta(3)}
          <p className="font-display text-lg font-bold text-foreground">{t("correoPregunta", { usuario })}</p>
          {opciones.map((o) => (
            <button key={o} type="button" disabled={ocupado} className={opcionClase(false)} onClick={() => verificar(o)}>
              <span className="font-mono">{o}</span>
            </button>
          ))}
        </div>
      )}

      {paso === "nueva" && (
        <form onSubmit={cambiar} className="flex flex-col gap-3">
          <p className="font-display text-lg font-bold text-foreground">{t("nuevaTitulo")}</p>
          <CampoPassword value={password} onChange={setPassword} placeholder={t("nueva")} autoComplete="new-password" />
          <CampoPassword value={confirmar} onChange={setConfirmar} placeholder={t("repetir")} autoComplete="new-password" />
          <Boton type="submit" cargando={ocupado} className="w-full">
            {t("guardar")}
          </Boton>
        </form>
      )}

      {paso === "listo" && (
        <div className="flex flex-col gap-3">
          <p className="rounded-xl bg-correcto/15 px-4 py-3 text-sm text-foreground">{t("listo")}</p>
          <Link href="/login" className="text-center font-display font-bold text-primario hover:underline">
            {t("irALogin")}
          </Link>
        </div>
      )}

      {paso === "bloqueada" && (
        <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-foreground">{t("bloqueada", { correo: soporte })}</p>
      )}

      {aviso && <p className="text-sm text-error">{aviso}</p>}
    </div>
  );
}

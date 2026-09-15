"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";

export default function LeadColegioForm() {
  const t = useTranslations("Docentes.formulario");
  const [nombreColegio, setNombreColegio] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [numEstudiantes, setNumEstudiantes] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/leads-colegios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreColegio,
          nombreContacto,
          email,
          telefono: telefono || undefined,
          numEstudiantesAprox: numEstudiantes ? Number(numEstudiantes) : undefined,
          mensaje: mensaje || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("errorGenerico"));
        return;
      }
      setEnviado(true);
    } catch {
      setError(t("errorConexion"));
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div id="contacto" className="rounded-2xl border border-correcto/30 bg-correcto/10 px-6 py-8 text-center">
        <p className="font-display text-lg font-bold text-foreground">{t("gracias")}</p>
        <p className="mt-1 text-sm text-texto-secundario">{t("graciasDescripcion")}</p>
      </div>
    );
  }

  return (
    <form id="contacto" onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-6 py-6">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
        <p className="text-sm text-texto-secundario">{t("subtitulo")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo label={t("nombreColegio")} required>
          <input
            value={nombreColegio}
            onChange={(e) => setNombreColegio(e.target.value)}
            required
            minLength={2}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
          />
        </Campo>
        <Campo label={t("nombreContacto")} required>
          <input
            value={nombreContacto}
            onChange={(e) => setNombreContacto(e.target.value)}
            required
            minLength={2}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
          />
        </Campo>
        <Campo label={t("email")} required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
          />
        </Campo>
        <Campo label={t("telefono")}>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
          />
        </Campo>
        <Campo label={t("numEstudiantes")}>
          <input
            type="number"
            min={1}
            value={numEstudiantes}
            onChange={(e) => setNumEstudiantes(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
          />
        </Campo>
      </div>

      <Campo label={t("mensaje")}>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primario"
        />
      </Campo>

      {error && <p className="text-sm text-error">{error}</p>}

      <Boton type="submit" cargando={enviando} className="self-start px-5 py-2.5 text-sm">
        {t("enviar")}
      </Boton>
    </form>
  );
}

function Campo({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-texto-secundario">
        {label}
        {required && " *"}
      </span>
      {children}
    </label>
  );
}

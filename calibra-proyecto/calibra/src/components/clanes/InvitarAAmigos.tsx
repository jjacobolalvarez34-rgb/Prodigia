"use client";

// Sección "Invitar amigos" dentro de MiClanView (ClanesClient.tsx) —
// solo visible para fundador/guía (0140_invitar_a_clan.sql). La lista
// de amigos invitables se resuelve en el server (amigos_invitables_a_mi_clan:
// ya filtra a los que están en otro clan o tienen una invitación
// pendiente al mío) para no tener que replicar ese filtro acá.
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";

interface AmigoInvitable {
  user_id: string;
  display_name: string | null;
}

export default function InvitarAAmigos() {
  const t = useTranslations("Clanes.invitarAmigos");
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [amigos, setAmigos] = useState<AmigoInvitable[] | null>(null);
  const [invitandoId, setInvitandoId] = useState<string | null>(null);
  const [invitadosIds, setInvitadosIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto || amigos !== null) return;
    setCargando(true);
    const supabase = createClient();
    supabase.rpc("amigos_invitables_a_mi_clan").then(({ data, error: err }) => {
      setCargando(false);
      if (err) {
        setError(err.message);
        return;
      }
      setAmigos((data as AmigoInvitable[] | null) ?? []);
    });
  }, [abierto, amigos]);

  async function invitar(userId: string) {
    setInvitandoId(userId);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.rpc("invitar_a_clan", { p_user_id: userId });
    setInvitandoId(null);
    if (err) {
      setError(err.message);
      return;
    }
    setInvitadosIds((prev) => new Set(prev).add(userId));
  }

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{t("titulo")}</span>
        <span className="text-texto-secundario">{abierto ? "−" : "+"}</span>
      </button>
      {abierto && (
        <div className="flex flex-col gap-2 border-t border-border px-5 py-4">
          {cargando && <p className="text-xs text-texto-secundario">{t("cargando")}</p>}
          {error && <p className="text-xs text-error">{error}</p>}
          {!cargando && amigos !== null && amigos.length === 0 && (
            <p className="text-xs text-texto-secundario">{t("sinAmigosInvitables")}</p>
          )}
          {amigos?.map((a) => {
            const yaInvitado = invitadosIds.has(a.user_id);
            return (
              <div key={a.user_id} className="flex items-center gap-3 rounded-xl bg-background px-3.5 py-2.5">
                <Avatar url={null} nombre={a.display_name} size={28} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {a.display_name ?? t("jugadorDefault")}
                </span>
                <button
                  type="button"
                  onClick={() => invitar(a.user_id)}
                  disabled={invitandoId === a.user_id || yaInvitado}
                  className="shrink-0 rounded-lg border border-primario/40 px-3 py-1.5 text-xs font-semibold text-primario transition-colors hover:bg-primario/10 disabled:cursor-not-allowed disabled:border-border disabled:text-texto-secundario disabled:hover:bg-transparent"
                >
                  {yaInvitado ? t("invitada") : invitandoId === a.user_id ? t("invitando") : t("invitar")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

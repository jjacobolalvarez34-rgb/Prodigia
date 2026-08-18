"use client";

import { useState } from "react";
import { IconOjo, IconOjoTachado } from "@/components/icons";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  autoFocus?: boolean;
}

// Campo de contraseña con mostrar/ocultar, compartido por los 4 lugares
// donde se escribe una contraseña (login, registro, nueva contraseña
// de /auth/actualizar-password, y ConvertirCuenta) — un solo componente,
// no el mismo botón-ojo copiado a mano en cada formulario. Cada
// instancia tiene su propio estado de "visible" — mostrar la de arriba
// no muestra también la de abajo en los formularios con 2 campos.
export default function CampoPassword({ value, onChange, placeholder, autoComplete, minLength = 6, autoFocus }: Props) {
  const [verPassword, setVerPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={verPassword ? "text" : "password"}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-11 text-foreground outline-none focus:border-primario"
      />
      <button
        type="button"
        onClick={() => setVerPassword((v) => !v)}
        aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={verPassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-secundario transition-colors hover:text-foreground"
      >
        {verPassword ? <IconOjoTachado className="h-4.5 w-4.5" /> : <IconOjo className="h-4.5 w-4.5" />}
      </button>
    </div>
  );
}

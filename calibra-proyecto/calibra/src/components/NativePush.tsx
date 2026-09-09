"use client";

// Registro y manejo de notificaciones push SOLO dentro de la app nativa
// (Capacitor). Es 100% inerte en la web/PWA: devuelve null y no hace
// nada salvo que estemos corriendo adentro del WebView nativo
// (`Capacitor.isNativePlatform()`).
//
// Qué hace acá (la parte del dispositivo):
//   1. Pide permiso y registra el dispositivo en FCM.
//   2. Guarda el token FCM por usuario en Supabase (device_push_tokens,
//      migración 0114) para que las Edge Functions puedan enviarle push
//      (racha en riesgo / duelo recibido / mensaje de clan).
//   3. Al tocar una notificación, navega a la pantalla indicada en data.url.
//
// No toca lógica de negocio ni componentes existentes: se monta de forma
// aditiva en el layout raíz, igual que NotificacionesDuelo.

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { createClient } from "@/lib/supabase/client";

export default function NativePush() {
  const router = useRouter();
  const registradoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let activo = true;
    const supabase = createClient();
    const plataforma = Capacitor.getPlatform() === "ios" ? "ios" : "android";

    // Al tocar una notificación, navegamos al destino que viaja en data.url.
    const tapListener = PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        const url = notification.notification.data?.url as string | undefined;
        if (url) router.push(url);
      }
    );

    // Guarda el token del dispositivo en la base (dedupe por token).
    const registrar = async (token: string) => {
      if (!activo || registradoRef.current === token) return;
      registradoRef.current = token;
      try {
        await supabase.rpc("registrar_push_token", { p_token: token, p_platform: plataforma });
      } catch (e) {
        console.error("[push] no se pudo guardar el token", e);
      }
    };

    // Registra el dispositivo solo si hay un usuario real (no invitado).
    const registrarSiHayUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.is_anonymous) return;
      try {
        const permiso = await PushNotifications.requestPermissions();
        if (permiso.receive === "denied") return;
        await PushNotifications.register();
      } catch (e) {
        console.error("[push] no se pudo registrar el dispositivo", e);
      }
    };

    const registrationListener = PushNotifications.addListener("registration", (res) => {
      if (res.value) void registrar(res.value);
    });

    const errorListener = PushNotifications.addListener("registrationError", (err) => {
      console.error("[push] error de registro FCM", err.error);
    });

    // INITIAL_SESSION ya trae la sesión persistida al montar; SIGNED_IN
    // cubre el login posterior. Un solo camino de registro -> sin duplicados.
    const { data: authSub } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if ((evento === "INITIAL_SESSION" || evento === "SIGNED_IN") && sesion?.user && !sesion.user.is_anonymous) {
        void registrarSiHayUsuario();
      } else if (evento === "SIGNED_OUT") {
        registradoRef.current = null;
      }
    });

    return () => {
      activo = false;
      authSub.subscription.unsubscribe();
      void tapListener.then((l) => l.remove());
      void registrationListener.then((l) => l.remove());
      void errorListener.then((l) => l.remove());
    };
  }, [router]);

  return null;
}

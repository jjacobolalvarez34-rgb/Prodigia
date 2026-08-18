import type { AuthError } from "@supabase/supabase-js";

// Fase V3: antes, cualquier error de Supabase Auth (signUp, login,
// recuperar contraseña, actualizar contraseña, convertir cuenta de
// invitado) caía en un mensaje genérico ("Probá de nuevo") sin importar
// la causa real — así fue como el bug de "no pudimos enviar el enlace"
// quedó sin diagnosticar durante toda una sesión: no había forma de ver,
// ni en pantalla ni en el log, CUÁL de las variantes de error de
// Supabase se estaba disparando. Esto centraliza el mapeo de los
// códigos reales de Supabase Auth (https://supabase.com/docs/guides/auth/debugging/error-codes)
// a mensajes en español, y siempre deja el código real en la consola
// del navegador para la próxima vez que haga falta diagnosticar algo.
export function mensajeErrorAuth(error: AuthError, mensajeGenerico: string): string {
  console.error(`[auth] code=${error.code ?? "?"} status=${error.status ?? "?"}`, error.message, error);

  switch (error.code) {
    case "email_exists":
    case "user_already_exists":
      return "Ya existe una cuenta con ese email.";
    case "invalid_credentials":
      return "Email o contraseña incorrectos.";
    case "over_email_send_rate_limit":
      return "Estamos mandando muchos emails ahora mismo — probá de nuevo en unos minutos.";
    case "over_request_rate_limit":
      return "Demasiados intentos seguidos — esperá un minuto y probá de nuevo.";
    case "email_address_not_authorized":
      // Pasa cuando el proyecto todavía usa el SMTP por defecto de
      // Supabase, que solo manda emails a integrantes de la organización
      // del proyecto — no es un problema del usuario, es de
      // configuración (falta un proveedor SMTP propio).
      return "El correo del proyecto todavía no puede mandar a esta dirección — es un tema de configuración, avisale a quien administra Prodigia.";
    case "email_provider_disabled":
    case "signup_disabled":
      return "Esta acción está temporalmente desactivada. Probá más tarde.";
    case "email_address_invalid":
      return "Ese email no es válido.";
    case "same_password":
      return "Esa ya es tu contraseña actual — elegí una distinta.";
    case "otp_expired":
      return "El enlace venció — pedí uno nuevo.";
    case "weak_password":
      return "Esa contraseña es muy débil — probá con una más larga o menos común.";
    case "captcha_failed":
      // El código de este proyecto nunca manda un captchaToken en
      // ninguna llamada de auth — si esto aparece, es porque "Bot and
      // Abuse Protection" (CAPTCHA) está habilitado en el dashboard de
      // Supabase sin que el cliente lo soporte. Bloquea TODO: login,
      // signup, invitado, recuperar contraseña, por igual.
      return "El proyecto tiene una protección anti-bot activada que esta app todavía no soporta — hay que desactivarla en Supabase → Authentication → Settings.";
    default:
      return mensajeGenerico;
  }
}

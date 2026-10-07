import { Redirect } from "expo-router";

// Vuelta del inicio de sesión con Google (prodigia://auth). La sesión la toma
// entrarConGoogle() en lib/bienvenida.ts; esta ruta solo existe para que el enlace
// no caiga en "pantalla no encontrada".
export default function VueltaAuth() {
  return <Redirect href="/" />;
}

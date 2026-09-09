import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prodigia.app',
  appName: 'Prodigia',
  webDir: 'out',
  server: {
    // La app NO empaqueta el sitio: es un contenedor nativo que carga en
    // vivo la web real desplegada en Vercel (el proyecto tiene lógica de
    // servidor real — rutas API, auth con Supabase — así que no se puede
    // exportar como estático).
    url: 'https://prodigia-sandy.vercel.app',
    androidScheme: 'https',
    // El hostname real viene de Vercel; claro keepUserAgent para que la
    // web distinga correctamente plataforma si lo necesita.
    cleartext: false
  },
  android: {
    // Corre sobre https (prodigia-sandy.vercel.app) con androidScheme https;
    // mantener allowMixedContent en false para no bajar la seguridad del
    // WebView a propósito.
    allowMixedContent: false
  }
};

export default config;

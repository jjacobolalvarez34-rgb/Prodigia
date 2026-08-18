import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import DeteccionConexion from "@/components/DeteccionConexion";
import PageFade from "@/components/PageFade";
import ChispaClick from "@/components/ChispaClick";
import NotificacionesDuelo from "@/components/NotificacionesDuelo";
import RegistrarServiceWorker from "@/components/RegistrarServiceWorker";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  // Google Fonts no distribuye un corte estático 900 de Space Grotesk
  // (next/font/google ni lo tipa como opción para esta familia) — los
  // usos de font-black en momentos de celebración (Fase E2) dependen del
  // font-synthesis del navegador sobre este 700, no de un archivo Black
  // real. Sigue siendo notablemente más pesado que el resto de la UI.
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Prodigia", template: "%s — Prodigia" },
  description: "Práctica adaptativa de cálculo mental y lógica: dificultad que se ajusta a tu nivel.",
  openGraph: {
    title: "Prodigia",
    description: "Práctica adaptativa de cálculo mental y lógica: dificultad que se ajusta a tu nivel.",
    siteName: "Prodigia",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prodigia",
    description: "Práctica adaptativa de cálculo mental y lógica: dificultad que se ajusta a tu nivel.",
  },
  // PWA (Fase U-PWA): "mobile-web-app-capable" + el título que se usa
  // cuando queda instalada en el home de iOS/Android (sin la barra de
  // direcciones alrededor). app/manifest.ts se enlaza solo, no hace
  // falta declararlo acá.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prodigia",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

// themeColor vive en viewport (no en metadata) desde Next 14 — distinto
// color según el tema del sistema, igual que --primario en globals.css.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6C4CF1" },
    { media: "(prefers-color-scheme: dark)", color: "#7C5CFF" },
  ],
};

// Fija el tema (claro/oscuro) en <html> antes del primer paint, para que no
// haya un flash del tema equivocado mientras React hidrata.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("prodigia-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ChispaClick>
          <PageFade>{children}</PageFade>
        </ChispaClick>
        <DeteccionConexion />
        <NotificacionesDuelo />
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}

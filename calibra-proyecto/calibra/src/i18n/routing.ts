import { defineRouting } from "next-intl/routing";

// "always" prefija también al español (default) — el pedido explícito era
// /es/... y /en/..., no un default sin prefijo.
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

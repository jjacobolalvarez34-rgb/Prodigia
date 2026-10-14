import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    // Revisión 2026-10-14: con la máquina compilando el APK, las pruebas pesadas se
    // caían por tiempo (5 s por defecto).
    testTimeout: 60_000,
  },
});

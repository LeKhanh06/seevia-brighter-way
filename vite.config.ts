import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  server: {
    proxy: { "/api": { target: "http://127.0.0.1:3001", changeOrigin: true } },
  },
  plugins: [
    react({ jsxImportSource: "@seevia/i18n" }),
    {
      name: "seevia-local-jsx-runtime",
      configResolved(config) {
        // This is application source, not a dependency: preserve HMR and one language store.
        config.optimizeDeps.include = config.optimizeDeps.include?.filter(
          (id) => !id.startsWith("@seevia/i18n"),
        );
      },
    },
  ],
  optimizeDeps: {
    exclude: [
      "@seevia/i18n",
      "@seevia/i18n/jsx-runtime",
      "@seevia/i18n/jsx-dev-runtime",
    ],
  },
  resolve: {
    alias: {
      "@seevia/i18n": new URL("./src/i18n", import.meta.url).pathname.replace(
        /^\/([A-Za-z]:)/,
        "$1",
      ),
    },
  },
});

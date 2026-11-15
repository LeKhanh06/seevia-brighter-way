import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cpSync, existsSync, readFileSync, renameSync } from "node:fs";
import { extname, join, normalize } from "node:path";

/** The street simulation in MoPhong/ is a standalone page (three.js from a CDN import map),
 *  so it is served and shipped as-is at /mo-phong/ instead of going through the React bundle. */
const SIMULATION_DIR = new URL("./MoPhong", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SIMULATION_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".hdr": "application/octet-stream",
  ".fbx": "application/octet-stream",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
};
function simulationPage() {
  return {
    name: "seevia-simulation-page",
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { setHeader: (k: string, v: string) => void; end: (b: Buffer) => void; statusCode: number }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?")[0];
        if (path === "/mo-phong") {
          res.statusCode = 301;
          res.setHeader("Location", "/mo-phong/");
          res.end(Buffer.from(""));
          return;
        }
        if (!path.startsWith("/mo-phong/")) return next();
        const rel = path.slice("/mo-phong/".length) || "vision.html";
        const file = normalize(join(SIMULATION_DIR, rel === "index.html" ? "vision.html" : rel));
        if (!file.startsWith(normalize(SIMULATION_DIR)) || !existsSync(file)) return next();
        res.setHeader("Content-Type", SIMULATION_TYPES[extname(file)] ?? "application/octet-stream");
        res.end(readFileSync(file));
      });
    },
    closeBundle() {
      const out = new URL("./dist/mo-phong", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
      cpSync(SIMULATION_DIR, out, { recursive: true });
      renameSync(join(out, "vision.html"), join(out, "index.html"));
    },
  };
}
export default defineConfig({
  server: {
    proxy: { "/api": { target: "http://127.0.0.1:3001", changeOrigin: true } },
  },
  plugins: [
    simulationPage(),
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

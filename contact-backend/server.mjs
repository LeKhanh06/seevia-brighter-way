import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readConfig, validateContact, sendContact } from "./mailgun.mjs";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
export function createContactServer({
  env = process.env,
  fetchImpl = fetch,
  now = Date.now,
} = {}) {
  const config = readConfig(env);
  const allowed = new Set(
    (env.ALLOWED_ORIGIN || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const hits = new Map();
  const windowMs = 10 * 60 * 1000;
  const dist = path.resolve(fileURLToPath(new URL("../dist", import.meta.url)));
  return createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    const json = (status, body) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(body));
    };
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname.startsWith("/api/")) {
      const origin = req.headers.origin;
      let sameOrigin = false;
      try {
        sameOrigin = new URL(origin).host === req.headers.host;
      } catch {
        /* No Origin on server requests. */
      }
      if (origin && !allowed.has(origin) && !sameOrigin)
        return json(403, { ok: false, code: "origin_denied" });
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
      }
      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "600",
        });
        res.end();
        return;
      }
      if (pathname === "/api/contact/status" && req.method === "GET")
        return json(200, { available: config.ready });
      if (pathname !== "/api/contact")
        return json(404, { ok: false, code: "not_found" });
      if (req.method !== "POST")
        return json(405, { ok: false, code: "method_not_allowed" });
      if (!config.ready)
        return json(503, { ok: false, code: "not_configured" });
      if (
        !/^application\/json(?:\s*;|$)/i.test(req.headers["content-type"] || "")
      )
        return json(415, { ok: false, code: "invalid_content_type" });
      const ip =
        env.TRUST_PROXY === "true"
          ? String(req.headers["x-forwarded-for"] || req.socket.remoteAddress)
              .split(",")
              .at(-1)
              .trim()
          : req.socket.remoteAddress;
      const time = now();
      for (const [key, value] of hits)
        if (value.expires <= time) hits.delete(key);
      const hit = hits.get(ip) || { count: 0, expires: time + windowMs };
      hits.set(ip, hit);
      if (++hit.count > 5) {
        res.setHeader(
          "Retry-After",
          String(Math.ceil((hit.expires - time) / 1000)),
        );
        return json(429, { ok: false, code: "rate_limited" });
      }
      const chunks = [];
      let bytes = 0;
      try {
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 16384) {
            json(413, { ok: false, code: "too_large" });
            return;
          }
          chunks.push(chunk);
        }
        const data = validateContact(
          JSON.parse(Buffer.concat(chunks).toString("utf8")),
        );
        if (!data) return json(400, { ok: false, code: "invalid_fields" });
        if (data.website)
          return json(400, { ok: false, code: "invalid_fields" });
        await sendContact(data, config, fetchImpl);
        return json(200, { ok: true });
      } catch (error) {
        if (error instanceof SyntaxError)
          return json(400, { ok: false, code: "invalid_json" });
        console.error(
          "Contact delivery failed",
          /^mailgun_http_\d+$/.test(error.message)
            ? error.message
            : "provider_unavailable",
        );
        return json(502, { ok: false, code: "delivery_failed" });
      }
    }
    if (!["GET", "HEAD"].includes(req.method))
      return json(405, { ok: false, code: "method_not_allowed" });
    try {
      const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
      if (relative.split(/[\\/]/).some((segment) => segment.startsWith(".")))
        return json(404, { ok: false });
      let filename = path.resolve(dist, relative || "index.html");
      if (
        !filename.startsWith(dist + path.sep) &&
        filename !== path.join(dist, "index.html")
      )
        return json(403, { ok: false });
      try {
        if (!(await stat(filename)).isFile()) throw new Error();
      } catch {
        if (path.extname(filename)) return json(404, { ok: false });
        filename = path.join(dist, "index.html");
      }
      const contents = await readFile(filename);
      res.writeHead(200, {
        "Content-Type":
          MIME[path.extname(filename)] || "application/octet-stream",
        "Cache-Control": filename.endsWith("index.html")
          ? "no-cache"
          : "public, max-age=3600",
      });
      res.end(req.method === "HEAD" ? undefined : contents);
    } catch {
      json(404, { ok: false, code: "not_found" });
    }
  });
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 3001);
  createContactServer().listen(port, process.env.HOST || "127.0.0.1", () =>
    console.log(
      `SeeVia backend: http://${process.env.HOST || "127.0.0.1"}:${port}`,
    ),
  );
}

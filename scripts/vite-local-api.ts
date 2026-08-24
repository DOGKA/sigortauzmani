/**
 * Vite, Vercel `api/` fonksiyonlarını kendi başına çalıştırmaz. Yerelde
 * `/api` canlı siteye proxy'leniyordu; Node o host'u çözümleyemeyince
 * (ENOTFOUND) tarayıcı 502 görüyordu. Bu eklenti aynı handler'ları Vite
 * sürecinde yükler; `IO_*` ve `SESSION_SECRET` kök `.env`'den okunur.
 *
 * Canlıya proxy için: `VITE_IO_PROXY_TARGET=https://sigortauzmani.vercel.app`
 */

import { existsSync, readdirSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

const SKIP_REQUEST_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function resolveApiModule(root: string, pathname: string): string | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (!clean.startsWith("/api/")) return null;

  const relative = clean.slice(1);
  const exact = path.resolve(root, `${relative}.ts`);
  if (existsSync(exact)) return exact;

  const parts = relative.split("/");
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    const dir = path.resolve(root, ...parts.slice(0, i));
    if (!existsSync(dir)) continue;
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    const dynamic = names.find((name) => /^\[.+\]\.ts$/.test(name));
    if (dynamic) return path.join(dir, dynamic);
  }
  return null;
}

function requestUrl(req: IncomingMessage): URL {
  const raw = req.url ?? "/";
  if (/^https?:\/\//i.test(raw)) return new URL(raw);
  return new URL(raw, `http://${req.headers.host ?? "localhost:5173"}`);
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const url = requestUrl(req);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || SKIP_REQUEST_HEADERS.has(key.toLowerCase())) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }

  const method = (req.method ?? "GET").toUpperCase();
  const body = await readBody(req);
  const init: RequestInit = { method, headers };
  if (body) {
    init.body = new Uint8Array(body);
  }
  return new Request(url, init);
}

function stripSecure(cookie: string): string {
  return cookie.replace(/;\s*Secure/gi, "");
}

async function writeWebResponse(
  web: Response,
  res: ServerResponse,
): Promise<void> {
  res.statusCode = web.status;
  const cookies =
    typeof web.headers.getSetCookie === "function"
      ? web.headers.getSetCookie().map(stripSecure)
      : [];
  web.headers.forEach((value, key) => {
    if (key === "set-cookie") return;
    res.setHeader(key, value);
  });
  if (cookies.length) res.setHeader("set-cookie", cookies);
  const buffer = Buffer.from(await web.arrayBuffer());
  res.end(buffer);
}

async function dispatch(
  server: ViteDevServer,
  root: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const pathname = requestUrl(req).pathname;
  const modulePath = resolveApiModule(root, pathname);
  if (!modulePath) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Bilinmeyen işlem." }));
    return;
  }

  const loaded = await server.ssrLoadModule(modulePath);
  const handler = loaded.default as unknown;
  if (typeof handler !== "function") {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API işleyicisi yüklenemedi." }));
    return;
  }

  const request = await toWebRequest(req);
  const response = (await handler(request)) as Response;
  await writeWebResponse(response, res);
}

export function localApiPlugin(): Plugin {
  return {
    name: "local-vercel-api",
    configureServer(server) {
      const root = server.config.root;
      server.config.logger.info(
        "yerel /api — api/ fonksiyonları bu süreçte çalışıyor",
      );
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "/").split("?")[0];
        if (!pathname.startsWith("/api/")) {
          next();
          return;
        }
        void dispatch(server, root, req, res).catch((error: unknown) => {
          console.error("[vite] /api hata:", error);
          if (res.headersSent) return;
          res.statusCode = 500;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Yerel API çalıştırılamadı." }));
        });
      });
    },
  };
}

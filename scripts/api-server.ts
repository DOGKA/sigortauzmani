/**
 * Vercel `api/` fonksiyonlarını nginx arkasında çalıştırır.
 *
 * Yerelde aynı işi `scripts/vite-local-api.ts` görür. Canlıda Vite süreci
 * yoktur; nginx statik dosyayı sunar, `/api` isteklerini bu sürece bırakır.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = Number(process.env.PORT ?? 3000);

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

function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    process.env[key] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
}

function resolveApiModule(pathname: string): string | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (!clean.startsWith("/api/")) return null;

  const relative = clean.slice(1);
  const exact = path.resolve(ROOT, `${relative}.ts`);
  if (existsSync(exact)) return exact;

  const parts = relative.split("/");
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    const dir = path.resolve(ROOT, ...parts.slice(0, i));
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
  return new URL(raw, `http://${req.headers.host ?? "localhost"}`);
}

async function readBody(req: IncomingMessage): Promise<Uint8Array | undefined> {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? new Uint8Array(Buffer.concat(chunks)) : undefined;
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
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
  return new Request(requestUrl(req), {
    method,
    headers,
    body,
  });
}

async function writeWebResponse(web: Response, res: ServerResponse) {
  res.statusCode = web.status;
  const cookies =
    typeof web.headers.getSetCookie === "function" ? web.headers.getSetCookie() : [];
  web.headers.forEach((value, key) => {
    if (key === "set-cookie") return;
    res.setHeader(key, value);
  });
  if (cookies.length) res.setHeader("set-cookie", cookies);
  res.end(Buffer.from(await web.arrayBuffer()));
}

async function dispatch(req: IncomingMessage, res: ServerResponse) {
  const modulePath = resolveApiModule(requestUrl(req).pathname);
  if (!modulePath) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Bilinmeyen işlem." }));
    return;
  }

  const loaded = (await import(pathToFileURL(modulePath).href)) as {
    default?: unknown;
  };
  if (typeof loaded.default !== "function") {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API işleyicisi yüklenemedi." }));
    return;
  }

  const response = (await loaded.default(await toWebRequest(req))) as Response;
  await writeWebResponse(response, res);
}

loadEnvFile(path.join(ROOT, ".env"));

createServer((req, res) => {
  void dispatch(req, res).catch((error: unknown) => {
    console.error("[api]", error);
    if (res.headersSent) return;
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "API çalıştırılamadı." }));
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`api ${PORT} portunda`);
});

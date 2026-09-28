/**
 * Tarayıcının beklediği Supabase yollarını sunucudaki PostgreSQL ve
 * dosya klasörüne çevirir. `/sb/rest/v1` PostgREST'e gider, giriş ve
 * belge uçları burada cevaplanır.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { compare } from "bcryptjs";
import { Pool } from "pg";

const BUCKETS = new Set(["iptal-belgeleri", "iletisim-belgeleri"]);
const POSTGREST = process.env.POSTGREST_URL ?? "http://127.0.0.1:3002";

let pool: Pool | null = null;

function db(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL yok.");
    pool = new Pool({ connectionString, max: 4 });
  }
  return pool;
}

function secret(): string {
  const value = process.env.SB_JWT_SECRET;
  if (!value) throw new Error("SB_JWT_SECRET yok.");
  return value;
}

function belgeRoot(): string {
  return process.env.BELGE_ROOT ?? "/var/lib/sigortauzmani/belgeler";
}

function b64url(value: Buffer | string): string {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function b64urlJson(value: unknown): string {
  return b64url(JSON.stringify(value));
}

function signJwt(payload: Record<string, unknown>): string {
  const header = b64urlJson({ alg: "HS256", typ: "JWT" });
  const body = b64urlJson(payload);
  const sig = createHmac("sha256", secret())
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

function readJwt(token: string): Record<string, unknown> | null {
  const [header, body, sig] = token.split(".");
  if (!header || !body || !sig) return null;
  const expected = createHmac("sha256", secret())
    .update(`${header}.${body}`)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Record<
      string,
      unknown
    >;
    const exp = Number(payload.exp);
    if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function bearer(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim();
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readRaw(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function safePath(bucket: string, objectPath: string): string | null {
  if (!BUCKETS.has(bucket)) return null;
  const decoded = decodeURIComponent(objectPath).replaceAll("\\", "/");
  if (!decoded || decoded.includes("\0") || decoded.split("/").includes("..")) return null;
  const root = path.resolve(belgeRoot(), bucket);
  const target = path.resolve(root, decoded);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) return null;
  return target;
}

function userPayload(row: { id: string; email: string }) {
  return {
    id: row.id,
    aud: "authenticated",
    role: "authenticated",
    email: row.email,
    email_confirmed_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
}

function sessionFor(row: { id: string; email: string }) {
  const now = Math.floor(Date.now() / 1000);
  const accessExp = now + 60 * 60;
  const refreshExp = now + 60 * 60 * 24 * 30;
  return {
    access_token: signJwt({
      role: "authenticated",
      sub: row.id,
      email: row.email,
      aud: "authenticated",
      iat: now,
      exp: accessExp,
    }),
    refresh_token: signJwt({
      role: "refresh",
      sub: row.id,
      email: row.email,
      iat: now,
      exp: refreshExp,
    }),
    token_type: "bearer",
    expires_in: 60 * 60,
    expires_at: accessExp,
    user: userPayload(row),
  };
}

async function findUser(email: string) {
  const result = await db().query<{ id: string; email: string; encrypted_password: string }>(
    `select id, email, encrypted_password
     from auth.users
     where lower(email) = lower($1)
     limit 1`,
    [email],
  );
  return result.rows[0] ?? null;
}

async function findUserById(id: string) {
  const result = await db().query<{ id: string; email: string }>(
    `select id, email from auth.users where id = $1 limit 1`,
    [id],
  );
  return result.rows[0] ?? null;
}

async function handleAuth(req: IncomingMessage, res: ServerResponse, pathname: string, search: string) {
  const route = pathname.replace(/^\/sb\/auth\/v1\/?/, "");

  if (req.method === "GET" && (route === "user" || route === "user/")) {
    const token = bearer(req);
    const payload = token ? readJwt(token) : null;
    if (!payload || payload.role !== "authenticated" || typeof payload.sub !== "string") {
      json(res, 401, { message: "Oturum geçersiz.", msg: "Oturum geçersiz." });
      return;
    }
    const user = await findUserById(payload.sub);
    if (!user) {
      json(res, 401, { message: "Oturum geçersiz.", msg: "Oturum geçersiz." });
      return;
    }
    json(res, 200, userPayload(user));
    return;
  }

  if (req.method === "POST" && (route === "logout" || route === "logout/")) {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST" || (route !== "token" && route !== "token/")) {
    json(res, 404, { message: "Bilinmeyen işlem.", msg: "Bilinmeyen işlem." });
    return;
  }

  const raw = await readRaw(req);
  let body: { email?: string; password?: string; refresh_token?: string } = {};
  try {
    body = raw.length ? (JSON.parse(raw.toString("utf8")) as typeof body) : {};
  } catch {
    json(res, 400, { message: "Geçersiz istek.", msg: "Geçersiz istek." });
    return;
  }

  const grant = new URLSearchParams(search).get("grant_type");
  if (grant === "refresh_token") {
    const payload = body.refresh_token ? readJwt(body.refresh_token) : null;
    if (!payload || payload.role !== "refresh" || typeof payload.sub !== "string") {
      json(res, 401, { message: "Invalid login credentials", msg: "Invalid login credentials" });
      return;
    }
    const user = await findUserById(payload.sub);
    if (!user?.email) {
      json(res, 401, { message: "Invalid login credentials", msg: "Invalid login credentials" });
      return;
    }
    json(res, 200, sessionFor(user));
    return;
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const user = email ? await findUser(email) : null;
  const matches =
    user?.encrypted_password && password
      ? await compare(password, user.encrypted_password)
      : false;
  if (!user || !matches) {
    json(res, 400, { message: "Invalid login credentials", msg: "Invalid login credentials" });
    return;
  }
  json(res, 200, sessionFor(user));
}

function signBelge(bucket: string, objectPath: string, exp: number): string {
  return createHmac("sha256", secret())
    .update(`${bucket}/${objectPath}:${exp}`)
    .digest("base64url");
}

async function handleStorage(req: IncomingMessage, res: ServerResponse, pathname: string) {
  const rest = decodeURIComponent(pathname.replace(/^\/sb\/storage\/v1\/?/, ""));
  const tokenUser = bearer(req);
  const payload = tokenUser ? readJwt(tokenUser) : null;
  const role = typeof payload?.role === "string" ? payload.role : "";

  const signed = rest.match(/^object\/sign\/([^/]+)\/(.+)$/);
  if (req.method === "GET" && signed) {
    const bucket = signed[1];
    const objectPath = signed[2].split("?")[0];
    const url = new URL(req.url ?? "/", "http://localhost");
    const exp = Number(url.searchParams.get("exp"));
    const token = url.searchParams.get("token") ?? "";
    const file = safePath(bucket, objectPath);
    if (!file || !Number.isFinite(exp) || exp < Date.now() / 1000) {
      json(res, 400, { message: "Belge bağlantısı geçersiz.", msg: "Belge bağlantısı geçersiz." });
      return;
    }
    const expected = signBelge(bucket, objectPath, exp);
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      json(res, 400, { message: "Belge bağlantısı geçersiz.", msg: "Belge bağlantısı geçersiz." });
      return;
    }
    const data = await readFile(file);
    res.statusCode = 200;
    res.setHeader("content-type", contentType(file));
    res.end(data);
    return;
  }

  const signCreate = rest.match(/^object\/sign\/([^/]+)\/(.+)$/);
  if (req.method === "POST" && signCreate) {
    if (role !== "authenticated" && role !== "service_role") {
      json(res, 401, { message: "Oturum geçersiz.", msg: "Oturum geçersiz." });
      return;
    }
    const bucket = signCreate[1];
    const objectPath = signCreate[2];
    if (!safePath(bucket, objectPath)) {
      json(res, 400, { message: "Belge yolu geçersiz.", msg: "Belge yolu geçersiz." });
      return;
    }
    const raw = await readRaw(req);
    let expiresIn = 600;
    try {
      const body = raw.length
        ? (JSON.parse(raw.toString("utf8")) as { expiresIn?: number })
        : {};
      if (typeof body.expiresIn === "number" && body.expiresIn > 0 && body.expiresIn <= 3600) {
        expiresIn = body.expiresIn;
      }
    } catch {
      // Varsayılan süre.
    }
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const token = signBelge(bucket, objectPath, exp);
    const signedURL =
      `/object/sign/${bucket}/${objectPath.split("/").map(encodeURIComponent).join("/")}` +
      `?token=${token}&exp=${exp}`;
    json(res, 200, { signedURL });
    return;
  }

  const upload = rest.match(/^object\/([^/]+)\/(.+)$/);
  if (req.method === "POST" && upload) {
    if (role !== "anon" && role !== "authenticated" && role !== "service_role") {
      json(res, 401, { message: "Oturum geçersiz.", msg: "Oturum geçersiz." });
      return;
    }
    const bucket = upload[1];
    const objectPath = upload[2];
    const file = safePath(bucket, objectPath);
    if (!file) {
      json(res, 400, { message: "Belge yolu geçersiz.", msg: "Belge yolu geçersiz." });
      return;
    }
    const data = await readRaw(req);
    if (data.length > 10 * 1024 * 1024) {
      json(res, 413, { message: "Dosya boyutu en fazla 10 MB olabilir.", msg: "Dosya boyutu en fazla 10 MB olabilir." });
      return;
    }
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data);
    json(res, 200, { Key: `${bucket}/${objectPath}` });
    return;
  }

  const remove = rest.match(/^object\/([^/]+)$/);
  if (req.method === "DELETE" && remove) {
    if (role !== "authenticated" && role !== "service_role") {
      json(res, 401, { message: "Oturum geçersiz.", msg: "Oturum geçersiz." });
      return;
    }
    const bucket = remove[1];
    const raw = await readRaw(req);
    let prefixes: string[] = [];
    try {
      const body = JSON.parse(raw.toString("utf8")) as { prefixes?: string[] };
      prefixes = Array.isArray(body.prefixes) ? body.prefixes : [];
    } catch {
      json(res, 400, { message: "Geçersiz istek.", msg: "Geçersiz istek." });
      return;
    }
    for (const objectPath of prefixes) {
      const file = safePath(bucket, objectPath);
      if (!file) continue;
      await rm(file, { force: true });
    }
    json(res, 200, []);
    return;
  }

  json(res, 404, { message: "Bilinmeyen işlem.", msg: "Bilinmeyen işlem." });
}

function contentType(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

async function proxyRest(req: IncomingMessage, res: ServerResponse, pathname: string, search: string) {
  const targetPath = pathname.replace(/^\/sb\/rest\/v1/, "") || "/";
  const headers = new Headers();
  for (const name of ["authorization", "content-type", "accept", "prefer", "range"]) {
    const value = req.headers[name];
    if (typeof value === "string") headers.set(name, value);
  }
  const method = (req.method ?? "GET").toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : new Uint8Array(await readRaw(req));
  const response = await fetch(`${POSTGREST}${targetPath}${search}`, { method, headers, body });
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key === "transfer-encoding" || key === "content-encoding") return;
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}

export async function handleSb(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith("/sb/")) return false;

  try {
    if (url.pathname.startsWith("/sb/rest/v1")) {
      await proxyRest(req, res, url.pathname, url.search);
    } else if (url.pathname.startsWith("/sb/auth/")) {
      await handleAuth(req, res, url.pathname, url.search);
    } else if (url.pathname.startsWith("/sb/storage/")) {
      await handleStorage(req, res, url.pathname);
    } else {
      json(res, 404, { message: "Bilinmeyen işlem.", msg: "Bilinmeyen işlem." });
    }
  } catch (error) {
    console.error("[sb]", error);
    if (!res.headersSent) {
      json(res, 500, { message: "İstek tamamlanamadı.", msg: "İstek tamamlanamadı." });
    }
  }
  return true;
}

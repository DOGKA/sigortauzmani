const configuredOrigins = (process.env.ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string) {
  if (configuredOrigins.includes(origin)) return true;
  // Vite dev sunucusu port değiştirebildiği için localhost'un tüm portlarına izin ver.
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

export function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const allowed = isAllowedOrigin(origin)
    ? origin
    : (configuredOrigins[0] ?? "http://localhost:5173");
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

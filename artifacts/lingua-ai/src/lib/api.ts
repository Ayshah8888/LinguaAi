// In production (Vercel), VITE_API_BASE_URL points to the Railway API.
// In Replit dev, we use the proxy path derived from BASE_URL.
const EXTERNAL_API = (import.meta.env as any).VITE_API_BASE_URL as string | undefined;
const BASE = (import.meta.env as any).BASE_URL?.replace(/\/$/, "") ?? "";

export function getApiUrl(path: string): string {
  if (EXTERNAL_API) {
    return `${EXTERNAL_API.replace(/\/$/, "")}/api${path}`;
  }
  const apiBase = BASE.replace(/\/[^/]*$/, "") + "/api";
  return `${apiBase}${path}`;
}

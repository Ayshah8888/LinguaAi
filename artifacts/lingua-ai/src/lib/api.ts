const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export function getApiUrl(path: string): string {
  const apiBase = BASE.replace(/\/[^/]*$/, "") + "/api";
  return `${apiBase}${path}`;
}

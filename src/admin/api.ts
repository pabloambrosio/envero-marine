import type { AstroGlobal } from "astro";

export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number };

export async function adminFetch<T>(
  Astro: AstroGlobal,
  path: string,
): Promise<FetchResult<T>> {
  const cookie = Astro.request.headers.get("cookie") ?? "";
  const url = new URL(path, Astro.url.origin);

  try {
    const response = await fetch(url, {
      headers: cookie ? { cookie } : {},
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0 };
  }
}

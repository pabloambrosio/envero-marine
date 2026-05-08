import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { AstroCookies } from "astro";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const publishableKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_PUBLISHABLE_KEY env vars",
  );
}

export function createSupabaseServerClient({
  request,
  cookies,
}: {
  request: Request;
  cookies: AstroCookies;
}) {
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "").map(
          ({ name, value }) => ({ name, value: value ?? "" }),
        );
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, options);
        }
      },
    },
  });
}

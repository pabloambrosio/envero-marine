export type LogoutResult =
  | { ok: true }
  | { ok: false; error: string };

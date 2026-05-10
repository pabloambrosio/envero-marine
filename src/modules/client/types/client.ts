import { z } from "zod";

// Clients are lead/CRM records: just contact data, no auth, no login.
// The schema is deliberately lax — only `name` is required. Duplicates are
// allowed, since the same person can submit multiple forms across time.
export const CreateClientSchema = z.object({
  name: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().min(1).optional(),
  company_name: z.string().min(1).optional(),
});

export type CreateClientRequest = z.infer<typeof CreateClientSchema>;

export interface AppClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  ip_hash: string | null;
  created_at: string;
}

export type ClientResult =
  | { ok: true; client: AppClient }
  | { ok: false; error: string };

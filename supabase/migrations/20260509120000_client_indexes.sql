-- Indexes for the client (lead) table.
-- Clients are intentionally lax (no unique constraints, duplicates allowed)
-- since they're pure lead data. We rely on indexes to keep the common lookups
-- fast: by email, phone, company_name, name (alphabetical) and created_at
-- (timeline / "recent leads" queries).

create index if not exists idx_client_email on public.client (email);
create index if not exists idx_client_phone on public.client (phone);
create index if not exists idx_client_company_name on public.client (company_name);
create index if not exists idx_client_name on public.client (name);
create index if not exists idx_client_created_at on public.client (created_at desc);

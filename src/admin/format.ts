export function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "—";
  const isoLike = value.length >= 19 ? value.slice(0, 19).replace("T", " ") : value;
  return isoLike;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

export function truncateId(id: string | null | undefined, chars = 8): string {
  if (!id) return "—";
  return id.length > chars ? `${id.slice(0, chars)}…` : id;
}

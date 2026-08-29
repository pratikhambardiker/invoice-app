export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Q";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function formatInvoiceNumber(prefix: string, sequence: number): string {
  const cleanPrefix = prefix.trim() || "INV-";
  return `${cleanPrefix}${String(sequence).padStart(4, "0")}`;
}

export function nextSequenceFromNumber(number: string, prefix: string): number {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = number.trim().match(new RegExp(`^${escaped}(\\d+)$`, "i"));
  if (!match) return NaN;
  return Number(match[1]);
}

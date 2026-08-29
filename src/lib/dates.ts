export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatDate(isoDate: string, locale = "en-GB"): string {
  if (!isoDate) return "—";
  return parseISODate(isoDate).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isPastDue(isoDate: string): boolean {
  if (!isoDate) return false;
  const due = parseISODate(isoDate);
  const today = parseISODate(todayISO());
  return due.getTime() < today.getTime();
}

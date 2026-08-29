import { formatMoney } from "./money";
import type { CurrencyCode } from "./types";

export function addAmount(
  totals: Map<CurrencyCode, number>,
  currency: CurrencyCode,
  amount: number,
) {
  totals.set(currency, (totals.get(currency) ?? 0) + amount);
}

export function formatTotals(
  totals: Map<CurrencyCode, number>,
  fallback: CurrencyCode,
): string {
  if (totals.size === 0) return formatMoney(0, fallback);
  return [...totals.entries()]
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" · ");
}

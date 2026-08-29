import { CURRENCIES, type CurrencyCode } from "./types";

export function currencyLocale(code: CurrencyCode): string {
  return CURRENCIES.find((item) => item.code === code)?.locale ?? "en-US";
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(currencyLocale(currency), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

export function formatMoneyPlain(amount: number, currency: CurrencyCode): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(currencyLocale(currency), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

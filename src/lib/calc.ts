import type { Invoice, LineItem } from "./types";

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
};

export function lineTotal(item: Pick<LineItem, "quantity" | "unitPrice">): number {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  return roundMoney(qty * price);
}

export function calcTotals(
  invoice: Pick<Invoice, "items" | "taxPercent" | "discount">,
): InvoiceTotals {
  const subtotal = roundMoney(
    invoice.items.reduce((sum, item) => sum + lineTotal(item), 0),
  );
  const discount = roundMoney(Math.max(0, Number(invoice.discount) || 0));
  const taxable = roundMoney(Math.max(0, subtotal - discount));
  const tax = roundMoney(taxable * ((Number(invoice.taxPercent) || 0) / 100));
  const total = roundMoney(taxable + tax);
  return { subtotal, discount, taxable, tax, total };
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

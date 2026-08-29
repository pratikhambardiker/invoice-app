import { calcTotals } from "./calc";
import { displayStatus, STATUS_LABEL } from "./status";
import type { Invoice } from "./types";

function cell(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function invoicesToCsv(invoices: Invoice[]): string {
  const header = [
    "Number",
    "Status",
    "Client",
    "Client email",
    "Issue date",
    "Due date",
    "Currency",
    "Subtotal",
    "Discount",
    "Tax",
    "Total",
  ];
  const rows = invoices.map((invoice) => {
    const totals = calcTotals(invoice);
    return [
      invoice.number,
      STATUS_LABEL[displayStatus(invoice)],
      invoice.client.name,
      invoice.client.email,
      invoice.issueDate,
      invoice.dueDate,
      invoice.currency,
      totals.subtotal.toFixed(2),
      totals.discount.toFixed(2),
      totals.tax.toFixed(2),
      totals.total.toFixed(2),
    ].map(cell);
  });
  return [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
